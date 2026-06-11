#!/usr/bin/env python3
"""Copydesk local server.

Serves the static app AND exposes POST /local/claude, a bridge that runs
prompts through the `claude` CLI in headless print mode. That lets you test
the app against your Claude subscription (Pro/Max) instead of paying API
credits — pick "Local Claude Code" in the app's Settings.

Responses stream back as NDJSON events ({"t":"delta"|"done"|"error"}) so the
app can show live progress while the CLI works.

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
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)

CLAUDE_TIMEOUT_SECONDS = 1500  # deep-edit passes on long drafts can run a while


def claude_path():
    path = shutil.which("claude")
    if not path:
        raise RuntimeError(
            "`claude` CLI not found on PATH. Install Claude Code and log in, "
            "or switch Settings back to the API-key backend."
        )
    return path


# Older CLI versions don't support partial-message streaming; degrade to
# done-only events (no live deltas) rather than failing.
def supports_partial_messages(claude):
    try:
        help_text = subprocess.run(
            [claude, "--help"], capture_output=True, text=True, timeout=20
        ).stdout
        return "--include-partial-messages" in help_text
    except Exception:
        return False


_PARTIAL_OK = None


def run_claude_streaming(req, emit):
    """Run the prompt through `claude -p`, emitting NDJSON progress events."""
    global _PARTIAL_OK
    claude = claude_path()
    if _PARTIAL_OK is None:
        _PARTIAL_OK = supports_partial_messages(claude)

    args = [claude, "-p", "--output-format", "stream-json", "--verbose"]
    if _PARTIAL_OK:
        args.append("--include-partial-messages")

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

    proc = subprocess.Popen(
        args,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    watchdog = threading.Timer(CLAUDE_TIMEOUT_SECONDS, proc.kill)
    watchdog.start()
    result_text = None
    try:
        proc.stdin.write(prompt)
        proc.stdin.close()

        for line in proc.stdout:
            line = line.strip()
            if not line:
                continue
            try:
                ev = json.loads(line)
            except ValueError:
                continue
            if ev.get("type") == "stream_event":
                delta = (ev.get("event") or {}).get("delta") or {}
                if delta.get("type") == "text_delta" and delta.get("text"):
                    emit({"t": "delta", "text": delta["text"]})
            elif ev.get("type") == "result":
                if ev.get("is_error"):
                    raise RuntimeError(ev.get("result") or "claude CLI reported an error")
                result_text = ev.get("result", "")

        proc.wait()
        if proc.returncode != 0:
            detail = (proc.stderr.read() or "").strip()[-800:]
            raise RuntimeError(
                f"claude CLI exited with {proc.returncode}"
                + (f": {detail}" if detail else " (killed after timeout?)")
            )
        if result_text is None:
            raise RuntimeError("claude CLI produced no result")
        emit({"t": "done", "text": result_text})
    finally:
        watchdog.cancel()
        if proc.poll() is None:
            proc.kill()
        if img_path:
            try:
                os.unlink(img_path)
            except OSError:
                pass


class Handler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def end_headers(self):
        # Local dev: never serve stale JS/CSS — a normal reload always picks
        # up the latest code without needing a hard refresh.
        if self.command == "GET":
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def _chunk(self, data: bytes):
        self.wfile.write(f"{len(data):x}\r\n".encode() + data + b"\r\n")
        self.wfile.flush()

    def do_POST(self):
        if self.path != "/local/claude":
            body = json.dumps({"error": "unknown endpoint"}).encode()
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        self.send_response(200)
        self.send_header("Content-Type", "application/x-ndjson")
        self.send_header("Transfer-Encoding", "chunked")
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()

        def emit(obj):
            self._chunk((json.dumps(obj) + "\n").encode())

        try:
            length = int(self.headers.get("Content-Length", 0))
            req = json.loads(self.rfile.read(length))
            run_claude_streaming(req, emit)
        except Exception as e:  # surfaced verbatim in the app's error box
            try:
                emit({"t": "error", "error": str(e)})
            except Exception:
                pass
        finally:
            try:
                self.wfile.write(b"0\r\n\r\n")
                self.wfile.flush()
            except Exception:
                pass

    def log_message(self, fmt, *args):
        # Quiet static-file logs; keep the bridge calls visible.
        if self.command == "POST":
            super().log_message(fmt, *args)


def main():
    args = [a for a in sys.argv[1:] if a != "--no-browser"]
    port = int(args[0]) if args else 8765
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    url = f"http://localhost:{port}"
    print(f"Copydesk running at {url}")
    print("Local Claude Code backend available at POST /local/claude (streaming)")
    print("Press Ctrl+C to stop.")
    if "--no-browser" not in sys.argv:
        import webbrowser
        threading.Timer(0.5, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
