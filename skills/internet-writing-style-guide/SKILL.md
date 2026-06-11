---
name: internet-writing-style-guide
description: >
  Mechanical style rules for articles and blog posts written for the internet. Use whenever
  writing, drafting, or revising an article, blog post, or long-form editorial web content —
  even if the request doesn't explicitly ask for a "style guide." Trigger on any request to
  write a blog post, article, thought leadership piece, explainer, or editorial web content.
  Also trigger when revising existing article drafts for readability. This is a rules-based
  guide focused on sentence construction, paragraph length, scannability, and formatting —
  not strategy, argument, or angle. Apply these rules automatically to every article-style
  output without waiting to be asked.
---

# Internet Writing Style Guide

Rules for articles and blog posts published on the web. Apply every rule below to every article draft by default. These rules are mechanical, not stylistic preferences — the web reading environment (scanning, scrolling, small screens, split attention) demands them.

## Sentences

- **One idea per sentence.** If a sentence contains two ideas joined by "and," "but," or a semicolon, consider splitting it.
- **Default to active voice.** "The team shipped the feature" beats "The feature was shipped by the team." Use passive only when the actor is unknown, irrelevant, or deliberately de-emphasized.
- **Keep subject-verb-object order.** Don't bury the subject behind long introductory clauses. "After reviewing the data from the last four quarters, the team decided…" is harder to parse than "The team reviewed four quarters of data and decided…"
- **Easy to parse on first read.** If a reader has to re-read a sentence to understand it, rewrite it. Test: read the sentence aloud once. If you stumble or lose the thread, revise.
- **Vary sentence length and structure.** Mix short, medium, and the occasional longer sentence. All short sentences feel choppy. All medium-length sentences feel flat. Rhythm comes from variety.
- **Cap most sentences at ~25 words.** Not a hard rule, but sentences longer than that usually carry more than one idea.
- **Avoid more than one comma per sentence** outside of lists. Multiple commas usually signal an overloaded sentence.
- **Front-load the important words.** Readers scan the first few words of every sentence. Put the subject and the point there, not buried behind qualifiers.

## Paragraphs

- **No paragraph longer than four lines** as rendered on the final page. Three lines or fewer is better. This is the primary rule — apply judgment.
- **Mechanical backstop:** any body paragraph longer than 400 characters in the markdown source is almost certainly over the 4-line cap and must be split. Use as a catch-all when the qualitative judgment misses one. The check excludes table rows (lines starting with `|`) and bullet list items (lines starting with `- `), both of which are intentionally allowed to be longer.
- **One idea per paragraph.** When the idea shifts, start a new paragraph — even if the previous one is short.
- **Single-sentence paragraphs are fine** and often useful for emphasis or rhythm.
- **No walls of text.** A paragraph that fills the screen gets skipped entirely.
- **Front-load the paragraph.** The first sentence should carry the main point. Readers who scan will only read the first line.

## Lists and bullets

- **Any inline list of three or more items becomes a bulleted list.** "The platform handles email, SMS, WhatsApp, push notifications, and in-app messaging" is harder to scan than a bulleted list of the same channels.
- **Two-item inline lists stay inline.** Bullets for two items look sparse and break flow unnecessarily.
- **Don't start every bullet with the same word.** Readers skip repetitive opening words. Vary the first word or restructure the list.
- **Keep bullet length consistent within a list.** If three bullets are one line and one is five lines, either expand the short ones or trim the long one.
- **Use parallel grammatical structure.** If one bullet starts with a verb, they all start with a verb. If one is a noun phrase, they all are.
- **Bullets are for scannable lists, not for every piece of information.** If the content is connective prose — reasoning, argument, narrative — keep it in paragraph form. Bullets fragment ideas that belong together.

## Convert parallel prose into structure

The 3-or-more-items rule isn't only for inline lists inside a sentence. It applies whenever the underlying content has parallel structure across paragraphs. Sequential parallel paragraphs are the most-missed slop pattern in long-form content — they look like flowing prose but they're actually a list pretending to be paragraphs.

**Patterns that should default to a list, table, or callout, not prose:**

- **Sequential time / volume / scale series.** "Year 1 ... Year 2 ... Year 3 ..." or "At 500 contacts ... At 5,000 contacts ... At 50,000 contacts ..." or "Tier 1 ... Tier 2 ... Tier 3 ..." → table by default; bulleted list if the items are short.
- **Sequential step series.** "Step 1 ... Step 2 ... Step 3 ..." or "First ... Then ... Finally ..." → numbered list.
- **Parallel "If X → Y" recommendations.** Three or more "If you do X, pick Y" sentences in a row → bulleted list with the situation as the lead and the recommendation in bold.
- **Bold-prefixed sequential paragraphs.** Three or more paragraphs that each begin with a bold lead-in like "**Year one is a wash.**" or "**Real wins:**" are a strong signal the underlying content wants to be a list with the bold leads as bullet starts. Convert by default.
- **Parallel comparison rows.** Any "X does this, Y does that" pattern repeated across 3+ attributes → table, not prose.

