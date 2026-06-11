---
name: avoid-ai-writing
description: Detect and eliminate AI writing patterns. Use this skill whenever writing, editing, or reviewing any prose — especially when asked to "sound more human," "remove AI writing," "edit this," or "make this better." Trigger automatically when you notice your own output contains patterns cataloged here. Function as a constant filter on ALL writing tasks, not just when explicitly requested.
---

# Avoid AI Writing Patterns

Apply this skill as a final-pass filter on all written content. AI writing is detectable not by any single word or pattern but by their accumulation. One "notably" is human. "Notably," "crucially," "importantly," and "significantly" in the same piece is not.

The goal is not to hide AI involvement — it's to produce writing that earns reader trust by sounding like a real person with a point of view.

**On grammar:** Do not use intentionally bad grammar to seem less like AI. Sloppy grammar reads as careless, not human. Good grammar is always the standard. The patterns below are structural, tonal, and lexical — not grammatical.

## How to Use This Skill

**When writing from scratch:** apply the red flags below as a generative constraint. Avoid these patterns while drafting.

**When editing existing copy:** run through each category as a checklist. Flag instances, then rewrite.

**When reviewing your own output:** before delivering any response containing substantial prose, do a quick scan for the top offenders: vocabulary blacklist hits, em dashes, "It's not X, it's Y" constructions, formulaic structure, hedging.

See `references/vocabulary-blacklist.md` for the full word/phrase list with alternates.

---

## Category 1: Vocabulary & Phrasing

### The Core Problem
AI defaults to words and phrases that appear frequently in formal writing but are overused to the point of becoming signals. These words cluster — where you find one, you often find three more.

### Immediate Red Flags (eliminate on sight)

**Action/process words:** delve, delve into, dive into, embark, navigate, harness, leverage (as a verb meaning "use"), foster, cultivate, unlock, unleash, elevate, empower, underscore, unpack, explore, illuminate, elucidate

**Filler adjectives:** meticulous, seamless, robust, comprehensive, dynamic, pivotal, groundbreaking, transformative, innovative, cutting-edge, game-changing, nuanced, multifaceted, intricate, bespoke, tailored

**Filler adverbs:** crucially, importantly, notably, significantly, remarkably, fundamentally, essentially, ultimately, seamlessly, meticulously, relentlessly

**Abstract nouns:** landscape, ecosystem, realm, framework, tapestry, journey, synergy, paradigm, complexities, dynamics, nuances

**Throat-clearing openers:** "In today's [X] landscape...", "In the realm of...", "At its core...", "It's worth noting that...", "It's important to note that...", "Needless to say...", "That said...", "Of course...", "Here's what X is/looks like:", "Here's what's going on:", "Here's the thing:"

**The "Here's what X actually is/looks like" opener (separately, the staging tell):** *"Here's what a 2018 migration actually looked like:"* / *"Here's what IP warm-up actually is."* This is a conversational mask on a textbook reflex — the writer is staging a teach-y "let me explain" turn instead of starting with the content. The "actually" usually rides along, doubling the AI-tell signal. Drop the framing and start with the content. *"Here's what a 2018 migration looked like:"* → *"A 2018 migration looked like this:"*

**Closing-fluff sentences with no information content:** "X is the entire game." "That distinction is the whole article in a sentence." "Knowing which is which matters." "It's that simple." "Everything follows from that." These are AI's way of artificially elevating a claim it just made. They feel profound to write and read as filler. Cut on sight.

**The colon-as-em-dash substitute (subheads and body prose):** When a colon joins two clauses that could each stand on their own, the colon is doing the work an em dash would have done. Em dashes are banned in body prose; the colon substitute is banned in the same places. Two construction patterns to catch:

- **In subheads, banned without exception.** A subhead in the form "X: Y" — where X and Y are separable claims — must be rewritten as a single clause that carries the claim. "Pricing at scale: Mailchimp wins above 5,000 contacts" → "Mailchimp wins above 5,000 contacts as the gap widens." The colon-form looks like a claim but reads as a label-then-payoff staging move.
- **In body sentences, banned when the colon is acting as a mid-sentence pivot.** "Mailchimp tracks behavior: so you send the right message" — same problem. Restructure: "Mailchimp tracks behavior, so you send the right message." Or split into two sentences.

