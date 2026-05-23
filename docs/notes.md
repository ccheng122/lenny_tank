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

Output looks like:
```
=== Sanity check: self-retrieval ===
  ✅ caitlin-kalinowski-0 → top-3: caitlin-kalinowski-0, ...
  ✅ jenny-wen-15 → top-3: ...
  ✅ asha-sharma-9 → top-3: ...
Self-retrieval: 3/3 found themselves in top-3
```

**Pass bar:** 3/3.
**If you see < 3/3:** something is fundamentally broken (embeddings not generated, dimension mismatch, or the script can't read the data). Don't proceed — debug before anything else. Most likely: embeddings weren't actually generated, or were generated with a different model and the vectors don't line up.

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