**Density rule:** any section that runs 3+ paragraphs in a row without a list, table, blockquote, callout, or heading break is a candidate for restructuring. Long stretches of pure paragraphs are how slop hides in plain sight — each paragraph individually fine, the cumulative effect a wall.

**The reader's experience test:** if a reader scanning the page sees a section that's nothing but paragraph blocks, they will skip it. The 3+ items → bullets rule is really a rule against visual monotony at the section level, not just at the inline-sentence level.

**Per-section visual-break requirement (mandatory for sections >300 words):** every body section over 300 words must contain at least one structural break inside it — a list, a table, a code block, a blockquote, or a labeled callout. The break is part of how the section earns its read; without one, even a perfectly-paragraphed 500-word section reads as a wall. The break usually lives inside the procedural part of a how-to section (the prompt as a code block; the alternatives as a table; the validation steps as something visually distinct from the surrounding prose). The formatting pass enforces this section-by-section, not just on the article overall.

When the outline allocates target words per section, it should also note where the structural break goes ("the prompt example as a code block in the How beat" or "the tool comparison as a table in the Shift beat"). Sections that come into the formatting pass without a planned break will get one inserted; sections that come in with one already in place don't get touched.

## Subheads

- **One subhead roughly every 300 words.** Flexible — but sections longer than that need visual breaks.
- **Subheads tell the story.** A reader who only reads the subheads should understand the arc of the piece. (NN/g calls this the "layer-cake pattern": readers fixate on subheads first, then dip into body text under interesting ones. If your subheads don't carry the argument, scanners leave with nothing.)
- **Subheads are headlines, not labels.** "Measurement" is a label. "Why most teams measure the wrong thing" is a subhead. The second earns the read.
- **Front-load information-carrying words.** F-pattern eye tracking shows readers fixate on the first few words of each subhead and skim the rest. "Why most teams measure the wrong thing" beats "Most teams measure the wrong thing — here's why" because the load-bearing word ("teams") arrives in the first scan.
- **No question subheads unless the piece actually answers a question the reader is asking.** Rhetorical question subheads ("What does this mean for marketers?") are filler.
- **Heading hierarchy:** H2 for major sections; H3 for sub-points within. Avoid H4+ in articles — if you need that depth, split the section.

## TL;DR / above-the-fold

- **First two paragraphs hold the most-important information.** NN/g eye-tracking research is unambiguous: the first two paragraphs of an article get disproportionate attention; everything below is read by a smaller fraction of the audience. Get to the point in those first two paragraphs.
- **Comparison, listicle, deep-dive, and trend pieces require an explicit TL;DR / verdict block at the top.** 2–4 sentences summarizing the article's claim, before the first H2. A reader who only reads the TL;DR should know what the article argues. (Definition pieces don't need a separate TL;DR — the answer-in-the-first-paragraph rule covers it.)
- **The TL;DR commits.** It states the verdict for comparisons, the top pick for listicles, the thesis for trends. A TL;DR that says "we'll explore the tradeoffs" is filler.
- **No "in this article we'll cover."** Replace with the verdict itself. The reader can see the subheads.

## Tables

- **Use a table when comparing 2 or more entities across 3 or more attributes.** Below that threshold, prose is faster to read.
- **Comparison articles must have a comparison table above the fold.** Place it after the TL;DR, before the first H2. The verdict in the TL;DR + the table together let a scanner leave with the answer.
- **Headers carry information, not labels.** "Starting price (10k contacts)" beats "Pricing." Spell out conditions in the header.
- **Cells contain specifics, not adjectives.** "$13/mo" beats "Affordable." "Phone, email, chat (24/7)" beats "Strong support."
- **No empty cells.** If a column doesn't apply, write "N/A" or "—" so the reader knows it's intentional.
- **Mobile reality:** wide tables get clipped or sideways-scrolled on phones. Cap at 4 columns where possible. If a comparison demands more attributes, split into two stacked tables grouped by theme rather than one wide one.
- **Don't use tables for lists.** A single-column "table" is a bulleted list dressed up. Use a bulleted list.

## Blockquotes

