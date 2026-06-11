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


# ---------------------------------------------------------------------------
# Headless pipeline — POST /api/edit
#
# Lets other automations (agents, scripts, workflows) use the editing
# pipeline without the browser UI: draft in, clean copy + change log out.
# Auth: uses ANTHROPIC_API_KEY from the environment when set (direct API,
# structured outputs); otherwise falls back to the `claude` CLI on PATH
# (billed to your Claude subscription).
#
# NOTE: the prompts and schemas below are ports of js/api.js — if you change
# the prompts there, mirror the change here.
# ---------------------------------------------------------------------------

API_MODEL = "claude-opus-4-8"

CLASSIFY_SCHEMA = {
    "type": "object",
    "properties": {
        "document_type": {"type": "string", "description": "One of the provided type ids, or \"other\" if none fit"},
        "confidence": {"type": "string", "enum": ["high", "medium", "low"]},
        "audience": {"type": "string", "description": "Who this piece is written for, in a short phrase"},
        "notes": {"type": "string", "description": "One sentence on what signals drove the classification"},
    },
    "required": ["document_type", "confidence", "audience", "notes"],
    "additionalProperties": False,
}

EDIT_SCHEMA = {
    "type": "object",
    "properties": {
        "edited_text": {"type": "string", "description": "The complete edited piece, in full. Preserve the original formatting conventions (markdown, line breaks, etc.)."},
        "summary": {"type": "string", "description": "Two or three sentences summarizing the overall editorial direction of the changes."},
        "changes": {
            "type": "array",
            "description": "Every meaningful change made, in document order.",
            "items": {
                "type": "object",
                "properties": {
                    "original_excerpt": {"type": "string", "description": "Short verbatim excerpt of the original text that was changed"},
                    "revised_excerpt": {"type": "string", "description": "Short verbatim excerpt of the replacement text (empty string if deleted)"},
                    "rationale": {"type": "string", "description": "Why this change improves the writing, in one or two sentences"},
                    "skill": {"type": "string", "description": "The id of the editing skill that motivated this change"},
                },
                "required": ["original_excerpt", "revised_excerpt", "rationale", "skill"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["edited_text", "summary", "changes"],
    "additionalProperties": False,
}


def load_manifest():
    with open(os.path.join(ROOT, "skills", "manifest.json")) as f:
        return json.load(f)


def skills_for_type(manifest, type_id):
    out = []
    for s in manifest["skills"]:
        applies = s["appliesTo"]
        if applies == "all" or (isinstance(applies, list) and type_id in applies):
            with open(os.path.join(ROOT, s["file"])) as f:
                content = f.read()
            out.append({"id": s["id"], "label": s["label"],
                        "deepEditPass": s.get("deepEditPass"), "content": content})
    return out


def skill_blocks(skills):
    return "\n\n".join(
        f'<skill id="{s["id"]}" name="{s["label"]}">\n{s["content"]}\n</skill>' for s in skills
    )


def classify_system(types):
    type_list = "\n".join(f'- {t["id"]}: {t["description"]}' for t in types)
    return (
        "You classify marketing copy by document type so it can be routed to the right editing skills.\n\n"
        f"Available types:\n{type_list}\n\n"
        'If the piece genuinely fits none of these, use "other". Classify based on structure, intent, and conventions — not just topic.'
    )


def edit_system(type_label, skills):
    return f"""You are a senior marketing copy editor. You are editing a piece classified as: {type_label}.

Apply the editing skills below. Each skill is a set of editorial rules; when you make a change, attribute it to the skill that motivated it (use the skill's id).

{skill_blocks(skills)}

Editing principles:
- Preserve the author's meaning, claims, facts, and voice. You are editing, not rewriting.
- Preserve the original formatting conventions exactly (markdown syntax, headings, line breaks, list structure).
- Make every change for a reason you can articulate. If a sentence is already good, leave it alone.
- Record every meaningful change in the changes array with a short verbatim excerpt of the original, the revision, and the rationale. Group word-level tweaks within one sentence into a single change entry.
- The edited_text field must contain the COMPLETE edited piece from first word to last — never truncate or summarize it."""


def regen_system(type_label, skills, pass_label):
    return f"""You are running the "{pass_label}" editing pass on a piece of marketing copy classified as: {type_label}. This is one pass in a multi-pass pipeline — earlier passes already handled copy, structure, and craft. Your ONLY concern is the editorial territory of the skills below. Do not re-litigate structural or copy decisions from earlier passes.

{skill_blocks(skills)}

Method — full rewrite with retention:
1. First, build a retention inventory of the draft: every fact, statistic, quote, source attribution, link, named entity, and substantive claim. Every item must survive your rewrite — meanings intact, quoted wording verbatim, no attribution lost, no number changed. Losing or altering any inventory item is a failed pass.
2. Rewrite the piece as deeply as the skills require, but only for the concerns they cover. If a sentence is already clean by these skills' standards, leave it alone.
3. Preserve the original formatting conventions exactly (markdown syntax, headings, line breaks, list structure).
4. Do not let the piece grow: the rewrite should be the same length or tighter, never more than ~10% longer.

Record every meaningful change in the changes array with a short verbatim excerpt of the text you received, the revision, and the rationale, attributing each change to the skill id that motivated it. Group word-level tweaks within one sentence into a single change entry. The edited_text field must contain the COMPLETE rewritten piece from first word to last — never truncate or summarize it. The summary should describe this pass's work in one or two sentences."""


def extract_json_obj(text):
    """Tolerant JSON extraction for the CLI path (no schema enforcement)."""
    import re
    m = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    candidate = (m.group(1) if m else text).strip()
    start = candidate.find("{")
    end = candidate.rfind("}")
    if start == -1 or end <= start:
        raise RuntimeError("model returned no JSON object")
    return json.loads(candidate[start:end + 1])


def call_model_api(system, user, schema, api_key):
    """Direct Claude API call (streaming SSE, structured outputs)."""
    import urllib.request
    import urllib.error

    body = json.dumps({
        "model": API_MODEL,
        "max_tokens": 64000,
        "stream": True,
        "thinking": {"type": "adaptive"},
        "system": system,
        "messages": [{"role": "user", "content": user}],
        "output_config": {"format": {"type": "json_schema", "schema": schema}},
    }).encode()
    request = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=body,
        headers={
            "content-type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
        },
    )
    output = []
    stop_reason = None
    try:
        with urllib.request.urlopen(request, timeout=CLAUDE_TIMEOUT_SECONDS) as resp:
            for raw in resp:
                line = raw.decode("utf-8", "replace").strip()
                if not line.startswith("data:"):
                    continue
                try:
                    ev = json.loads(line[5:].strip())
                except ValueError:
                    continue
                etype = ev.get("type")
                if etype == "content_block_delta" and ev.get("delta", {}).get("type") == "text_delta":
                    output.append(ev["delta"]["text"])
                elif etype == "message_delta" and ev.get("delta", {}).get("stop_reason"):
                    stop_reason = ev["delta"]["stop_reason"]
                elif etype == "error":
                    raise RuntimeError(ev.get("error", {}).get("message", "stream error"))
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:500]
        raise RuntimeError(f"Claude API error (HTTP {e.code}): {detail}")
    if stop_reason == "refusal":
        raise RuntimeError("The model declined this request.")
    if stop_reason == "max_tokens":
        raise RuntimeError("The draft is too long for a single pass — split it into sections.")
    return json.loads("".join(output))


def call_model_cli(system, user, schema):
    """Claude Code CLI call (subscription); schema enforced by instruction."""
    claude = claude_path()
    full_system = system + (
        "\n\nOutput requirement: respond with ONLY a single JSON object that matches "
        "this JSON schema exactly — no markdown fences, no commentary before or after:\n"
        + json.dumps(schema)
    )
    proc = subprocess.run(
        [claude, "-p", "--output-format", "json"],
        input=full_system + "\n\n" + user,
        capture_output=True, text=True, timeout=CLAUDE_TIMEOUT_SECONDS,
    )
    if proc.returncode != 0:
        detail = (proc.stderr or proc.stdout or "").strip()[-800:]
        raise RuntimeError(f"claude CLI exited with {proc.returncode}: {detail}")
    envelope = json.loads(proc.stdout)
    if envelope.get("is_error"):
        raise RuntimeError(envelope.get("result") or "claude CLI reported an error")
    return extract_json_obj(envelope.get("result", ""))


def call_model(system, user, schema):
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if api_key:
        return call_model_api(system, user, schema, api_key)
    return call_model_cli(system, user, schema)


def headless_edit(req):
    """The full pipeline: classify (unless type given) → route skills → edit."""
    text = (req.get("text") or "").strip()
    if not text:
        raise ValueError("'text' is required")
    deep = bool(req.get("deep", True))

    manifest = load_manifest()
    types = manifest["types"]
    valid_ids = {t["id"] for t in types}

    type_id = req.get("type")
    classification = None
    if type_id:
        if type_id not in valid_ids:
            raise ValueError(f"unknown type '{type_id}' — valid: {sorted(valid_ids)}")
    else:
        classification = call_model(
            classify_system(types),
            f"Classify this piece of writing:\n\n<draft>\n{text}\n</draft>",
            CLASSIFY_SCHEMA,
        )
        type_id = classification["document_type"]
        if type_id not in valid_ids:
            type_id = "other"
    type_label = next(t["label"] for t in types if t["id"] == type_id)

    skills = skills_for_type(manifest, type_id)

    if deep:
        passes = [
            ("Craft edit", [s for s in skills if not s["deepEditPass"]], False),
            ("AI-voice pass", [s for s in skills if s["deepEditPass"] == "ai-voice"], True),
            ("Human-writing pass", [s for s in skills if s["deepEditPass"] == "human-writing"], True),
        ]
        passes = [p for p in passes if p[1]]
    else:
        passes = [("Edit", skills, False)]

    current = text
    all_changes = []
    summaries = []
    for label, pass_skills, regen in passes:
        system = regen_system(type_label, pass_skills, label) if regen else edit_system(type_label, pass_skills)
        verb = "Run your editing pass on this draft" if regen else "Edit this draft"
        result = call_model(system, f"{verb}:\n\n<draft>\n{current}\n</draft>", EDIT_SCHEMA)
        current = result["edited_text"]
        for c in result["changes"]:
            all_changes.append({**c, "pass": label})
        summaries.append(f'{label}: {result["summary"]}')

    return {
        "edited_text": current,
        "summary": "\n".join(summaries),
        "changes": all_changes,
        "type": {"id": type_id, "label": type_label},
        "classification": classification,
        "deep": deep,
        "skills_applied": [s["label"] for s in skills],
    }


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

    def _send_json(self, status, payload):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path == "/api/edit":
            try:
                length = int(self.headers.get("Content-Length", 0))
                req = json.loads(self.rfile.read(length))
                self._send_json(200, headless_edit(req))
            except ValueError as e:
                self._send_json(400, {"error": str(e)})
            except Exception as e:
                self._send_json(500, {"error": str(e)})
            return

        if self.path != "/local/claude":
            self._send_json(404, {"error": "unknown endpoint"})
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
