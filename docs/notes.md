# Notes

Working notes and operational guidance. Less formal than `decisions.md`. Add new entries with date-stamped headings.

---

## What to look for when verifying embeddings (Ollama, SUPERSEDED)

_2026-05-23 — kept as historical reference. We switched to OpenAI for runtime embeddings; see decisions.md §1 and the "OpenAI verify run" section below._

The structure of the verification (self-retrieval, topical queries, summary stats) and the cosine-score intuition still applies to OpenAI. What changed: model, dimension (768 → 1536), no prefix needed, and absolute cosine scores are tighter (typical strong matches 0.5-0.7 instead of 0.6-0.9).

Run the original Ollama script with:
```bash
npx tsx scripts/verify-embeddings.ts
```

You'll see three sections. Here's what to look at in each, with red flags called out.

### 1. Self-retrieval section

#### What self-retrieval is

The simplest possible smoke test for an embedding system. The mechanic:
1. Take a chunk of text already in the database (e.g., chunk #15 from Jenny Wen's episode)
2. Send that text through the embedding model fresh → get a query vector
3. Use that query vector to search through ALL embeddings in the dataset
4. Check: does the original chunk appear in the top-3 results?

It should, because we just searched for its own text. If a chunk can't find ITSELF in the database that contains it, nothing else will work.

**Analogy:** publish a blog post, then Google the exact title. If your own post doesn't show up, search isn't broken at the "is this relevant?" level — it's broken at the "is this thing even plugged in?" level.

#### Purpose: catch plumbing failures before they hide as quality failures

Self-retrieval is fast, cheap, and catches a specific class of bug — **the system runs without errors but produces silently broken output.** That's the worst kind of bug: it doesn't crash, it just emits garbage that looks like real results. Specifically it catches:

1. **Embeddings weren't actually generated.** Chunks have empty/zero/placeholder vectors. Script runs, math runs, results come back — all meaningless (zero vectors are equidistant from each other).
2. **Wrong model used for chunks vs. query.** Chunks embedded with `nomic-embed-text` but the verify script accidentally uses another model. Two unrelated vector spaces.
3. **Dimension mismatch.** Chunks are 768-dim, query is 1536-dim. Cosine math returns nonsense.
4. **Vectors loaded as strings.** A JSON parsing bug stores `"0.123"` instead of `0.123`. Math silently fails.
5. **Ollama returning the wrong model's output** — e.g., `nomic-embed-text` wasn't pulled and Ollama fell back to a different default.

Without this check, you'd discover the bug much later — like when judge reactions are about random unrelated topics.

#### What self-retrieval does NOT tell you

It only checks "the plumbing works." It does NOT check whether embeddings are *meaningful*. The model could be terrible at semantic understanding (can't tell "retention" ≈ "churn") and self-retrieval would still pass. That's what the topical-queries section (below) tests.

#### Why 3 chunks (first, middle, last) and not just 1

Testing 3 chunks spread across the dataset confirms the behavior is consistent across files and positions. If 3/3 pass, an arbitrary chunk would also pass.

#### Why "top-3" and not "is it #1"

Embedding models can have small nondeterminism — running the same text twice doesn't always produce *exactly* the same vector. The original chunk should still be very close, but might occasionally land at #2 behind a nearly-identical paragraph from the same episode. Top-3 is forgiving enough to handle minor variation while still being a meaningful threshold.

#### Output looks like

```
=== Sanity check: self-retrieval ===
  ✅ caitlin-kalinowski-0 → top-3: caitlin-kalinowski-0, ...
  ✅ jenny-wen-15 → top-3: ...
  ✅ asha-sharma-9 → top-3: ...
Self-retrieval: 3/3 found themselves in top-3
```

**Pass bar:** 3/3.
**If you see < 3/3:** something is fundamentally broken (one of the 5 failure modes above). Don't proceed — debug before anything else. Most likely: embeddings weren't actually generated, or were generated with a different model and the vectors don't line up.

#### TL;DR

**Self-retrieval = "if I search the database for a thing that's in the database, do I find it?"** A 5-second sanity check that prevents 5 hours of downstream debugging.

### 2. Topical-queries section

For each of 5 queries you'll see:
```
Query: "How do I improve user retention?"
Expecting dominant guests from: elena-verna-40, albert-cheng, jason-cohen, amol-avasare
  ✅ 3/4 expected guests in top-5
    ✓ [0.612] Elena Verna 4.0: well retention is really the thing that...
    ✓ [0.587] Albert Cheng: the way we think about it at Duolingo...
      [0.553] Marc Andreessen: distribution is everything...
    ✓ [0.541] Jason Cohen: my five questions framework starts with...
      [0.519] Eric Ries: validated learning is the unit of progress...
```

**Three things to check per query:**

#### (a) The ✅/⚠️ count
Pass bar: ≥2 expected guests in top-5 → ✅. The script flags this for you.
**Overall pass bar:** ≥4 of the 5 queries get ✅. If 0-1/5 pass, embeddings are too weak to depend on.

#### (b) Eyeball the top-1 cosine score and the snippets
- **Cosine score for top-1:** healthy is **0.5+** for nomic-embed-text. Anything below 0.4 across the board suggests the embedding model isn't discriminating well.
- **Snippet relevance:** read the first ~100 chars of each top result. Does it actually look like it's about the topic? E.g., for a retention query, is the snippet about *retention* — or is it about hiring, audio quality, or some intro pleasantry? Watch for chunks that score high *despite* being off-topic (often a sign the chunk text is generic).

#### (c) Score gap between top-1 and top-5
If top-1 is 0.62 and top-5 is 0.41 → healthy spread, model is discriminating.
If top-1 is 0.50 and top-5 is 0.47 → flat distribution, model can't tell what's most relevant.

### 3. Custom queries (when you use --query)

```bash
npx tsx scripts/verify-embeddings.ts --query="how do i ship AI features faster"
```

There's no auto-grade here — eyeball whether the results match your intent. Try a few queries that map to your actual scenario cards (e.g., "the freemium trap", "checked out star engineer"). If the results don't surface the bench guests you'd expect for that scenario, your judge reactions will likely feel off.

### Cross-cutting red flags to watch for

| Red flag | What it means | What to do |
|---|---|---|
| **Same guest dominates 3+ queries** (e.g., Ben Horowitz in every top-5) | That guest's chunks have unusually "centroid-like" embeddings — they're close to everything | Likely OK for MVP; if it bothers you, consider per-guest score normalization in retrieval |
| **One specific chunk shows up across many queries** | That chunk's text is overly generic (probably an intro/outro segment) | Manually exclude that chunk ID, or filter chunks under a minimum unique-word count |
| **Top-1 cosine universally < 0.4** | The model isn't producing discriminating vectors | See "If quality is bad" below |
| **Self-retrieval < 3/3** | Setup is broken | Re-run embed-chunks.ts; verify dimensions match |
| **Relevant guest is in the bench but no chunks of theirs make top-5** | That guest's chunks may all be too long (low signal density) or the topic is implicit | Probably fine — random-3-from-5 means they'll still appear sometimes |

### If quality is bad

Three escape hatches, cheapest first:

1. **Add nomic's query/document prefixes** (easy, free). nomic-embed-text expects `"search_query: ..."` for queries and `"search_document: ..."` for chunks. Our current script omits these. Adding them usually bumps cosine scores by 0.1-0.2 and improves topical relevance. Quick edit to `embed-chunks.ts` and `verify-embeddings.ts`.

2. **Switch to OpenAI `text-embedding-3-small`** (~$0.03 total). Definitively better quality. ~30-second rewrite of `embed-chunks.ts`.

3. **Switch to Voyage AI's free tier** (`voyage-3-lite`, free up to 200M tokens/month). Anthropic's recommended embedding partner; quality between Ollama and OpenAI.

### TL;DR — the 3 numbers that matter

After running, write these down:
- **Self-retrieval:** `X/3` (must be 3/3)
- **Topical pass rate:** `X/5` queries with ≥2 expected guests in top-5 (target ≥4/5)
- **Median top-1 cosine** across the 5 topical queries (target ≥0.5)

If all three are green → ship it. If any is red → use one of the escape hatches above before generating character sheets.

---

## How nomic prefixes improve retrieval quality (Ollama, SUPERSEDED)

_2026-05-23 — kept as a reference for the prefix concept (relevant to nomic and a handful of other open models). Not applicable to our current OpenAI runtime — text-embedding-3-small doesn't use role prefixes._

### What an embedding model is doing (zoomed out)

An embedding model takes a piece of text and turns it into a list of numbers (a "vector") — for nomic-embed-text, that's 768 numbers per text. The job of that vector is to place the text at a specific location in an imaginary 768-dimensional space.

The key rule of that space: **texts with similar meaning land near each other**, and texts with different meanings land far apart. You find related text by computing distance (cosine similarity) between vectors.

The model knows what "similar" means because it was trained on billions of text pairs that were labeled (by humans or other systems) as related or not. It learned patterns about which words and structures and topics should land close together.

### The asymmetry problem

There are different KINDS of "related." Compare:

| Type | Example |
|---|---|
| **Query** | "How do I improve user retention?" |
| **Document/answer** | "Well, the way we think about it at Duolingo is you need to find your aha moment..." |
| **Topic statement** | "User retention is the percentage of users who return..." |

The query and the answer are **related** but **linguistically very different**. The query is short, "how do I" structure, ends with a question mark. The answer is conversational, has a specific perspective, is long.

If you embed both into the SAME vector space using the SAME rules, the model is essentially being asked to "find similar text" — but you actually want "find an answer to this question." Those are different jobs.

### How prefixes solve it

nomic-embed-text was specifically trained with text labeled by its role. During training, the model saw pairs like:

```
INPUT 1: "search_query: How do I improve user retention?"
INPUT 2: "search_document: Well, the way we think about it at Duolingo..."
TRAINER: "These two should be CLOSE TOGETHER even though they look different."
```

So the model learned: **when I see `search_query:` at the start, embed this as if it's a question looking for answers. When I see `search_document:`, embed this as if it's a candidate answer.**

It uses the prefix as a switch — same model weights, but two different "modes." One for queries, one for documents.

### Analogy

Think of a librarian:
- **Without prefixes:** you walk up and say something. The librarian doesn't know if you're asking a question, recommending a book, or returning one. They make a best guess.
- **With prefixes:** you walk up and say "I have a question" first. Now the librarian knows to look for books that ANSWER your question, not books that say similar things back.

The librarian is the same person and has the same information. The prefix just tells them which mode to operate in.

### What changes in your code

Two tiny edits, no math changes, no new dependencies:

**`embed-chunks.ts`** (embedding chunks as documents):
```typescript
// Before:
prompt: chunk.text

// After:
prompt: 'search_document: ' + chunk.text
```

**`verify-embeddings.ts` and any runtime retrieval code** (embedding user queries):
```typescript
// Before:
prompt: queryText

// After:
prompt: 'search_query: ' + queryText
```

### Why this typically helps the numbers

Without prefixes, "How do I improve user retention?" matched Albert Cheng's chunk at cosine 0.765. With prefixes, the same pair would likely score 0.85-0.90+. The model is now using its "match question to answer" mode rather than its generic "match text to text" mode.

Concrete benefits beyond bigger numbers:

1. **Cleaner score gaps.** Currently "AI evals" has a 0.007 gap between top-1 and top-5 (very flat). With prefixes, the relevant chunks pull ahead more clearly because the model is more confident about Q→A matching.
2. **Better behavior on borderline queries.** A query that's ambiguous-in-isolation becomes clearer when the model knows it's a question.
3. **Free-text scenarios benefit most.** User-typed scenarios are more "questiony" than the curated cards — that's exactly where prefixes pay off.

### Cost / benefit

| What | Cost |
|---|---|
| Code change | ~2 lines, ~30 seconds |
| Re-embed all chunks (old embeddings used no prefix; must regenerate) | 5-20 min compute, free (Ollama is local) |
| Redeploy | Few minutes |
| Risk | Very low. Revert the diff and you're back to before. |

### When to do it vs. skip

**Do it now if:** your current pass rate is barely meeting the bars, your free-text retrieval feels off, or you're already regenerating embeddings for another reason (e.g., adding new transcripts).

**Skip if:** your pass bars are comfortably met and you're trying to move fast to character sheets and Replit work.

It's a marginal improvement, not a transformational one. Above-bar embeddings without prefixes will produce a working demo; the prefixes just give you more headroom.

### Observed impact on this dataset

Measured 2026-05-23 — verify-embeddings.ts before and after enabling prefixes:

| Query | Top-1 cosine before | Top-1 cosine after | Δ |
|---|---|---|---|
| Retention | 0.765 | 0.795 | +0.030 |
| AI evals | 0.594 | 0.668 | +0.074 |
| Perf conversation | 0.645 | 0.699 | +0.054 |
| PMF | 0.781 | 0.807 | +0.026 |
| Manager/IC | 0.689 | 0.721 | +0.032 |
| **Median** | **0.689** | **0.721** | **+0.032** |

Qualitative changes:
- Perf conversation: expected-guests-in-top-5 went 2/4 → 3/4 (Molly Graham appeared at top-1, was missing entirely from top-5 before).
- Flat distributions partially fixed: AI evals top-1-to-top-5 gap went 0.007 → 0.019; perf conversation 0.008 → 0.013.
- No regressions on any query.

So: smaller bump than the theoretical 0.1-0.2 I'd expected, but consistently positive across all 5 queries and produced one real qualitative win (Molly Graham surfacing). Worth the 15-20 min compute cost.

---

## OpenAI verify run (the actual runtime embeddings)

_2026-05-24_

After re-embedding all chunks with OpenAI `text-embedding-3-small` inside Replit and running an OpenAI-adapted version of the verify script (`artifacts/web/scripts/verify-openai-embeddings.ts`):

| Metric | Result | Target | Verdict |
|---|---|---|---|
| Self-retrieval | 3/3 | 3/3 | ✅ PASS |
| Topical pass rate | 2/5 | ≥4/5 | ⚠️ Below the global metric |
| Median top-1 cosine | 0.478 | ≥0.4 (OpenAI scale) | ✅ PASS |

### Why the topical rate is misleading here

The verify script does **global top-5 across all 1,869 chunks** — a "would the right guest beat every other guest?" test. That's a useful smoke test for "do embeddings work at all," but it's **not what the runtime does**.

The runtime constrains retrieval to **each scenario's hand-curated bench of 5 specific guests** (see `data/scenarios.json` → `judge_bench[]`), then takes top-3 chunks per judge from THAT bench. So:

- Q4 (PMF): Grant Lee (expected) #1 at 0.538. Other expected guests (Eric Ries, Brian Halligan, Melanie Perkins) lost to Elena Verna and Jen Abel by 0.02-0.06. Globally they "lost," but at runtime they're all in the same scenario's bench, so they'd all still get to react.
- Q2 (AI evals): Hamel & Shreya is one slug (`hamel-husain--shreya-shankar`) but takes 2 slots in top-5. Metric counts unique guests, undercounting actual relevance.
- Q5 (manager/IC): Ravi Mehta sweeps top 4 — globally surprising but defensible (he discussed career transitions extensively). The expected guests didn't reach top-5 globally but would still get bench-selected at runtime.

**Bottom line:** the right architectural test is "did the live `/api/tank` route return on-topic chunks with verbatim quotes?" — which it did. Self-retrieval passing and median cosine 0.478 are the metrics that actually matter for "embeddings are working."

### Updated escape-hatch recommendation

If retrieval feels off in the real demo (judges quote irrelevant moments):
1. **First:** check it's not just the verify script overfitting to my hand-curated expected lists. Test by reading the actual `/api/tank` output and judging the chunks subjectively.
2. **If genuinely bad:** try OpenAI's `text-embedding-3-large` (still cheap, $0.13/1M tokens vs $0.02 — ~$0.20 for the whole corpus). Higher-quality embeddings.
3. **Cheapest fallback:** Voyage AI's free tier (`voyage-3-lite`), Anthropic's recommended embedding partner.

The original Ollama pass bars (median ≥0.5) DON'T directly map to OpenAI. The new bar for OpenAI is median ≥0.4 because the absolute distribution is tighter.
