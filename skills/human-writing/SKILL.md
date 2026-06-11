---
name: human-writing
description: >
  Sentence-level mechanics from human writers whose prose is distinctively NOT AI-cadenced. A positive
  model — what to reach for instead of what to avoid. Pairs with `avoid-ai-writing` (which is the negative
  filter for what to remove). Load this skill at draft, specificity, POV, and the dedicated human-writing
  editing pass. The principles are the load-bearing part; the examples ground them.
---

# Human Writing

The `avoid-ai-writing` skill catalogs patterns to remove. This skill catalogs patterns to reach for. Both run in the editing flow because removing AI patterns is not the same job as adding human ones — a sentence with no banned phrases can still read as flat AI prose if the sentence-level mechanics underneath are AI-default.

The skill is principle-driven. Examples come from two writers (Sari Azout, Ava of Bookbear Express) whose prose is distinctively human across very different registers — Azout writes argumentative essays about products and culture; Ava writes confessional personal essays about psychology and relationships. The principles transfer because they are principles. The examples show the principles working in real prose, with source URLs cited so the originals are inspectable.

When this skill is loaded for a regen pass, the model's job is to reach for these patterns as it writes — not to apply them mechanically as a checklist, but to use them as the shape its sentences want to take.

---

## Subject-verb construction

This is the load-bearing part. The most reliable signal of AI prose is that subjects are abstract nominalizations doing generic verbs. The most reliable signal of human prose is that subjects are concrete actors doing specific work.

### Principle 1: The subject is a concrete actor, not an abstract noun

Sentences open with a person, a named thing, a specific entity that does something. When the subject is an abstract noun ("the dynamic," "the tendency," "this approach"), the sentence loses its grip on reality.

**Examples:**

> "Scott Belsky coined the term insecurity work to describe work that does not move the ball forward." — *Sari Azout, Check Your Pulse #49*

> "I'm thinking of an old friend, B, whom I loved very much." — *Ava, the disorientation of freedom*

> "Bscly is a life essentials company that recently launched a label with just three unisex garments." — *Sari Azout, Check Your Pulse #54*

In each case the subject is a person or a named thing. The verb is what that subject specifically did. There is no "approach" doing things; there is no "tendency" exhibiting itself.

**The AI default to recognize and replace:**
- "The shift toward institutional skepticism has created..." → name who is skeptical of which institution
- "This dynamic creates..." → name what's actually doing what
- "Such behavior results in..." → name the behavior and the result, both as concrete things

### Principle 2: The verb does specific work

The verb is the load-bearing word in the sentence. AI defaults to generic verbs ("provides," "enables," "creates," "involves," "represents"). Human writers reach for verbs that name a particular action.

**Examples:**

> "Technology doesn't disrupt industries — unhappy customers do." — *Sari Azout, Check Your Pulse #54*

> "I tell myself, *Fuck you, you do know how you want to proceed*." — *Ava, all the way to the bottom*

> "Newsletters are not new; what's new is the power social media has bestowed journalists." — *Sari Azout, Check Your Pulse #51*

"Disrupt" carries economic violence. "Bestowed" carries gift and condescension. These verbs are not interchangeable with "affect" or "give" — they are doing specific argumentative work.

**The AI default to recognize and replace:**
- "Provides users with the ability to..." → just say what users can now do
- "Enables organizations to leverage..." → name the actual action being enabled
- "Plays a key role in..." → name the role

### Principle 3: Pronouns are chosen, not defaulted

"I," "we," "you," and third-person each do specific work. The choice signals the writer's posture toward the material.

- **"I" as self-implication** — the writer is inside the argument, subject to the same forces being analyzed. *"Personally, I don't need more Slack groups." — Sari Azout, Check Your Pulse #58.*
- **"We" as civilizational subject** — naming a structural condition everyone is in, not "you and I the reader and writer." *"We are moving away from a top-down relationship with established institutions." — Sari Azout, Check Your Pulse #51.*
- **"You" as confessional autobiography** — the writer narrates their own experience as if from outside. *"You stop believing in talking about things. You no longer think that confession will save you." — Ava, how to trust yourself.*
- **"You" as direct reader address** (the strongest move for software-marketing editorial) — the article speaks to the reader as the actor in the situation. *"You compare paid plan to paid plan now."* This puts a concrete actor at the front of the sentence and refuses to demote the reader into a third-person observer of "users" or "marketers" or "small businesses." For directive sections (how-to procedures, comparison routing, situation-based recommendations), "you" is the default subject. See `avoid-ai-writing/SKILL.md` for the 40%-of-sentences threshold in directive/explanatory sections.
- **Third-person** — the default reportorial register. Use when the writer is genuinely outside the situation being described (e.g. naming an industry trend, citing a market stat, reporting what named experts said).

