# Next steps: getting Copydesk in front of other people

Ordered checklist. Steps 1–3 get it live for people who have their own Anthropic
API keys (teammates, fellow practitioners). Step 5 is the upgrade for sharing
with people who shouldn't need a key.

## 1. Put it on GitHub (~2 minutes)

The repo is already initialized and committed locally. From this folder:

```sh
# One-time: set your git identity if you haven't (the first commit guessed it)
git config --global user.name "Your Name"
git config --global user.email "pianoelias@gmail.com"

# Create the GitHub repo and push (requires the gh CLI, logged in: gh auth login)
gh repo create copydesk --public --source . --push
```

Private repos also work with GitHub Pages on paid GitHub plans; use `--private` then.

## 2. Turn on GitHub Pages (~1 minute)

```sh
gh api repos/{owner}/copydesk/pages -X POST -f "source[branch]=main" -f "source[path]=/"
```

Or in the browser: repo → Settings → Pages → Source: "Deploy from a branch" →
Branch `main`, folder `/ (root)` → Save.

The app goes live at `https://<your-username>.github.io/copydesk/` within a
minute or two. Every future `git push` redeploys automatically — no build step.

Verify: open the URL, open Settings in the app, paste your API key, run a draft
AND a screenshot end-to-end. (This is also the first real end-to-end test of the
vision pipeline — do it before sharing the link.)

## 3. Replace the placeholder skills with your real ones

This is the step that makes the output *yours*. Every file in
`skills/general/` and `skills/types/` is a clearly-marked placeholder.

1. For each of your existing skills, decide: does it apply to **all** marketing
   writing, or specific types?
2. Paste its content into the matching file (or a new file), written as direct
   editorial rules.
3. Register new files in `skills/manifest.json` (`appliesTo: "all"` or
   `["email", "ad-copy", …]`).
4. Run a few known drafts through and check the change rationales cite the
   right skills; tighten skill wording where the model misapplies it.
5. Commit and push — the live site updates itself.

## 4. Tell the first users the two things they need to know

- They need their own Anthropic API key (platform.claude.com → API keys).
  The key is stored only in their browser and sent only to Anthropic.
- Rough cost expectation: a typical email-length edit is a few cents; a
  screenshot run somewhat more (the image + transcription add tokens).

A short note at the top of the README (or a "first run" banner) covers this.

## 5. (When ready) Remove the API-key requirement for visitors

If you want to share with people who won't get their own key, add a tiny proxy
that holds ONE key server-side. The clean path:

1. Create a Vercel account; `npm i -g vercel`.
2. Add `api/claude.js` to this repo — a ~30-line serverless function that
   forwards POST bodies to `https://api.anthropic.com/v1/messages`, attaching
   `process.env.ANTHROPIC_API_KEY`, and streams the response back.
3. In `js/api.js`, change `API_URL` to `/api/claude` and drop the key header
   when running on your domain (keep the BYOK path as a fallback).
4. `vercel deploy`, set `ANTHROPIC_API_KEY` in the Vercel project env vars.
5. **Add abuse controls before sharing the URL publicly** — you're paying for
   every request: at minimum a per-IP rate limit (Vercel KV or Upstash) and a
   max input size; ideally a shared passcode.

Until step 5, the BYOK model is the safe default — there is nothing to leak
and nothing for strangers to spend.

## 6. Optional polish, in rough priority order

- **Custom domain** for the Pages site (repo Settings → Pages → Custom domain).
- **Verification pass**: a second model call that checks the edit didn't alter
  claims/meaning before showing results.
- **Skill toggles** in the UI so users can switch individual skills on/off per run.
- **Section-by-section editing** for drafts that exceed the single-pass limit.
- **Export**: download the annotated screenshot (draw boxes onto a canvas and
  save as PNG) so users can drop it into Slack/docs.
