# Copydesk

A web app that runs marketing copy through an AI editing pipeline built from your own editing skills. Paste a draft, and it:

1. **Classifies** the kind of writing (landing page, email, blog post, social, ad copy, press release, case study)
2. **Routes** to the right skills — general ones (AI-language removal, copywriting fundamentals) always apply; type-specific skills apply only to matching writing
3. **Edits** the draft with Claude, applying those skills
4. **Shows the changes** — a word-level diff with insertions/deletions highlighted, plus a panel explaining why each change was made and which skill motivated it. Click a change card to jump to it in the diff.

It's a static site — no backend, no build step. The app calls the Claude API directly from the browser with your own API key (stored only in your browser's localStorage).

## Run it locally

The skills load via `fetch`, so the app needs to be served over HTTP (opening `index.html` directly from the filesystem won't work):

```sh
cd "Writing App"
python3 -m http.server 8000
```

Open http://localhost:8000, click **⚙ Settings**, paste your Anthropic API key (from [platform.claude.com](https://platform.claude.com)), and paste a draft.

## Deploy to GitHub Pages

```sh
gh repo create copydesk --public --source . --push
gh api repos/{owner}/copydesk/pages -X POST -f "source[branch]=main" -f "source[path]=/"
```

A minute later the app is live at `https://<your-username>.github.io/copydesk/`. Any push to `main` redeploys automatically.

> **Note on the API key:** because this is a static site, each visitor supplies their own Anthropic API key (it never leaves their browser except to call Anthropic directly). That's the right model for a personal tool or a tool shared with teammates who have their own keys. If you later want strangers to use it without keys, add a small serverless proxy (Vercel/Netlify function) that holds one key server-side.

## Plug in your own skills

Skills live in [skills/](skills/) as plain markdown. The current files are **placeholders** — replace their contents with your real skills:

| File | Applies to |
|---|---|
| `skills/general/remove-ai-language.md` | everything |
| `skills/general/copywriting-fundamentals.md` | everything |
| `skills/types/<type>.md` | that writing type only |

The whole markdown file is handed to the editor model as instructions, so write skills as direct editorial rules ("cut X", "prefer Y over Z"), not as descriptions.

To add a new skill or a new writing type, register it in [skills/manifest.json](skills/manifest.json):

```json
{ "id": "my-skill", "label": "My skill", "file": "skills/general/my-skill.md", "appliesTo": "all" }
```

`appliesTo` is either `"all"` or an array of type ids like `["email", "landing-page"]`. New writing types go in the `types` array of the same file — the classifier picks from that list automatically, and you can add a matching type skill.

## How it works

| File | Role |
|---|---|
| [index.html](index.html) | UI shell |
| [js/app.js](js/app.js) | Pipeline orchestration + rendering |
| [js/api.js](js/api.js) | Claude API calls (model: `claude-opus-4-8`). Classification is one small structured-output call; editing is a streaming call returning JSON: the full edited text plus a list of `{original_excerpt, revised_excerpt, rationale, skill}` changes |
| [js/skills.js](js/skills.js) | Loads the manifest and skill markdown |
| [js/diff.js](js/diff.js) | Word-level LCS diff for the highlighted changes view |
| [skills/](skills/) | Your editing skills (markdown + manifest) |

Both API calls use [structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) (`output_config.format` with a JSON schema), so responses are guaranteed parseable. The editing call streams to avoid timeouts on long drafts and runs with adaptive thinking for better editorial judgment.

## Roadmap ideas

- A second "verification" pass that checks the edit didn't change meaning or claims
- Per-skill toggles in the UI (run with/without specific skills)
- Side-by-side view in addition to inline diff
- Handling very long drafts by editing section-by-section
- A serverless proxy mode so visitors don't need their own API key