The shifts between these pronouns are deliberate, often within a single piece. The shift itself is part of the argument.

### The you-pass audit procedure (for regen passes)

The principle above is the easiest to load and ignore. Loading "you as the strongest default subject" without an enforcement procedure produces drafts that pay lip service to it and revert to third-person reportorial subjects ("marketing managers who…", "most buyers…", "teams that…", "a CFO who asks…"). The pass needs to actually check.

When loaded for a regen pass, run this audit before reporting done:

1. **List every section opener.** Pull the first sentence of every section, including the article opening.
2. **Identify the grammatical subject of each.** Categorize: "you," named human, abstract noun, third-person plural ("marketers," "buyers," "teams"), or generic singular ("a CFO who…", "the marketing manager who…").
3. **For each non-"you" subject, ask: would "you" land harder?** If the section is directing the reader, answering their question, or describing their situation, the answer is almost always yes.
4. **Convert.** *"Marketing managers who know they should switch email platforms often don't."* → *"If you know you should switch email platforms but haven't, you're not alone."* *"Most buyers already know this intuitively."* → *"You probably already know this intuitively."*
5. **Allowed exceptions:** sections describing a class of people who explicitly aren't the reader ("Enterprise teams at 50k+ contacts often…"), sections quoting named experts (the expert's name carries the subject role), pure expository or market-stat sections.

Audit failure pattern: a section opens with "Marketing managers" / "Most buyers" / "Teams that" and the body then never uses "you" either. The opener sets the lens; the rest of the section follows it. Catching the opener is the highest-leverage fix.

The 40% threshold in `avoid-ai-writing/SKILL.md` is the quantitative check; this audit is the qualitative one. Run both.

---

## Sentence length and rhythm

### Principle 4: Long sentences accumulate; short sentences land

Human writers vary sentence length deliberately. The pattern is: a long sentence accumulates via parallel clauses, a sensory list, or a winding observation; then a 4-8 word sentence drops the point with finality.

**Examples:**

> "Turns out, no amount of coffee can help me parent two wonderfully exhausting children, run a fund, work on ongoing consulting projects, this newsletter, and a side project all at once. And it turns out, I'm not alone." — *Sari Azout, Check Your Pulse #49*

> "You meditate with no success, go to yoga class, walk all the way through Golden Gate Park to the ocean and call a Waymo back, slap a boy as he's driving you home, take three grams of shrooms belly down on your bed, read Tolstoy, read Edith Wharton, try to read Shakespeare." — *Ava, how to trust yourself*

> "Writing can reach anyone." — *Sari Azout, Check Your Pulse #52*

The short sentence isn't a summary. It's tonal — confident, blunt, sometimes sad. It works because the long sentence earned it.

**The AI default to recognize and replace:**
- All sentences clustering around medium length (15-25 words) → vary deliberately
- Long sentence followed by another long sentence → drop in a 4-8 word landing
- Short sentence used because the model "ran out of things to say" → the short sentence should be the point of the paragraph, not the absence of content

**The reflexive-punchline trap (related to Principle 4 but distinct):** A clipped landing sentence is powerful because it follows prose that earned it. When nearly every paragraph ends with a 3-7 word declarative kicker, the pattern inverts: the punchline becomes a rhythmic reflex, not a deliberate landing. The reader stops feeling the emphasis and starts noticing the tic. Azout uses short landing sentences sparingly — "Writing can reach anyone." appears once, in a position the surrounding argument built toward. She does not end every paragraph with a clipped declaration. Aim for the same ratio: short landings in the positions that most need finality, not as the default paragraph-close. The other paragraphs end naturally — on a longer sentence, on a clause that points into the next paragraph, on an embedded observation. The absence of a kicker is not a failure; it is what makes the kickers land when they appear.

### Principle 5: Sentence fragments earn their place

A complete sentence is the default; a fragment is the exception that earns emphasis. Used sparingly, a fragment carries more weight than any full sentence could in that position.

