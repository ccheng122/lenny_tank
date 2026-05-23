# Notes

Working notes and operational guidance. Less formal than `decisions.md`. Add new entries with date-stamped headings.

---

## What to look for when verifying embeddings

_2026-05-23_

Run the script with:
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
