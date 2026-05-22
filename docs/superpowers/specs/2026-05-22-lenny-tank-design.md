# The Lenny Tank — Design Spec

**Date:** 2026-05-22
**Status:** Approved for implementation
**Context:** Replit buildathon project using the Lenny's Newsletter + Podcast dataset (50 podcast transcripts, 10 newsletter posts).

---

## 1. Concept

The Lenny Tank is a Shark-Tank-style web app where the user picks a topic bucket, picks (or writes) a scenario, chooses a strategic move, and gets judged by a 3-person panel of AI-voiced personas of real Lenny's Podcast guests.

Each judge delivers:
- A short reaction in their voice (LLM-generated, persona-grounded)
- A verbatim pull-quote from their actual episode (retrieved, not generated)
- A 1-10 score on the user's move

The hybrid of generated reaction + real citation is the differentiation: every existing project in the example set either fully generates (no grounding) or fully retrieves (no personalization). The mix is what makes it feel like "Eric Ries actually said this about my situation" rather than "an LLM hallucinated something in Eric's voice."

## 2. Mission & User Goals

**Mission:**
> Give anyone working in tech a low-stakes way to practice the high-stakes decisions of their craft — and get feedback from the people who've already lived them.

The Tank exists so users can come here to do one of four things:

1. **Rehearse decisions you only face once or twice in a career.**
   "What do you do when retention craters?" or "How do you handle a founder dispute?" are situations most people meet exactly once — and badly the first time. The Tank lets you rehearse them ten times before they're real.

2. **Practice for interviews — without the cost of a bad answer.**
   PM, founder, and leadership interviews are full of scenario questions ("how would you grow X?", "tell me about a tradeoff you made"). Getting expert feedback on your reasoning before you sit across from a hiring manager builds calibration that mock interviews with friends can't.

3. **Try on a different role.**
   A designer plays a PM. An IC plays a manager. A non-founder plays a founder. Each bucket lets you step into a perspective you don't live in day-to-day — and see how the experts in that world actually think.

4. **Have fun, learn from experts you'd never get a meeting with.**
   The gamified format means you absorb frameworks from Eric Ries or Cat Wu the same way you'd absorb a Wordle pattern — by playing, not by studying. Expert wisdom delivered as a hangout, not homework.

These goals shape several downstream decisions:

- **Landing page copy** — the mission line is the tagline; "Step into the Tank" is the CTA.
- **Bucket framing** — each bucket maps to user-goal patterns. Career Crossroads serves goal #1 most directly; Leadership and Shipping AI serve goal #2 (interview-rich domains); Zero-to-One and Leadership serve goal #3 (role-cosplay); all serve #4.
- **Share-card tone** — always positive, because the user's goal is to learn, not to be ranked. Low-score shaming would undermine the "low-stakes" promise.