**Examples:**

> "And yet." — *Ava, the disorientation of freedom* (a single line, between paragraphs)

> "Imagine seeing life as a series of confrontations stretching out before you. More radically: imagine being *excited* at the prospect of confrontation." — *Ava, conflict is the art of checking underneath the rocks*

The fragment doesn't appear because the writer was sloppy. It appears because no complete sentence could do that work.

---

## Punctuation rhythm

Punctuation is rhythm, not decoration. Each mark does specific work that AI prose tends to flatten or default away from.

### Principle 6: The em-dash performs a mid-sentence pivot

The em-dash holds a contradiction or reframe in a single breath, where AI would split it into two sentences telegraphed by "however."

**Examples:**

> "Technology doesn't disrupt industries — unhappy customers do." — *Sari Azout, Check Your Pulse #54*

> "The best companies don't have access to better technology — they have a better ability to understand people." — *Sari Azout, Check Your Pulse #54*

> "Unlike the Discord communities you're part of, the small groups I'm thinking of have to stay small to survive — they're small by design." — *Sari Azout, Check Your Pulse #58*

A note on em-dash availability in this project: `avoid-ai-writing` bans em-dashes in body prose because their high frequency in AI output has made them detectable as a tell. The Azout patterns above use em-dashes legitimately, but in this project the equivalent move is a colon, period, or restructure. The principle (mid-sentence pivot in one breath) survives the substitution if you use a colon: *"Technology doesn't disrupt industries: unhappy customers do."*

### Principle 7: The colon is a declaration, not a list opener

The colon arrives at a claim with finality. The word or clause after the colon carries the weight; the sentence trusts the landing without explaining why.

**Examples:**

> "Today, the word community invokes something more intimate: identity." — *Sari Azout, Check Your Pulse #58*

> "It bears a resemblance to tribalism, with one big difference: this time, you choose your tribe." — *Sari Azout, Check Your Pulse #58*

> "His skill is investing, but his secret is time." — *Sari Azout, Check Your Pulse #52*

The single word after the colon — "identity," "this time, you choose your tribe," "time" — does not get explained. The trust in the landing is the rhetorical move.

**The AI default:** the colon is used to introduce a list of three roughly-parallel items. The human use here is different: the colon is a drumroll for one specific landing.

### Principle 8: The semicolon holds paired contradictions

The semicolon connects two clauses where the second inverts or complicates the first. Not similar thoughts joined for elegance — opposing ones held in tension.

**Examples:**

> "Newsletters are not new; what's new is the power social media has bestowed journalists." — *Sari Azout, Check Your Pulse #51*

> "Innovations rarely occur when everyone's happy and safe, or when the future looks bright; they happen when people are a little panicked, worried, and when the consequences of not acting quickly are too painful to bear." — *Sari Azout, Check Your Pulse #51*

If a comma or period would work as well, the semicolon is wrong. The semicolon should signal "the next clause is in tension with the previous one, and that tension is the point."

### Principle 9: Comma chains accumulate; parentheses interrupt

Comma chains stack observations as they arrive — the rhythm mimics thinking in real time, not pre-organized output.

> "Fights, frustration, silence, crying. Writing, coaching, matchmaking." — *Ava, how to trust yourself*

> "It seems just as plausible that I could've made up with B and not E, just as plausible I could've made up with both, just as plausible I never heard from either." — *Ava, the disorientation of freedom*

Parentheses interrupt the main sentence with an aside that's its own complete thought — usually a small concession or self-correction that would derail the sentence if written as a clause.

> "A recurring theme in my mom friends group chat is childcare costs (or rather, how it's often cheaper to stay home than pay for childcare)..." — *Sari Azout, Check Your Pulse #58*

The parenthetical signals "this matters but differently — don't let it interrupt the main idea."

---

## Voice and posture

### Principle 10: Specificity is the confidence signal

Strong claims get made through narrowing, not through epistemic adverbs. The shorter and more specific the claim, the more committed the writer is to it. Adverbs like "clearly," "obviously," "importantly," "notably" are the AI substitute for this confidence — and they read as the substitute they are.

**Examples:**

> "His secret is time." — *Sari Azout, Check Your Pulse #52*

> "Marketing is about making soulful bets." — *Sari Azout, Check Your Pulse #52*