Where colons remain fine:
- **Inside bulleted list items**, where the colon labels and defines (e.g. "**Best for:** B2B teams"). The colon is doing label-work, not pivot-work.
- **Body sentences where the word after the colon is a single load-bearing landing** (per `human-writing/SKILL.md` Principle 7 — "the colon is a declaration, not a list opener"). *"Today, the word community invokes something more intimate: identity."* The colon here introduces a one-word landing, not a second clause.

**The colon-and-claim mini-headline pattern (separately, the rhythm tell):** "The hard rule: cap volume." "Better: pre-approve a library." When this construction is used as the primary rhythm of an article (every section uses it), it reads as AI staging. Once or twice is fine; primary rhythm is the tell.

**Reflexive non-subject sentence openers:** AI prose defaults to opening sentences with verbs, gerunds, and adverbial phrases when a concrete subject was available — and does it reflexively, as the dominant rhythm, not for occasional variation. Three shapes to catch:

- **Verb-first** ("Sign up for MailerLite and the onboarding checklist has two columns." / "Skip the prerequisites and you're paying premium." / "Pick X and Y."). The narrow imperative-and-consequence form is one variant; the broader pattern is any verb opening a sentence that wasn't an actual instruction.
- **Gerund-first** ("Sending starts the learning." / "Buying from you doesn't mean someone opted in." / "Knowing which is which matters."). Gerunds make abstractions the subject when a person was available.
- **Adverbial-phrase-first as default** ("Three months later, they build a re-engagement sequence." / "Six months ago, you added 800 contacts." / "In practice, the workflow fires."). One adverbial opener in a section is fine; opening every other sentence this way is the rhythm tell.

The fix: default to subject-first sentences. Variation into non-subject openers remains fine when the rhythm calls for it; the pattern to eliminate is the reflexive default. (See the "you-as-default-subject" rule below for the strongest version of this fix.)

**"You" as the default subject (with threshold):** The strongest move against reflexive abstract-noun subjects is to **address the reader directly with "you"**. It puts a concrete actor at the front of the sentence and makes the prose feel personal in the same move.

- *"Sending starts the learning"* → *"You start learning when you send."*
- *"Sign up for MailerLite and the onboarding checklist has two columns"* → *"When you sign up for MailerLite, you see two columns in the onboarding checklist."*
- *"Three months later, they build a re-engagement sequence"* → *"You build a re-engagement sequence three months later"* (when the article is directing the reader) or *"Most senders build a re-engagement sequence three months later"* (when reporting a pattern).