- **Blockquotes are reserved for sourced quotes from named humans.** Never quote yourself. Never blockquote a definition or a key sentence for emphasis — that's what bold or callouts are for.
- **Inline-quote anything ≤25 words.** Reserve blockquotes (`> "..."`) for longer pulls or moments where the quote deserves visual weight.
- **Quote longer than ~25 words = blockquote, no exceptions.** A long quote rendered as inline italics inside a paragraph creates a visual wall and breaks reading flow. The pattern `Author writes: *"long quote of 30+ words spanning the full paragraph width..."*` is a formatting failure. Convert to attribution + blockquote on the next line.
- **Every blockquote includes attribution.** Format: `"<quote>" — <Name>, <Role> at <Company>, [<linked source title>](url).` First mention is full; later mentions can shorten.
- **No back-to-back blockquotes.** Two blockquotes in a row break flow and signal padding. Either integrate one into prose or restructure.
- **The quote must say something specific.** Platitudes ("AI is changing how we work") aren't quotes — they're filler with attribution. Quote sentences that take a position or reveal a surprising fact.

## Callout boxes

Use sparingly, at predictable points, with consistent labels:

- **In listicles:** `Best for:`, `Skip if:`, `Watch out for:` — applied uniformly to every item so the reader can scan items in parallel.
- **In how-to and deep-dive pieces:** `Prerequisites:`, `Common failure:`, `Cheaper alternative:` where they earn their place.
- **Format:** short labeled blocks (a bold label + 1–3 lines), not full sub-sections. Visually distinct in the rendered output (rendered as `> **Best for:** ...` blockquotes or styled callouts depending on the CMS).
- **Don't invent callouts ad hoc.** If a callout label appears once in the article, either drop it or apply the same label elsewhere where it fits.

## Words

- **Use the simplest word that works.** "Use" beats "utilize." "Help" beats "facilitate." "Before" beats "prior to."
- **Cut throat-clearing.** "It's important to note that," "In today's world," "As we all know" — delete these openings. Start with the point.
- **Specific beats abstract.** "47% of switchers" beats "a significant portion of switchers." Numbers, names, and concrete details earn trust.
- **No em dashes.** Use commas, parentheses, periods, or colons instead. (See the avoid-ai-writing skill if available.)
- **No filler intensifiers.** "Very," "really," "quite," "truly," "literally" — almost always removable without losing meaning.

## Formatting conventions

- **Numerals for numbers 10 and above**, words for zero through nine — except in headlines, stats, or when a specific number matters (percentages, dollar figures, data points always use numerals).
- **Use % with numerals, not "percent."** "47%" not "47 percent."
- **Hyperlink on the descriptive phrase**, not on "click here" or "this article." Tell the reader what they're clicking.
- **Bold sparingly.** Bold is for the single most important phrase in a paragraph a scanner needs to catch. If half the paragraph is bold, nothing is.
- **Italics for titles, emphasis of a single word, or foreign terms.** Not for whole sentences.

## Openings

- **First sentence earns the second.** The opening must give the reader a reason to keep reading. State the stake, the tension, the surprising claim, or the concrete situation. Do not start with setup, context-setting, or definitions.
- **No "In this post, we'll cover…"** The reader can see the subheads. Get into the content.

## Self-check before finalizing

Run this pass on every article draft before calling it done:

1. Is any paragraph longer than four lines? If yes, split it.
2. Is any inline list three or more items? If yes, bullet it.
3. Does any sentence contain more than one comma outside of a list? If yes, check whether it's overloaded.
4. Are there stretches of 300+ words without a subhead? If yes, add one.
5. Do the subheads, read alone, tell the story?
6. Do subheads front-load information-carrying words (left-edge scannability)?
7. Does the article have a TL;DR / verdict block in the first two paragraphs (where required by content type)?
8. Is there a comparison table above the fold (for comparison pieces)?
9. Does every blockquote attribute a named human with a linked source?
10. Are callout labels applied consistently across parallel sections (e.g., every listicle item has the same set)?
11. Does the opening sentence give a reason to keep reading?
12. Are all bullets in every list parallel in structure?
13. Are there any em dashes? Replace them.
14. Are there any passive-voice sentences that should be active?
15. Does the piece front-load important words at the start of paragraphs and bullets?

---

## Sources for the eye-tracking and scanning rules

The TL;DR placement, layer-cake subhead behavior, and front-load-information-carrying-words rules are grounded in Nielsen Norman Group eye-tracking research:

- [F-Shaped Pattern of Reading on the Web](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/)
- [The Layer-Cake Pattern of Scanning Content on the Web](https://www.nngroup.com/articles/layer-cake-pattern-scanning/)
- [Text Scanning Patterns: Eyetracking Evidence](https://www.nngroup.com/articles/text-scanning-patterns-eyetracking/)