> "Love persists even when language doesn't." — *Ava, the disorientation of freedom*

A short specific claim is more confident than a long qualified one. "His secret is time" is more confident than "Compound interest is, clearly, a powerful long-term force."

### Principle 11: State uncertainty about the detail; commit to the thesis

Hedging the main claim is the AI default ("it may be possible that," "this could potentially"). Human writers hedge the detail (process, timing, mechanism) and commit to the underlying claim.

**Examples:**

> "I haven't demo'ed it and I don't know how it works exactly. But I do know that as the boundaries of life and work become more porous and businesses transform into webs of interrelationships between people, we need software that takes new assumptions about group structures to heart." — *Sari Azout, Check Your Pulse #58*

> "I don't know if I'm referring to the limits of language or the limits of character." — *Ava, the disorientation of freedom*

> "It's hard to tell if Presubscribe is mocking Substack or not — but the trend it represents is real." — *Sari Azout, Check Your Pulse #51*

The structure: "I don't know X, but I'm certain about Y." The uncertainty is named precisely, which strengthens the assertion rather than weakening it.

### Principle 12: Self-implication earns the credibility

Authority comes from being inside the argument, not above it. The writer admits they are subject to the same forces they're analyzing.

**Examples:**

> "I craved a place that made me feel alive, excited, human." — *Sari Azout, Issue 1*

> "Personally, I don't need more Slack groups or things to which I belong. What I want is deeper relationships with specific people where I can be more fully myself." — *Sari Azout, Check Your Pulse #58*

> "I love being right more than just about anything else in the world. It's my worst quality—I'm pretty sure that I'm perceptive basically because I so enjoy being correct." — *Ava, all the way to the bottom*

The self-implication isn't an appeal to personal experience as proof. It's a way of saying: "I have skin in this game, and here's what that feels like." AI argues from evidence about "users." Human writers argue from desire — what they actually want, miss, fear, crave.

### Principle 13: Self-deprecation without the apology

When the writer names an unflattering quality, they name it directly and move on. No softening preface. No redemption arc. The confidence behind the admission is itself a character note.

**Examples:**

> "I am, at almost all times, so delusionally confident it would make you scream." — *Ava, all the way to the bottom*

> "I know that's unbecoming of me, but there you go." — *Ava, all the way to the bottom*

> "As a reformed people pleaser myself, I ardently disapprove of them." — *Ava, some things I've learned about dealing with people*

**The AI default:** "I'll admit I sometimes struggle with X, which is why I'm working on it..." Human version: name the flaw, drop it, keep moving.

### Principle 14: Concessions speed the argument up, not slow it down

When the writer grants a counterpoint, the concession is parenthetical or embedded in a single clause — not a parallel "on one hand / on the other hand" structure that performs balance.

**Examples:**

> "You have to trust people to know what's right for them. Well you don't but that's beside the point. First you have to know what's right for you." — *Ava, how to trust yourself*

> "Tribalism gave us strong social bonds, at the expense of quality medical care, excruciating manual labor, and a very narrow definition of shared interests." — *Sari Azout, Check Your Pulse #58* (the cost is inside the same sentence as the benefit)

> "I don't pathologize avoidance itself, because everyone avoids things. Trust me, even the most conflict-happy person needs a week off once in a while." — *Ava, conflict is the art of checking underneath the rocks*

The concession arrives, gets handled, and gets dismissed in motion. It does not sit as a parallel section weighing alternatives.

---

## Emotional register

Even editorial software-company writing — how-tos, comparisons, deep-dives — earns a layer of human feeling. AI-edited prose tends to describe what the reader is doing in functional terms only. Human prose names what the reader is feeling, what something costs them, and what's awkward or annoying about the situation. This isn't decoration. It's the difference between prose that explains a workflow and prose that meets the reader inside the workflow.

**The risk:** emotional words without emotional grounding read worse than flat prose. They feel manipulative or AI-decorative. Every emotional move below has to be earned by a felt reality of the situation — the reader actually IS tempted to skip this; the failure mode actually DOES burn them; the platform behavior actually IS annoying. Reach for these principles where they fit. Don't sprinkle them as seasoning.

### Principle 22: Name the reader's felt state, not just their functional state

Most editorial prose describes what the reader is doing. Human prose names what the reader is feeling, tempted by, or avoiding — usually right before addressing it.