**Threshold to enforce at draft, ai-voice pass, and human-writing pass:** in any directive or explanatory section (how-to procedural sections, comparison "pick X if you..." sections, or any section whose job is to address the reader's situation), at least **40% of sentences should have "you" as their subject**. Below that, the section is drifting into report-mode and the reader is being treated as a third-party observer instead of the actor the article is for.

This threshold does NOT apply to:
- Pure expository or analysis sections (e.g. naming an industry trend, citing a stat across a market)
- Sections quoting named experts (the named expert's quote takes the subject role)
- Sections where the reader is genuinely outside the situation being described

When the threshold is missed, the fix is rarely "find-and-replace 'one' with 'you'." The fix is recognizing where the article describes a thing happening to "users" / "marketers" / "senders" / "they" when it could describe the same thing happening to *you*, and converting.

**The three-sentence-staccato rhythm:** "AI is layer two. Layer one is goal definition. Skip it and you fail." Three or more consecutive short sentences (each under ~60 characters) is an AI default rhythm. Humans write with sentence-length variation. One short punch sentence after a longer paragraph is fine. Three in a row is the pattern.

**Single-sentence-paragraph clustering:** Same idea at paragraph level. AI loves the visual rhythm of standalone single-sentence paragraphs after longer ones. One in a section is good. Three in a row is the pattern.

**Repeated sentence-starters:** AI tends to start consecutive sentences with the same word or phrase ("The X. The Y. The Z." or "AI X. AI Y. AI Z."). If the same opening word appears at the start of 4+ sentences within a 1,000-character window, vary it.

**Research-method residue (long-form pieces only):** Two failure modes here, both reveal the writer is thinking about how the article was assembled rather than what the reader needs.

- **Pre-hoc method residue:** "the SERP", "first page of Google", "Google for [query]", "top-ranked editorial pieces", "top-ranked results", "search results" (when used to refer to other articles rather than as a topic). Reference other publications by name, or use phrases like "most reviewers" / "published comparisons" / "the consensus among reviewers."
- **Post-hoc verification residue:** sentences that explain where data came from after the fact — "Mailchimp pricing is verified from EmailToolTester's 2026 review," "data sourced from X and Y," "cross-checked against Z." These read as the writer showing their work to defend against doubt that the reader didn't have. Verification belongs inline (linked source in the table cell or quote) or in a single short intro before a data block ("Mailchimp's [pricing page](url) and Sender.net's [Constant Contact tracker](url):" — then the table). Footer-style "verified from..." captions belong nowhere in the body prose.

Note: first-person reporting language ("In our research," "We tested," "We found") is fine — that credits the writer's own work and reads as journalism.

**Transition clichés:** "Furthermore," "Moreover," "Additionally," "In addition," "Not only that," used as paragraph starters

**Closing clichés:** "In summary," "In conclusion," "To sum up," "Overall," "Taken together," "At the end of the day"

**The false balance phrase:** "While [X], it's also true that [Y]" — especially when used to soften every strong claim

**Sycophantic openers (never use):** "Great question!", "Absolutely!", "Certainly!", "Of course!", "That's a fascinating point"

**Truth-elevation phrases:** AI reaches for these to signal "you can trust this, unlike the other thing you might have read." They artificially weight a claim that should stand on its own evidence.

- *"honest"* as a modifier — "honest counterweight," "honest accounting," "honest comparison," "the honest version," "the honest take," "honestly," "to be honest," "if I'm being honest," "TBH"
- *"the real story,"* "the real X," "what's really happening," "the real reason," "the real question"
- *"in reality,"* "the reality is," "the truth is," "truth be told," "the simple truth," "the plain truth," "the unvarnished truth"
- *"frankly,"* "candidly," "truthfully," "bluntly," "to put it bluntly," "to be blunt," "to be candid"
- *"genuinely"* and *"truly"* used as truth-weighting adverbs ("the recipe path is genuinely fast," "this is truly the best option"). Different from *"genuine"* used to describe a thing's authenticity in a non-weighting way (rare in marketing prose; assume weighting unless clearly otherwise).
- *"actually"* used to weight a claim ("Mailchimp actually wins on..."). Different from *"actually"* used to correct a misconception ("Actually, the deliverability gap inverted in 2025"), which is fine.
- *"really"* used as a weighting intensifier ("the really hard part," "what really matters"). Different from *"really"* used as a plain intensifier ("she works really hard"), which is fine but weak — prefer cutting.
- *"in fact"* used as truth-weight ("In fact, the curve is real"). Different from *"in fact"* used as a logical pivot to add corroborating evidence ("X is true. In fact, Y is also true"), which is fine.
- Discourse markers that preface "the truth": *"look,"* "here's the thing," "straight up," "for real," "no joke," "I'm not kidding"

If the claim is solid, the truth-elevation is redundant; if it isn't, the truth-elevation is a stand-in for evidence. Cut on sight, then check whether the surrounding claim still holds without it.

**The diagnostic test:** if you can delete the word and the sentence loses no information, only confidence-signal, it was truth-elevation. The confidence should come from the evidence in the next clause, not from the modifier.

**Truth-elevation in section headings — banned without exception.** Section headings carry more weight per word than body prose. A heading like *"What your migration fear is actually remembering"* or *"The four things that actually need to move"* or *"The internal case is where most migrations actually fail"* flags defensiveness in the most-read position of the section. Cut the qualifier: *"What your migration fear remembers."* / *"The four things that need to move."* / *"The internal case is where most migrations fail."*

**Pattern-naming meta-language:** AI defaults to labeling the shape of what's being described instead of just describing it. *"The pattern is X,"* *"The recurring pattern,"* *"The theme is,"* *"The signal is,"* *"What stands out is,"* *"What's interesting is,"* *"The takeaway is."* The meta-label adds an empty analytical layer — real writers describe phenomena and trust the reader to see the pattern.

- ❌ "The recurring pattern in customer research is that buyers want to test the platform before leaving."
- ✓ "Buyers consistently ask to test the platform before leaving."

The information content is identical; the meta-framing was empty.

→ Load `references/vocabulary-blacklist.md` for the extended list with alternates.

---

## Category 2: Sentence Structure

### The Core Problem
AI produces syntactically predictable sentences at a rate humans don't. The tell isn't any one structure — it's repetition of the same structure throughout a piece.

### Patterns to Eliminate

**The participial appendage (X, doing Y)**
AI attaches "-ing" clauses to the end of sentences at 2–5x the rate humans do.
- ❌ "The platform analyzes your data, giving you insight into every campaign."
- ✓ "The platform analyzes your data. You see exactly what's working."

**The "From X to Y" range construction**
Used to suggest breadth. Becomes formulaic immediately.
- ❌ "From small businesses to enterprise teams, ActiveCampaign scales with you."
- ✓ "Whether you're running a five-person operation or a 500-person marketing team, the automation adapts."

**The em dash — avoid entirely in body prose**
The em dash has become the single most recognizable AI punctuation tell. It appears so frequently in AI output that readers have been conditioned to notice it. Even though em dashes are legitimate punctuation, the association is now too strong to use them freely. Treat the em dash as off-limits in all body prose. Use a period, a colon, a comma, or restructure the sentence instead. Em dashes inside verbatim source quotes are preserved.
- ❌ "ActiveCampaign tracks behavior — so you send the right message at the right time."
- ✓ "ActiveCampaign tracks behavior. You send the right message at the right time."
- ❌ "The result — higher open rates and more revenue."
- ✓ "The result is higher open rates and more revenue." (note: replacing the em dash with a colon, "The result: higher open rates and more revenue," is *also* banned per the colon-as-em-dash-substitute rule above; restructure the sentence)

**"It's not X, it's Y" — eliminate entirely (both forms)**
Both the comma-form ("It's not just an email tool, it's a revenue engine.") and the period-split contraction form ("The standard advice isn't wrong. It's structureless.") are the same pattern and equally banned. Readers have seen this construction thousands of times. It signals formula over thought. Make the positive claim directly instead.
- ❌ "It's not just an email tool — it's a revenue engine."
- ❌ "It's not about volume. It's about relevance."
- ❌ "The standard advice isn't wrong. It's structureless."
- ✓ "Email is the front door. The automation behind it is where revenue actually happens."
- ✓ "Relevance beats volume. Every time."

**The uniform paragraph**
AI builds paragraphs with identical structure: topic sentence → support → summary. Every paragraph the same length. No variation.
- Fix: deliberately vary paragraph length. Use one-sentence paragraphs. Use two-sentence paragraphs. Break rhythm intentionally.

**Correlative conjunction overuse**
"Not only... but also," "Both... and," "Either... or" — legitimate constructions AI overuses to signal completeness.

**Burstiness failure**
Human writing has rhythm — short sentences followed by longer ones. AI produces monotonous medium-length sentences throughout.
- Fix: after a long sentence, write a short one. Let it breathe.

**The two-sentence dialectic (cap, not ban)**

A short declarative followed by a short qualifying or inverting sentence with parallel structure. The rhythm is "X is true. Y is also true (but in the opposite direction)."

- ❌ "The fear is accurate about what migration used to cost. It's outdated about what it costs now."
- ❌ "That layer does carry a learning curve. Day-1 doesn't."
- ❌ "The work isn't zero. But none of these four categories is the nightmare the fear assumes."

The seesaw rhythm is satisfying to write and to read, which is exactly why models reach for it as a default cadence. Once per ~2,000 words for genuine emphasis is fine. More than that and the rhythm reads as templated rhetorical scaffolding — every section landing on a tidy little inversion.

**Cap: ≤2 instances per article.** When you catch yourself writing a third:

- Commit to the first sentence and cut the qualification entirely.
- Fold the qualification into a subordinate clause: *"The fear is accurate about what migration used to cost but outdated about what it costs now."*
- Develop the qualification into a full paragraph rather than a one-line counterweight.

The pattern is related to but distinct from "It's not X, it's Y" — both rely on rhetorical inversion. Treat them separately when auditing.

---

## Category 3: Tone & Voice

### The Core Problem
AI's safety training produces a voice that hedges everything, takes no real position, and applies the same neutral register to every topic. It's technically correct but emotionally hollow.

### Patterns to Eliminate

**Hedging every claim**
AI qualifies statements it doesn't need to qualify. Hedging has its place — overuse evacuates authority.
- ❌ "Generally speaking, automation tends to improve efficiency in most cases."
- ✓ "Automation reduces manual work. That's not a maybe."

Hedging words to watch: *generally, typically, often, in many cases, can sometimes, tends to, may, might, could potentially, to some extent*

**False balance**
AI presents "both sides" even when one side is clearly right, or when the content's job is to persuade.
- ❌ "While some marketers prefer manual segmentation, automation offers certain advantages."
- ✓ "Manual segmentation doesn't scale. Automation does."

**The significance stamp**
AI signals importance rather than demonstrating it: "This is a critical development," "This is a significant shift."
- Rule: show why something matters. Don't announce that it matters.

**Emotional flatness**
AI writing is grammatically correct and emotionally inert. It describes situations rather than conveying how they feel. Every piece of copy should have a human register — urgency, wit, empathy, directness, frustration, excitement — something. (See the `human-writing` skill's Emotional Register section for grounding rules — emotional words used without grounding read worse than flat prose.)

**Risk-averse voice**
AI avoids black-and-white statements. Real writers commit. "This doesn't work" is stronger than "This approach may have some limitations."

**Identical voice across all content types**
Emails, ads, blog posts, and social posts should sound different from each other. AI applies one register to all of them. Calibrate tone per format.

---

## Category 4: Formatting & Structure

### The Core Problem
AI defaults to formatted, organized, thorough output — which is often wrong for marketing copy. Structure should serve communication, not demonstrate effort.

### Patterns to Eliminate

**Reflexive bullet points**
AI turns everything into bullets. Bullets fragment ideas that should flow as argument.
- Rule: use bullets only for genuinely list-like content (steps, features, options). If the content is continuous reasoning, write prose.

**Over-sectioning**
AI adds headers to signal organization. In most marketing copy, headers are interruptions.

**The mandatory conclusion summary**
AI ends by restating everything it just said. Most conclusions should be cut or replaced with a single forward-looking statement or CTA.

**The rule-of-3 triplet rhythm in body prose**
AI packages body prose in three-item parallel constructions reflexively, even when the content doesn't have three discrete things. The cadence is the tell: parallel rhythm performed for its own sake. Sub-types to catch:

- **Parallel negations:** *"No paid ads, no agency, no full-time social person."* / *"No mocks, no fixtures, no setup."*
- **Parallel adjectives or possessives:** *"Same wines, same patio, same staff."* / *"your bar, your drinks, your people."*
- **Demonstrative or rhetorical triplets:** *"what was it about that clip, that offer, that hook that made it land?"*
- **Three parallel sentences with matching openers:** *"Some tag a friend. Some book a table. A few become regulars."* / *"You're not hiring a videographer. You're not setting up lights. You're walking through your venue."*
- **Three parallel comma-separated verb or participle phrases doing rhythmic, not enumerative, work:** *"taking reservations, managing staff, and closing out the register."* / *"different rooms, different times of day, different angles."*

**Where triplets are still fine:** bullet lists, tables, literal product enumerations ("Google Sheets + Drive + Gmail"), and concrete deliverable lists where three discrete things genuinely exist (e.g., "Claude writes the headline, caption, and hashtags for each reel" — three actual outputs being introduced). The tell is rhythm in body prose, not count in legitimate enumeration. Ask of each triplet: is the third item doing concrete work or rhythmic work? If rhythmic, cut.

**The fixes:**
- Compress to two beats. *"No paid ads, no agency, no full-time social person"* → *"They weren't running paid ads, and nobody on staff worked on social full-time."*
- Absorb into surrounding prose. Drop one item; integrate the remaining two as a single clause.
- Vary the syntax so the parallel breaks — make the last beat structurally different from the first two.
- If there are genuinely four discrete things, use a four-beat list. Four breaks the cadence; three confirms it.

**The reintroduction trap:** this pattern is unusually easy to reintroduce *while fixing other AI patterns*. The editor reaches for a triplet as a "human" cadence and instead lands on the AI cadence. After any rewrite that touches multi-clause sentences, audit the rewrite for new triplets. Counting triplets is a mechanical check; the editor should do it explicitly rather than trusting the regen to have caught it.

**Uniform paragraph length (the cluster signal)**
Same issue as sentence structure — visual uniformity is an AI tell. Vary paragraph length deliberately. The specific cluster to catch:

- **Three or more consecutive paragraphs of similar length** (within ~20% of each other) is the AI tell, analogous to three-sentence-staccato at the paragraph level. When a section runs paragraph-paragraph-paragraph all clustered around 350–400 chars, the rhythm reads as AI-default even when no individual paragraph breaks any other rule.
- **The 400-char paragraph cap** (per `editor-memory/format.md`) is a *max*, not a *target*. If every paragraph in a section is drifting toward 400 chars, the cap is being treated as a goal — fix the variety, not just the length.
- **Single-sentence paragraphs are encouraged** as landing pads (per `human-writing/SKILL.md` Principle 21). Use them after a long accumulating paragraph to land the conclusion. One per section is good; 3+ in a row is the inverse AI default (per the "Single-sentence-paragraph clustering" rule above), so vary in both directions.

Target distribution across a section: roughly 20–30% short (1 sentence), 50–60% medium (2–4 sentences), 15–25% longer (5–7 sentences). Not a hard quota — a sanity check that catches drift toward uniformity.

**Excessive bold**
AI bolds key phrases throughout to aid skimmability. Heavy bolding in body copy signals AI formatting habits.

---

## Category 5: Substance Gaps

### The Core Problem
AI produces well-structured, confident-sounding prose that, on closer reading, says very little. It describes without specifics, advises without committing, and observes without arguing.

### Patterns to Eliminate

**Vague where specific would land**
AI avoids specific numbers and claims because it might be wrong.
- ❌ "ActiveCampaign helps businesses improve their email marketing performance."
- ✓ "ActiveCampaign customers send emails that land in the inbox 94.2% of the time."

**Generic example syndrome**
AI uses placeholder examples that don't do persuasive work: "For example, a small business might use this to..." Real copy uses real situations, even hypothetical ones that feel lived-in. Hypothetical scenarios need explicit signaling — "Imagine," "Say," "Suppose," "Picture" — at the top of the scene.

**No point of view**
AI observes. Good writing argues. Every piece of copy should have a thesis — something the writer believes that not everyone agrees with. If the content has no opinion, it has no value.

**The "comprehensive" instinct**
AI tries to cover everything. Humans make editorial choices about what to include and what to leave out. Omission is a writing skill. Cut anything that doesn't advance the argument.

**Announcing importance instead of demonstrating it**
"This is a crucial distinction" — just make the distinction. Let the reader feel why it matters.

---

## Quick Audit Checklist

Before finalizing any piece of copy, run these checks:

- [ ] No vocabulary blacklist words (load reference if unsure)
- [ ] No sycophantic opener
- [ ] No "In today's [X] landscape" or equivalent
- [ ] No "It's not X, it's Y" constructions — in any form (comma OR period-split)
- [ ] Two-sentence dialectic capped at ≤2 instances per article
- [ ] No rule-of-3 triplets in body prose (parallel negations, possessives, demonstrative triplets, three parallel sentences with matching openers, three parallel comma-separated phrases doing rhythmic work). Bullet-list and table triplets remain fine.
- [ ] No pattern-naming meta-language ("the pattern is," "the theme is," "what stands out is")
- [ ] No "Here's what X is/looks like" openers
- [ ] No truth-qualifiers ("actually," "real," "genuinely") in section headings
- [ ] No em dashes in body prose (replace with period, colon, comma, or restructure)
- [ ] No participial appendage overuse (X, doing Y)
- [ ] Paragraph lengths vary — no uniform blocks
- [ ] Sentence lengths vary — no monotonous medium-length rhythm
- [ ] Subject-first sentences predominate; reflexive verb-first / gerund-first / adverbial-first openers eliminated
- [ ] No hedging on claims that don't need hedging
- [ ] No "In summary" / "In conclusion" / "Overall" closers
- [ ] Bullet points used only where content is genuinely list-like
- [ ] At least one specific claim, number, or named detail
- [ ] The piece has a discernible point of view
- [ ] Hypothetical scenarios are signaled explicitly
- [ ] Grammar is correct throughout — do not introduce errors to seem less like AI

---

## Reference Files

| File | Contents | When to Load |
|------|----------|--------------|
| `references/vocabulary-blacklist.md` | Full extended word/phrase blacklist with alternates | When doing detailed vocabulary audit or uncertain about a specific word |
</content>
</invoke>