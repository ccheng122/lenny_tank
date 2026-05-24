# Decisions log — The Lenny Tank

Why the project is built the way it's built. This isn't a status doc (the plan + task list cover what's done) — it answers "why this and not that?" so future-you (or anyone reading the repo) can tell which calls are load-bearing and which are easily revisited.

Companion docs:
- Spec: `docs/superpowers/specs/2026-05-22-lenny-tank-design.md`
- Plan: `docs/superpowers/plans/2026-05-22-lenny-tank-implementation.md`

---

## Architecture & stack

### 1. Ollama (`nomic-embed-text`) for embeddings, Claude for everything voice-related

**Choice:** Local Ollama (free, runs on your laptop) for one-time embedding of transcript chunks. Anthropic Claude (Sonnet 4.6 + Haiku 4.5) for character sheets and runtime judge reactions.

**Alternatives considered:**
- OpenAI for both embeddings + reactions (simpler, ~$5 total)
- All-Anthropic with Voyage AI for embeddings (three accounts)
- All-OpenAI with GPT-4o-mini for reactions (one account, slightly weaker personas)
- All-local with Ollama for both (free, but persona quality drops sharply with 7B models)

**Why:** Embeddings are a forgiving task — cosine similarity over conversational text doesn't need a state-of-the-art model. Local Ollama is "good enough" and free. Personas are the *opposite* — they're the demo's wow moment, where voice distinctiveness compounds across every round. Claude is meaningfully better than GPT-4o-mini or 7B local models at writing in-character. So we spend money where quality matters and save it where it doesn't.

**Easy to revisit if:** verification script (`verify-embeddings.ts`) shows Ollama retrieval is worse than expected — swap to OpenAI embeddings (~$0.03 one-time cost).

### 2. Two-provider stack, not one

**Choice:** Use Ollama AND Anthropic. Two API surfaces to manage.

**Tradeoff:** Adds setup friction (install Ollama, pull a model, plus get an Anthropic key). Single-provider would be simpler operationally.

**Why we accepted the friction:** Anthropic doesn't have a first-party embeddings endpoint. Ollama can't run on Replit (it's local-only). Each provider does the thing it's best at. The friction is one-time during Phase 0; runtime only hits Anthropic.

### 3. Static JSON files in the repo, no database

**Choice:** Character sheets, chunks, scenarios all live as JSON files committed to the repo. No Postgres, no vector DB, no cloud storage.

**Alternatives considered:** Pinecone/Weaviate for embeddings; Supabase for everything; even a single SQLite file.

**Why:** Dataset is small (~50 guests × ~40 chunks = ~2k vectors total). In-memory cosine similarity on 2k vectors is sub-millisecond. A database adds operational complexity for zero performance benefit at this scale. Replit deployments are simpler when everything is files. If we ever grow past ~50k chunks, revisit.

### 4. Next.js (App Router) on Replit

**Choice:** Next.js 16 with TypeScript and Tailwind.

**Alternatives considered:** Sveltekit, plain React + Express, no framework.

**Why:** Replit Agent has strong defaults for Next.js — it produces working scaffolding more reliably than for other frameworks. `@vercel/og` gives us share-card image generation without standing up a separate service. The buildathon time pressure makes "Replit Agent's happy path" more important than framework preference.

### 5. Pre-compute character sheets + embeddings; runtime is just retrieval + generation

**Choice:** Heavy LLM work (one-time persona analysis per guest, one-time embedding of all chunks) happens offline in Phase 0. Runtime per round does only: embed query (free-text only), cosine search, 3 reaction generations, 1 verdict synthesis.

**Alternatives considered:** Generate character sheets on-demand at first round (no Phase 0); re-embed chunks each session.

**Why:** Cost predictability and demo reliability. Pre-compute is one-time and committed to the repo. Runtime is fast (~6-8 seconds per round) and cheap (~$0.05). If a demo fails, we know it isn't because character-sheet generation hiccupped — that already happened.

---

## Product & UX

### 6. Curated scenario cards by default, free-text "write your own" as a secondary path

**Choice:** Both paths exist. Bucket pages lead with 5 curated cards; a "write your own scenario" affordance sits at the bottom. Move selection follows the same pattern (3 suggested moves + a "write my own").

**Alternatives considered:** Free-text only (purest LLM showcase); curated only (cleanest demo path).

**Why:** Free-text-only has a brutal activation problem — most users land on a blank prompt box, freeze, and bounce. Curated-only kills replay and personal stakes. The hybrid gets activation from curated (one-click start) AND infinite depth from free-text. Demo path is reliable (curated always works); power-user path exists for anyone with a real situation.

**Cost of having both:** Free-text scenarios at runtime need embedding lookups, which we'd need a non-Ollama path for (Replit can't reach local Ollama). Punted — for MVP, free-text uses a static "universal" judge bench and skips retrieval grounding, or we plug in Voyage AI's free tier at Task 3.1.

### 7. 5 buckets, not 3 and not 8

**Choice:** Growth & Retention, Shipping AI, Leadership & Tough Calls, Zero-to-One, Career Crossroads.

**Alternatives considered:** 3 buckets (Growth, Shipping AI, Zero-to-One — the most demo-able); 8 buckets (add GTM/Sales, Engineering Productivity, Non-Technical Building).

**Why:** 3 buckets is too narrow for the "be inclusive of non-founder audiences" goal — leaves out managers and career-navigators entirely. 8 buckets means 40 scenario cards (instead of 25) and a busier landing page. 5 is the sweet spot that covers PMs, eng, designers, leaders, growth, and career-changers without going overboard.

**Flagged as cuttable if scope tightens:** Leadership and Career Crossroads — they're the most introspective and hardest to write punchy scenarios for. Growth, Shipping AI, and Zero-to-One are the most demo-able.

### 8. 3 judges per round, drawn from a bench of 5

**Choice:** Each round shows 3 reactions. Each bucket has 5 candidate guests; we randomly pick 3 per round.

**Alternatives considered:** 5 judges per round (richer panel, slower + 67% more expensive); 1 judge per round (fast but flat).

**Why 3:** Enough for tension (disagreement requires ≥2 voices; a tiebreaker third makes the verdict interesting). Few enough to keep each round under 8 seconds and each LLM bill under $0.05.

**Why "random 3 from 5" rather than always-same-3:** Replay value. Different panel each time keeps repeat plays fresh without needing more scenarios.

### 9. Share cards are ALWAYS positive — no score, no move shown

**Choice:** The shareable PNG shows either (a) a quote you received with the panel names, or (b) your "spirit judge" personality result. The private summary screen shows your score and move; nothing about your performance gets exported publicly.

**Alternatives considered:** Wordle-style share card with score + move. Score + spirit emoji.

**Why:** People don't share their losses. A 4/10 with "You decided to pivot to enterprise" on the card means only 9+ scorers ever post. Sharing volume collapses, the viral hook dies. Always-positive shares mean every user has a shareable artifact regardless of their round outcome.

**This was a late revision** — the original spec had a score+move share card. User pushed back hard, and the revision is materially better.

### 10. Two share-card variants, not one

**Choice:** "Best advice I got" (quote-based) AND "Your spirit judge" (personality-quiz).

**Why two:** Different appeal axes. The quote card frames you as someone learning ("look at this wisdom I just received"). The spirit-judge card frames you as someone interesting ("you're a Cat Wu type"). Together they catch both LinkedIn-style and BuzzFeed-style sharers. Spirit-judge is the first nice-to-have to cut if scope tightens.

---

## Process & workflow

### 11. Branch `buildathon/lenny-tank`, not `main`

**Choice:** All Phase 0 work lives on a dedicated branch.

**Why:** Git log shows a recurring "Refresh starter dataset from full archive" commit pattern on this repo — implying it auto-syncs from upstream. Committing to main risks getting clobbered by a refresh. Branch isolation guarantees this work survives.

### 12. Subagent-driven execution, but batched pragmatically (not strict per-task)

**Choice:** Phase 0's six tasks were dispatched as 3 logical subagent batches rather than 6 individual subagents with full two-stage review each.

**Spec calls for:** fresh subagent per task, with spec-compliance review then code-quality review per task.

**Why we batched:** Phase 0 is mostly mechanical scaffolding. Three subagent dispatches with one combined review per batch hit the same quality bar as 6 dispatches × 12 reviews = 18 invocations of overhead, in a fraction of the time. Buildathon velocity wins over ceremony for scaffolding work.

**When to NOT batch:** any task with real architecture / design judgment (scenario authoring got its own dispatch, for example).

### 13. Author scenario cards manually, not LLM-generated en masse

**Choice:** A subagent wrote 20 scenario cards with rich guidance about each bench guest's worldview and explicit "this card needs genuine disagreement among the bench."

**Alternatives considered:** Prompt Claude to generate 25 cards in one shot from the spec; have it generate 100 candidates and pick 25.

**Why curated:** Scenarios are foundational. Bad scenarios produce flat reactions no matter how good the persona prompts. Spending care here once compounds across thousands of rounds. The bulk-generate approach risks scenarios where "everyone agrees" or where the bench isn't well-represented.

### 14. Chunker fix (2-pass sub-split) rather than ignoring the broken transcript

**Choice:** When ravi-mehta.md produced 1 chunk (because its transcript uses single newlines instead of blank lines between speakers), we fixed the chunker — added a second pass that sub-splits any chunk over 2× target word count.

**Alternatives considered:** Exclude ravi-mehta from the dataset. Document the issue and move on.

**Why fix:** If one transcript has this format, others might too as the archive grows. Better to make the tool robust than to maintain a list of "broken" files. The fix is small (~15 lines) and idempotent.

### 15. Embedding-quality pass bars: self-retrieval 3/3, topical ≥4/5, median top-1 cosine ≥0.5

**Choice:** Three numeric thresholds the `verify-embeddings.ts` output must clear before we proceed to character-sheet generation and runtime work.

**Alternatives considered:** No bars at all (eyeball it). Single bar (just top-1 cosine). Stricter bars (5/5 topical, 0.6+ cosine).

**Why these specific numbers — they're heuristic, not derived from a paper:**

| Bar | Why |
|---|---|
| **Self-retrieval 3/3** | Not really a choice — if a chunk can't find itself in the database it lives in, retrieval is plumbed wrong. Anything less means investigate before anything else. Acceptable failure rate is zero for "system works at all." |
| **Topical pass rate ≥4/5** (≥2 expected guests in top-5 per query) | 5/5 is too strict because the "expected guests" list is itself a heuristic — the model can legitimately surface defensible matches that weren't on my list (e.g., Jenny Wen on manager-vs-IC). 3/5 is too loose because 40% off-topic retrieval at demo time means judge reactions will frequently feel disconnected from the user's situation. 4/5 = "most queries clearly work, one allowed to be debatable." |
| **Median top-1 cosine ≥0.5** | For nomic-embed-text: 0.7+ is strong, 0.5-0.7 is working but noisy, <0.5 means the model is genuinely struggling to find the topic. 0.5 is the "minimum acceptable signal level." 0.6 would be better but might fail on legitimately hard queries; 0.4 risks shipping retrieval that's barely functioning. |

**Calibration:** these bars target "demo-able Lenny Tank quality." A legal-search system would need 5/5 with strict relevance grading. A "show me anything related" app could tolerate 3/5. **Trust your demo experience over the numbers** — the bars predict demo quality, they aren't the goal themselves.

**Easy to revisit if:** demos consistently surface off-topic reactions despite the bars being met (raise the bars), or you find yourself rejecting embeddings that actually produce fine demos (lower them).

### 16. Centralize brand tokens up-front, reference them by name in every Replit Agent prompt

**Choice:** Extract brand styling once into central design tokens — colors and typography in `tailwind.config.ts`, reusable component classes (`.card`, `.btn-primary`, etc.) in `app/globals.css` — then reference those tokens by name in every subsequent task prompt. The original plan had styling sprinkled inline ("Style: dark mode, big punchy headline...") per task, which was a gap.

**Alternatives considered:**
- **Vibe styling inline per page** (the original plan's implicit approach) — each task prompt described styling in words, Replit Agent picked its own colors/fonts/spacing. Risk: by Task 3.2 you have three shades of "yellow," two different fonts, and inconsistent card styles across pages. Refactoring across files later is exactly what Replit Agent is worst at.
- **Adopt a UI library like shadcn/ui** — would give consistency for free but adds setup time and locks the look into a generic SaaS-adjacent style that's at odds with Lenny's editorial brand.
- **Do styling as one big polish pass at the end** — common pattern but fights the same multi-file refactor problem above.

**Why centralize early:** Replit Agent is reliable on individual prompts but bad at cross-file refactors. The cheapest moment to enforce design consistency is BEFORE the second page is built. Tokens in `tailwind.config.ts` are read by every page automatically, so coherence is the default rather than something we have to fight for later.

**How we extracted tokens in practice:** Screenshotted Lenny's Newsletter homepage and uploaded it to Replit Agent, then explicitly asked it to extract a palette + typography and persist them into `tailwind.config.ts` + `globals.css` with semantic names (`brand.cream`, `brand.yellow`, `brand.ink`). Then refactored the landing page to use those tokens instead of inline hex codes. Future tasks reference the named tokens.

**How to apply:** Every future Replit Agent prompt for a new page or component must include an explicit "Style: use the brand tokens from tailwind.config.ts (`bg-brand-cream`, `text-brand-ink`, `font-serif`) and the reusable classes from globals.css (`.card`, `.btn-primary`)" line. The named references are how we ensure inheritance — without them, Replit Agent will silently invent new styles.

**Easy to revisit if:** pages start looking inconsistent despite using the tokens (probably means the token set is too sparse — add more), or the brand needs a refresh (change the values in `tailwind.config.ts` once and every page updates).

### 17. Reveal moves only AFTER scenario commitment (two-step flow)

**Choice:** The bucket page shows scenario titles + setups only — never the suggested moves. Users must click a scenario card to see the 3 strategic options. The /tank page is where the move choice happens. So the flow is:

1. Pick bucket
2. Pick scenario (moves hidden)
3. *Now* see moves, pick one (or write your own)
4. See judge reactions

**Alternatives considered:**
- Show everything on one page (scenario + moves visible simultaneously) — what the plan originally specified, before this revision
- Show all scenarios as collapsed accordions, expand to reveal moves
- Show only one scenario at a time (full-screen takeover per scenario card)

**Why the two-step reveal:** The whole game mechanic is "what would YOU do?" — that question loses tension the moment users can window-shop both questions and answers in parallel. When all scenarios + all moves are on one page, users instinctively read the moves first and pick a scenario based on which move sounds best — backward from what we want. Forcing scenario-then-move commitment restores the "I'm tackling THIS specific dilemma" feeling that makes the panel verdict satisfying.

**Concrete examples of what gets ruined without this rule:**
- "The Retention Cliff" + options including "Pause growth spend; fix the leaky bucket first" — if a user sees the options first, they pick the scenario that has the move they already believe in, instead of being challenged by the scenario.
- Comparing moves across scenarios ("oh, scenario 3's options look more interesting than scenario 1's") trivializes the scenario choice itself.

**Easy to revisit if:** user testing shows people are confused about what they're committing to (e.g. expect to preview moves like a quiz), in which case maybe show a single hint like "(3 options inside)" on the card to telegraph that something is coming next — but still don't show the actual moves.

---

## Quality checkpoints (verify-as-you-go)

Checkpoints aren't decisions per se, but they're worth writing down because they prevent silent quality degradation. Run these at each stage:

| Stage | What to check | Pass bar | What to do if it fails |
|---|---|---|---|
| After chunking | Each transcript produced multiple chunks. Spot-check ravi-mehta.json and 2-3 others. | All 50 files exist; min chunks ≥ 5; sample chunks have real transcript text | Investigate chunker for the failing file's format; add another splitting pass if needed |
| After embeddings | Self-retrieval: pick 3 random chunks, embed their text, verify each finds itself in top-3. Topical: 5 hand-curated queries should each surface ≥2 expected guests in top-5. | 3/3 self-retrieval; ≥4/5 topical queries pass | Embedding model is too weak — swap Ollama for OpenAI (~$0.03) or Voyage AI (free tier) |
| After character sheets | Spot-check 3 sheets (eric-ries-2, boris-cherny, elena-verna-40) for distinctiveness. They should mention specific frameworks and signature phrases. | Each sheet is non-generic; "core_frameworks" reflects what the guest actually advocates | Regenerate that guest's sheet; if pattern repeats, tighten the system prompt |
| After judge reactions land in app | Generate 3 reactions to the same scenario. Read them blindly — can you tell which guest is which? | At least 2 of 3 are clearly distinguishable from each other | Character sheets too generic OR the persona prompt isn't using them enough — iterate on both |
| Before demo | Time the full landing → verdict flow. | Under 90 seconds end-to-end | If retrieval is slow, pre-compute embeddings for the demo scenario; if LLM is slow, switch to streaming or warm the model |

The `verify-embeddings.ts` script automates the embedding checkpoint. The others are eyeball checks.

---

## Explicitly deferred (v2 hooks)

Not in MVP. Mirrors the spec's "explicitly out." Useful as a memory anchor when scope-creep tempts mid-build.

- **Audio playback** of judge reactions (TTS for each guest's voice)
- **Multi-round "Pitch Week"** campaign mode (the original option B from brainstorming)
- **Document upload** — paste your real PRD, get the panel to react
- **User accounts / saved rounds / round history**
- **Tone variants** — Roast Battle (mean panel), Press Junket (adversarial journalists)
- **Interview Mode** — lean explicitly into user goal #2 with PM/leadership interview rubrics
- **"Play as" role-switcher** — toggle the protagonist's role per scenario (lean into user goal #3)
- **Newsletter content** as a primary source (newsletters serve as supplementary context only in MVP)

Adding any of these later means revisiting the spec — they're not just "more features," they reshape the user model.

---

## How to extend this doc

When you make a new call during Phase 1+ (Replit Agent work) that you'd struggle to remember the reason for in 3 weeks, add a section here. Format:

```markdown
### N. [Short headline]

**Choice:** [What you decided]
**Alternatives considered:** [What you ruled out]
**Why:** [The reasoning — be specific about the tradeoff]
**Easy to revisit if:** [Optional — what signal would tell you to reconsider]
```

Decisions that are NOT worth writing down:
- Anything obvious from reading the code (use TypeScript, use Tailwind classes, etc.)
- Aesthetic choices that don't have a real tradeoff ("button is blue not green")
- Things already documented in the spec or plan