Examples of the move:
- Functional: "Manual sends take longer than automation."
- Felt: "You're going to be tempted to skip the manual sends because they feel inefficient — and your platform's onboarding pushes you toward that instinct."

- Functional: "Setting up automation before sending campaigns is a common mistake."
- Felt: "It feels productive to set up the welcome sequence first. The platform makes it the second thing on the checklist. You'll want to do it. Don't yet."

Look for: the temptations the reader is carrying into the section, the avoidances they've already made, the anxieties they're rationalizing, the justifications they're telling themselves. Name those before the prescription. The prescription lands harder once the reader feels seen.

> "I'm tired of pretending I have an opinion on every news story." — *Sari Azout, Check Your Pulse #58.* The opening doesn't argue; it names a state the reader probably shares before the argument starts.

### Principle 23: Word choice carries temperature

Within editorial limits, choose words that carry feeling where the reality of the situation has feeling. Neutral synonyms exist for almost everything; reaching for them by default neuters the prose.

| Neutered | With temperature |
|---|---|
| inclined | tempted |
| lose | burn |
| suboptimal | annoying |
| undesirable | painful |
| inefficient | wasteful |
| difficult | brutal |
| problematic | bad |
| not ideal | a mess |

Use the temperature word when the felt reality justifies it. "You burn the credibility of the subscribers who flagged you" lands harder than "you lose the credibility." But: "you burn three minutes setting up the form" is wrong because there's no real burn; "you spend three minutes" is honest. The verb's temperature has to match the situation's temperature.

This is the principle most likely to be misapplied. Sub-agents tend to either avoid temperature entirely (producing flat prose) or sprinkle it everywhere (producing manipulative prose). The rule: ask, before each emotional word, "is this what the situation actually feels like?" If yes, use it. If no, the neutral version is correct.

### Principle 24: Stakes are felt cost, not just mechanical cost

When the article names a failure mode, name what it costs the reader in something they care about — not just what mechanically happens.

- Mechanical: "Adding unconsented contacts hurts deliverability."
- Felt cost: "Adding unconsented contacts hurts deliverability — and the cost shows up six months later when your real subscribers stop seeing your emails because Gmail decided you're spam. By then you don't even know which complaints did it."

The mechanical version is correct. The felt-cost version makes the reader feel the consequence in a way they'll remember the rule. Stakes are time, money, credibility, attention, future opportunity. Name which one a given failure mode burns.

Don't moralize. Don't catastrophize. State the cost, in concrete units, the way someone explaining a real consequence would.

### Principle 25: Concessions to messiness are allowed

Editorial AI prose pretends every situation is clean. Human writers admit when something is awkward, annoying, or unfair — usually as a one-line concession before moving on.

- Clean version: "The unsubscribe report is in the platform's reporting section."
- Honest version: "The unsubscribe report is buried three menus deep in the reporting section. It's annoying. You'll need it anyway."

This isn't whining and it isn't padding. It's acknowledging the actual experience the reader is having. The concession lasts one sentence and the prose moves on.

> "Of course, this is messy." — *Ava, on relationships.* One sentence. The mess is acknowledged and the next sentence keeps going.

Use this when the reader is about to encounter something that will frustrate them and you can name it before they hit it. Don't use it to soften every claim — overuse turns it into hedging.

### Principle 26: Register defaults to casual

The project's default register is a knowledgeable colleague over coffee, not an analyst presenting to a board. Contractions throughout, plain-word substitutions for formal vocabulary, no compound prepositions ("in the context of," "by virtue of"). The brief's `Angle` field can override this for a specific article requiring a more formal register — absent that override, casual is the default.

Full rules (substitution table, banned compound prepositions, accessible connectors) live in `editor-memory/emotional-register.md` under "Register: casual by default." Load that file and apply those rules at every regen pass.

---

## Reference and citation

### Principle 15: Names arrive doing argumentative work, not as credentials

When a person, book, or product is cited, the citation immediately performs work in the argument. No biographical preamble. No "[Person], who is known for [biography], argues..." The name functions as a verb: "Belsky coined," "Sutherland argues," "Doyle wrote."

**Examples:**

> "Scott Belsky coined the term insecurity work to describe work that does not move the ball forward, but is quick enough that you can do it multiple times a day without realizing." — *Sari Azout, Check Your Pulse #49*