### v2 hooks (not in MVP, but anticipated by the mission)
- An explicit **Interview Mode** that mimics standard PM/leadership interview rubrics (lean into goal #2)
- A **"play as" toggle** that lets users choose their protagonist's role per scenario (lean into goal #3)

## 3. Project Goals & Non-Goals

### Project Goals
- Deliver a polished, demo-able MVP in ~1–2 days using Replit Agent
- Be inclusive of non-founder audiences: PMs, eng, designers, growth, leaders, career-switchers
- Lead with curated content to lower activation barrier; offer free-text as a secondary affordance
- Make every round produce a shareable artifact that is always-positive (no shaming low scores)
- Ground every judge reaction in actual transcript content so citations link to real episodes

### Non-Goals (out of MVP scope)
- Audio/voice playback of judge reactions
- Multi-round campaigns ("Pitch Week" mode)
- User accounts, persistent history, saved rounds across sessions
- Roast Battle / Press Junket / other tonal variants
- Real PRD or document upload for the panel to react to
- Newsletter content as a primary source (newsletters serve as supplementary context only)

## 4. Topic Buckets

Five buckets, each tuned to a real audience segment in the podcast guest landscape. A user enters the app by picking one.

| # | Bucket | Audience | Judge bench (4-5 guests) |
|---|--------|----------|--------------------------|
| 1 | **Growth & Retention** | PMs, growth, marketers, indie hackers | Elena Verna, Albert Cheng, Jason Cohen, Amol Avasare, Ethan Smith |
| 2 | **Shipping AI** | PMs, eng, designers building AI features | Cat Wu, Boris Cherny, Asha Sharma, Hamel Husain, Claire Vo |
| 3 | **Leadership & Tough Calls** | managers, leads, senior ICs | Molly Graham, Rachel Lockett, Matt MacInnis, Ben Horowitz, Jessica Fain |
| 4 | **Zero-to-One** | founders, founder-curious, side-projecters | Eric Ries, Melanie Perkins, Grant Lee, Brian Halligan, Stewart Butterfield |
| 5 | **Career Crossroads** | anyone navigating their own role/path | Sam Lessin, Tomer Cohen, Keith Rabois, Dr. Becky Kennedy, Nikhyl Singhal |

**Universal judges:** Ben Horowitz and Sam Lessin may appear across buckets (their archive content is broadly applicable to founders + operators). This is a nice-to-have; if scope tightens, judges stay strictly bench-bound.

## 5. Scenario Cards (the deck)

Each bucket ships with **5 curated scenario cards** for MVP (25 total). Each card has:

- **Title** — 4-6 words, punchy
- **Setup** — 2-3 sentences with a role, a number, and a tension
- **3 suggested moves** — each frames a different strategic posture
- **"✏️ Write my own move"** — text input as the 4th option

**Authoring guidance:**
- Specific enough to feel real, generic enough to not require domain knowledge (no jargon walls)
- Map to a real tension where 2+ guests in the bench have meaningfully distinct views
- Vary the protagonist's role across cards (PM, eng lead, growth lead, founder, IC) — reinforces non-founder inclusivity

**Free-text scenario option:** at the bottom of each bucket's card deck, a "✏️ Write your own scenario" affordance lets power users plug in their actual situation. Same downstream pipeline; the only difference is that retrieval is less tuned.

## 6. User Flow

```
1. Landing
   → "Step into the Tank" CTA
   → 5 bucket tiles

2. Bucket selected
   → 5 scenario cards
   → "✏️ Write my own scenario" text box at the bottom

3. Scenario selected
   → 3 suggested moves
   → "✏️ Write my own move" text box

4. Move submitted
   → "The Tank" view
   → 3 judges appear (avatar + name + role)
   → Reactions stream in one-by-one (1-2 sec stagger)
   → Each reaction: 2-3 sentences + verbatim pull-quote + 1-10 score

5. Verdict (private, in-app)
   → Aggregate score + one-line synthesis of the panel
   → Full text of all 3 reactions, with quotes and episode citations
   → Buttons: [Share quote] [Share spirit judge] [Try again] [New scenario]

6. Share (public, opt-in)
   → Generic, always-positive shareable image (see §7)
```

## 7. Share Cards

The shareable artifact is **never the score or the move**, because people don't post their mediocre rounds. Two always-positive options:

### 7.1 Primary — "The Best Advice I Got"
```
Today, Eric Ries told me:
"Validated learning is the unit of progress. Anything that doesn't get you closer to that is waste."

Got tanked by: Eric Ries · Cat Wu · Ben Horowitz
lennytank.example.com
```
A verbatim guest quote, the 3 judge names, and the app URL. Always positive. Frames the user as someone who learned something. Shareable regardless of round outcome.

### 7.2 Secondary — "Your Spirit Judge"
```
I think most like...
CAT WU
Head of Product, Claude Code

"Velocity-first. Ship to learn. Trust the team to course-correct."

lennytank.example.com
```
Personality-quiz format. Derived from which judge scored the user's move highest (or whose reasoning most aligned). Always flattering. Heavy viral precedent.

### 7.3 Private summary

The post-round summary screen — visible only to the user — shows the full round detail: aggregate score, the user's move, all 3 full reactions, all citations, and links into the source episodes. The score and move never leave the app unless the user explicitly takes a screenshot.

## 8. Judge Reaction Anatomy

Each judge reaction has four components:

| Component | Source | How it's generated |
|---|---|---|
| **Reaction text** (2-3 sentences, in-voice) | LLM | Per-guest persona prompt + character sheet + scenario + move + retrieved chunks |
| **Pull-quote** (verbatim) | Real transcript | Semantic search over the guest's chunks; LLM picks the most-relevant from top 2-3 candidates |
| **Score** (1-10) | LLM | Same call as reaction; calibrated to the guest's known philosophy |
| **Episode metadata** | `index.json` | Title, date, post URL |

The pull-quote is **never generated**. It must be a direct lift from a transcript chunk, with a link back to the episode. This is the citation guarantee.

## 9. Data Pipeline

### 9.1 Pre-computed (built once, before app runs)

These artifacts are generated by a one-time prep script run **outside** the Replit dev loop (locally or in a Colab/script environment), and the outputs are committed to the repo. Replit Agent then reads them at runtime — it does not regenerate them. For each of the 50 podcast guests:

1. **Character sheet** (`data/guests/{slug}.json`)
   - 1-paragraph persona summary
   - Core frameworks they advocate
   - Signature phrases / vocab
   - What they typically push back on
   - Generated via a one-time LLM pass over their full transcript

2. **Transcript chunks** (`data/chunks/{slug}.json`)
   - Transcript split into ~500-word chunks
   - Each chunk has text, episode_id, position
   - Each chunk has a semantic embedding (e.g. OpenAI `text-embedding-3-small`)

### 9.2 Authored (hand-written, with LLM assistance)

3. **`data/scenarios.json`** — keyed by bucket:
   ```json
   {
     "growth": [
       {
         "id": "retention-cliff",
         "title": "The Retention Cliff",
         "setup": "You're a PM at a B2C AI app...",
         "suggested_moves": ["Pause growth...", "Ship the referral...", "Dig into the cohort..."],
         "judge_bench": ["elena-verna-40", "albert-cheng", "jason-cohen", "amol-avasare", "ethan-smith"],
         "themes": ["retention", "growth-levers", "cohort-analysis"]
       }
     ]
   }
   ```

### 9.3 Runtime (per round, ~6-8 seconds total)

```
User submits {scenario, move, bucket}
   │
   ▼
1. Pick 3 judges from bucket's bench (random sampling for MVP; theme-tuned selection is a future enhancement)
   │
   ▼
2. For each judge in parallel:
   ├─ Embed (scenario + move) → semantic search judge's chunks
   ├─ Top 2-3 relevant chunks → pull-quote candidates
   ├─ One LLM call: persona prompt + character sheet + scenario +
   │   move + chunks → reaction text + score + chosen quote
   │
   ▼
3. One synthesis LLM call: 3 reactions → one-line verdict + avg score
   │
   ▼
4. Stream reactions to UI (judges appear one-by-one)
```

**LLM budget per round:** 4 calls (3 judge reactions + 1 verdict synthesis). Use fast/cheap model class (Claude Haiku 4.5 or GPT-4o-mini). Under $0.05/round at retail pricing.

## 10. Tech Stack (recommended, not prescribed)

- **Framework:** Next.js (App Router) — Replit Agent has strong defaults here, and the `@vercel/og` library makes generating share-card images straightforward
- **Storage:** static JSON files in the repo for character sheets, chunks, scenarios. No database needed for MVP.
- **Embeddings:** OpenAI `text-embedding-3-small` for vectors; in-memory cosine similarity (50 guests × ~30 chunks each = ~1500 vectors, fits easily in memory)
- **LLM:** Claude Haiku 4.5 (via Anthropic API) or GPT-4o-mini for runtime reactions; Claude Sonnet 4.6 for one-time character-sheet generation
- **Image share:** `@vercel/og` for server-side image generation of share cards
- **Deploy:** Replit (per buildathon brief)

## 11. MVP Scope

### Must-have (demo-day)
- 5 buckets
- 25 curated scenario cards (5 per bucket)
- Curated moves + free-text "write your own" for both scenario and move
- 3-judge panel with reaction + verbatim quote + score
- Aggregate one-line verdict
- "Best advice I got" share card download
- Citation links to source episodes

### Nice-to-have (cut in this order if time runs short)
- Streaming judge reveals with stagger animation → fall back to all-at-once
- "Spirit Judge" share card → cut to single share variant
- Universal judges (Ben Horowitz, Sam Lessin floating across buckets) → strict bench-only

### Explicitly out (potential v2)
- Audio playback of judge voices
- Multi-round "Pitch Week" mode
- Document upload for the panel to react to
- User accounts / saved rounds
- Tone variants (Roast Battle / Press Junket)
- Interview Mode (lean into user goal #2)
- "Play as" role-switcher toggle (lean into user goal #3)

## 12. Open Risks

| Risk | Mitigation |
|------|------------|
| Free-text scenarios produce off-archive responses (judges hallucinate) | Add a similarity threshold; if no chunks score high enough, judge says "I don't have a great take on this — try a curated scenario" |
| Judge reactions feel same-y across guests | Character sheets must capture distinctive vocabulary and viewpoints; explicit "what they push back on" field forces differentiation |
| Pull-quote chosen by retrieval is irrelevant to the actual reaction text | Pass top 2-3 candidates to the LLM and let it pick the best one in the same call that generates the reaction; quote must be one of the candidates |
| Buildathon time crunch | MVP scope is intentionally aggressive on scenarios (25) and conservative on features. Nice-to-haves are pre-ordered for cuts |
| LLM cost spikes on launch | All runtime calls use small/fast models; expensive character-sheet generation is one-time and committed to repo |

## 13. Success Criteria

The MVP succeeds if:
1. A first-time user can land on the page and reach a panel verdict in under 90 seconds.
2. At least 3 of 5 buckets produce judge reactions that feel meaningfully different from one another in voice (testable by reading 3 reactions to the same scenario blindly).
3. Every pull-quote shown links to a real, findable moment in a real episode.
4. A user who scores poorly still has a share card they'd plausibly post.
5. The demo runs reliably without depending on any specific user input.
6. (Soft signal) A user reports feeling like they learned something or had fun after one round — ties to user goals #1 and #4.
