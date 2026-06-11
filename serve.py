#!/usr/bin/env python3
"""Copydesk local server.

Serves the static app AND exposes POST /local/claude, a bridge that runs
prompts through the `claude` CLI in headless print mode. That lets you test
the app against your Claude subscription (Pro/Max) instead of paying API
credits — pick "Local Claude Code" in the app's Settings.

Local testing only: the deployed (GitHub Pages) version has no server, so
visitors there use the API-key backend.

Usage:
    python3 serve.py [port]     # default 8765
"""
import base64
import json
import os
import shutil
import subprocess
import sys
import tempfile
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)

CLAUDE_TIMEOUT_SECONDS = 1500  # deep-edit passes on long drafts can run a while


def run_claude(req):
    claude = shutil.which("claude")
    if not claude:
        raise RuntimeError(
            "`claude` CLI not found on PATH. Install Claude Code and log in, "
            "or switch Settings back to the API-key backend."
        )

    args = [claude, "-p", "--output-format", "json"]
    prompt_parts = []
    img_path = None

    image = req.get("image")
    if image:
        suffix = ".jpg" if "jpeg" in image.get("mediaType", "") else ".png"
        fd, img_path = tempfile.mkstemp(prefix="copydesk-", suffix=suffix)
        with os.fdopen(fd, "wb") as f:
            f.write(base64.b64decode(image["base64"]))
        args += ["--allowedTools", "Read"]
        prompt_parts.append(
            f"First, read the image file at {img_path} — it is the screenshot "
            "referenced in the instructions below."
        )

    prompt_parts.append(req["system"])
    prompt_parts.append(req["user"])
    prompt = "\n\n".join(prompt_parts)

    try:
        proc = subprocess.run(
            args,
            input=prompt,
            capture_output=True,
            text=True,
            timeout=CLAUDE_TIMEOUT_SECONDS,
        )
    finally:
        if img_path:
            try:
                os.unlink(img_path)
            except OSError:
                pass

    if proc.returncode != 0:
        detail = (proc.stderr or proc.stdout or "").strip()[-800:]
        raise RuntimeError(f"claude CLI exited with {proc.returncode}: {detail}")

    envelope = json.loads(proc.stdout)
    if envelope.get("is_error"):
        raise RuntimeError(envelope.get("result") or "claude CLI reported an error")
    return envelope.get("result", "")


class Handler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _send_json(self, status, payload):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != "/local/claude":
            self._send_json(404, {"error": "unknown endpoint"})
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
            req = json.loads(self.rfile.read(length))
            text = run_claude(req)
            self._send_json(200, {"text": text})
        except Exception as e:  # surfaced verbatim in the app's error box
            self._send_json(500, {"error": str(e)})

    def log_message(self, fmt, *args):
        # Quiet static-file logs; keep the bridge calls visible.
        if self.command == "POST":
            super().log_message(fmt, *args)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"Copydesk running at http://localhost:{port}")
    print("Local Claude Code backend available at POST /local/claude")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