> "In Alchemy, Rory Sutherland argues that the biggest progress in the next 50 years may come not from improvements in technology but in psychology and design thinking." — *Sari Azout, Check Your Pulse #54*

> "Glennon Doyle: 'Your job throughout your entire life, is to disappoint as many people as it takes to avoid disappointing yourself.'" — *Ava, some things I've learned about dealing with people*

The reference is integrated at the moment it becomes useful. The reader can Google the rest if interested. AI's "According to [Name], a [credential] at [institution]..." is the move to avoid.

### Principle 16: Reference density is high and crosses disciplines

Within a single argument, reach across fields. A VC, a sociologist, an app founder, and a poet can all appear in one paragraph if they're all illuminating the same phenomenon. The eclecticism is itself the signal — it shows the writer arrived at the argument by reading broadly, not by researching narrowly.

The pattern in Azout's pieces: 2-4 named references per substantive paragraph, drawn from different domains. The pattern in Ava's pieces: fewer references per essay (1-3), but each does heavy lifting and is calibrated to exactly what the essay needs.

### Principle 17: Quotes carry weight that surrounding prose can't

A quote is doing its job when the exact wording matters. Not "supporting" a claim the writer already made — performing the claim more sharply than paraphrase could.

**Examples:**

> "In a Founder's Letter worth reading, Nathan Baschez and Dan Shipper write: When you write together, you don't have to publish so often that you risk burning out. Instead, the group can share the load." — *Sari Azout, Check Your Pulse #58*

> "Heather: 'Long-term relationships thrive when you can set aside your shame enough to take responsibility for the storm inside of you...'" — *Ava, the disorientation of freedom*

The quote is framed minimally ("worth reading," or just "Heather:") and then carries the heaviest line in the passage. AI tends to summarize-then-quote, which makes the quote redundant. Better to let the quote do the work.

---

## Transition and paragraph mechanics

### Principle 18: New paragraphs assert a new lens, not a connector

Almost never open a paragraph with "Furthermore," "Additionally," "That said," "In addition," "Not only that." The new paragraph asserts a new angle on the subject. The connection is logical, not signposted.

**Examples (paragraph transitions in Azout):**

> "We still depend on people. [paragraph break] But technology makes these dependencies less tangible..." — *Check Your Pulse #58*

> "The combination of declining trust in established actors and a redefinition of how people gain status is driving momentum toward a new world order. [paragraph break] In short, we are moving away from a top-down relationship..." — *Check Your Pulse #51*

The reader infers the relationship from the content of the new paragraph's first sentence. The paragraph break itself is the transition. Connectors flatten the rhythm and signal that the writer is showing their work rather than carrying the argument forward.

### Principle 19: Open in medias res

Essays open inside the thought, not outside it. The first sentence is a confession, a contradiction, an observation, or someone else's quote — not a context-setting frame.

**Examples:**

> "It's hard to accept the limits of language. I'm thinking of an old friend, B, whom I loved very much..." — *Ava, the disorientation of freedom*

> "I'm having the best writing week I've had in years." — *Ava, conflict is the art of checking underneath the rocks*

> "In one of the most memorable pieces of writing I read last year, David Brooks writes..." — *Sari Azout, Check Your Pulse #58*

The reader is already inside the argument by sentence two. The AI default ("In recent years, X has become increasingly important...") wastes the most-read position in the essay on filler.

### Principle 20: Close by returning to a thread or refusing to resolve

Endings don't summarize. They return to an earlier image, restate the unresolved tension, or hand the question back to the reader.

**Examples:**

> "I'm always going to be scared of what I'll find. I'm always going to look, anyway. That's the way I want to live." — *Ava, all the way to the bottom*

> "Freedom is disorienting because there are no guarantees. I don't know when someone will come back, or if. Half the time I don't know what I'll say, and when. Love persists even when language doesn't." — *Ava, the disorientation of freedom*

> "Because I, too, have been thinking of doing something on my own." — *Sari Azout, Check Your Pulse #49*

The closing is often the quietest sentence in the piece. It commits emotionally, not logically.

### Principle 21: Short paragraphs as landing pads

After a long multi-sentence paragraph that builds an argument, a 1-2 sentence paragraph states the conclusion. The white space gives the reader a place to rest.

This principle works *with* the variety rule in `editor-memory/format.md`: the 400-character paragraph cap is a max, not a target, and visual uniformity across paragraphs is its own AI tell. Single-sentence paragraphs are encouraged as landing pads, but 3+ in a row hits the inverse AI default. Vary in both directions — short landings after long accumulations, medium paragraphs to develop the argument, occasional longer paragraphs for evidence-dense passages.

**Examples:**

> "Writing can reach anyone." (standalone paragraph after a longer setup) — *Sari Azout, Check Your Pulse #52*

> "It's not something we're born into, but something we choose." (standalone after several paragraphs on community evolution) — *Sari Azout, Check Your Pulse #58*

> "And yet." (single-line paragraph) — *Ava, the disorientation of freedom*

The short standalone paragraph is conviction, not transition. AI rarely uses these because it doesn't trust white space to carry meaning.

---

## What to NOT do (the inverse list)

The patterns above describe what to reach for. Some patterns to actively avoid:

- **Topic-sentence paragraphs** that declare the point and then support it. Reverse the structure: build from examples toward the point.
- **False balance** ("On one hand... on the other hand"). Pick a side, then complicate it from inside.
- **Throat-clearing introductions** ("In recent years," "It is important to note that," "In today's [X] landscape"). Delete the throat-clearing; start with the point.
- **Summary-takeaway endings** ("In conclusion," "In summary," "Overall"). End by handing the question back, not by restating the answer.
- **Confidence adverbs** ("clearly," "obviously," "importantly," "notably," "significantly," "fundamentally"). Confidence comes from specificity, not from adverbs.
- **Abstract nominalizations as subjects** ("This dynamic creates," "The tendency toward," "Such behavior results in"). Name the actual person or thing doing the action.
- **Wellness vocabulary** ("journey," "growth," "healing," "transformation," "mindset"). Name the specific change, not the category.
- **Generic verbs** ("provides," "enables," "creates," "involves," "represents"). Reach for verbs that name a specific action.
- **The rule of three when the content doesn't have three** ("clarity, efficiency, and impact"). Use the natural number of items, even if it's two or four.
- **Reflexive paragraph-closing zingers** — every paragraph ending with a 3-7 word declarative kicker ("They don't." / "Sending starts the learning."). Short landing sentences earn their place through scarcity and position. When every paragraph closes this way, the effect is relentless and signals AI editorialist rhythm. ~30% of paragraphs or fewer should close with a punchy landing; the rest end naturally. *(email-marketing-and-automation-small-business _feedback.md item 4, 2026-04-26)*

---

## How this skill is used

**At draft stage:** the model writes reaching for these patterns from the start. Setup beats use specific scenes (Principle 19). Validation explanations use sentence-length variation (Principle 4). Subject-verb construction follows Principles 1-3 throughout.

**At specificity, POV, ai-voice editing passes:** loaded alongside the other skills for those passes. The model regenerates reaching for the human-writing patterns instead of the AI-default cadence.

**At the dedicated `human-writing` editing pass (after AI-voice, before formatting):** loaded as the primary skill. The pass is a full regen that explicitly chases these patterns. The retention layer preserves facts and quotes; the regeneration produces prose that sounds like Azout/Ava cadence rather than AI-default cadence.

The skill is not a checklist. It is a target the prose reaches for. A sub-agent loading this skill for a regen should ask of each section: would Azout write a sentence like this? Would Ava? If the answer is no, the sentence needs to change shape.

---

## Source notes

The principles in this skill were extracted from a study of multiple recent pieces by:

- **Sari Azout** — Check Your Pulse newsletter (Substack). 7 pieces studied. Pattern notes at `.claude/skills/human-writing/notes/sari-azout-patterns.md`.
- **Ava** — Bookbear Express newsletter (Substack). 5 pieces studied. Pattern notes at `.claude/skills/human-writing/notes/ava-bookbear-patterns.md`.

Future writers can be added by extracting their patterns into new notes files and folding any new principles into this skill. The skill is principle-driven so additions don't require restructuring.

The two writers were chosen because they write in distinctively different registers (Azout: argumentative essay; Ava: confessional personal essay) and the principles that survive across both are the principles most likely to transfer into editorial software-company content where neither register applies directly. Where their patterns converge, the principle is general. Where they diverge, the principle is mode-specific (e.g., the "I" voice does different work in argumentative vs. confessional contexts).
