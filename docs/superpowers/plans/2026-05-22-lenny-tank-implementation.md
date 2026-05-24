# The Lenny Tank Implementation Plan

> **Execution model:** This plan has two phases of execution.
> - **Phase 0 (local, Claude Code):** Data prep. Run in this repo (`lennys-newsletterpodcastdata`) via Claude Code. Produces `data/` artifacts (chunks, embeddings, character sheets, scenarios) that get committed and then copied into the Replit project.
> - **Phases 1–6 (Replit Agent in chunks):** Each task is a focused prompt you paste into Replit Agent, with a verification step before moving on. Don't paste the next prompt until the current one works.
>
> Steps use checkbox (`- [ ]`) syntax. Mark each as you complete it.

**Goal:** Build the Lenny Tank — a Shark-Tank-style web app where users pick a scenario and get judged by 3 AI personas of real Lenny's Podcast guests, with verbatim citations.

**Architecture:** Static JSON data artifacts (per-guest character sheets + chunked+embedded transcripts) shipped with the Replit Next.js app. At runtime, the app embeds (scenario + move) via OpenAI, runs in-memory cosine similarity against the relevant judge's chunks, then sends top chunks + character sheet to Claude Haiku 4.5 to produce a reaction + score + verbatim pull-quote. Aggregate verdict is one additional LLM call.

**Tech Stack:**
- Next.js 16 (App Router) + TypeScript + Tailwind — Replit Agent has strong defaults here
- Anthropic SDK (Claude Haiku 4.5 at runtime, Sonnet 4.6 for one-time character sheets)
- **Ollama** (`nomic-embed-text`, 768-dim) for Phase 0 embeddings — runs locally, no API cost
- `@vercel/og` for share-card PNG generation
- Vercel-style serverless functions (Next.js route handlers)
- Deploy: Replit

**Open consideration — runtime embeddings for free-text scenarios:** Ollama runs locally and Replit can't reach it. The plan defers this until Phase 3: for curated scenarios we use pre-computed embeddings shipped with the repo (no runtime embedding call); for free-text scenarios the MVP either restricts the path or uses Voyage AI's free tier as the runtime embedding service. We'll decide at Task 3.1.

**Reference:** See spec at `docs/superpowers/specs/2026-05-22-lenny-tank-design.md`.

---

## Phase 0 — Local Data Prep (Claude Code in this repo)

All Phase 0 tasks run in the working directory `/Users/claracheng/Documents/Projects/lennys_podcast/lennys-newsletterpodcastdata`. Outputs land in `data/`. Commit after each task.

### Task 0.1: Scaffold the data-prep environment

**Files:**
- Create: `data/guests/.gitkeep`
- Create: `data/chunks/.gitkeep`
- Create: `data/scenarios.json` (empty shell)
- Create: `scripts/` directory
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.env.example`
- Modify: `.gitignore`

- [ ] **Step 1: Create directory structure and stub files**

```bash
mkdir -p data/guests data/chunks scripts
touch data/guests/.gitkeep data/chunks/.gitkeep
echo '{}' > data/scenarios.json
```

- [ ] **Step 2: Initialize Node project**

```bash
npm init -y
npm install @anthropic-ai/sdk gray-matter dotenv
npm install -D typescript tsx @types/node
```

We use `fetch` directly to call Ollama's HTTP API — no SDK needed. Anthropic SDK stays for character-sheet generation.

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["scripts/**/*.ts"]
}
```

- [ ] **Step 4: Create `.env.example` and update `.gitignore`**

`.env.example`:
```
ANTHROPIC_API_KEY=sk-ant-...
# Ollama runs locally; OLLAMA_HOST defaults to http://localhost:11434
# Set OLLAMA_HOST only if Ollama is bound to a non-default address.
OLLAMA_HOST=http://localhost:11434
```

Append to `.gitignore`:
```
node_modules/
.env
*.log
```

- [ ] **Step 5: Create your real `.env`**

```bash
cp .env.example .env
# Then edit .env to add real keys
```

- [ ] **Step 6: Commit scaffold**

```bash
git add data/ scripts/ package.json package-lock.json tsconfig.json .env.example .gitignore
git commit -m "Phase 0.1: scaffold data prep environment"
```

---

### Task 0.2: Chunk all transcripts

**Files:**
- Create: `scripts/chunk-transcripts.ts`
- Outputs: `data/chunks/{slug}.json` (50 files)

- [ ] **Step 1: Write the chunking script**

Create `scripts/chunk-transcripts.ts`:

```typescript
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = path.join(__dirname, '..');
const PODCAST_DIR = path.join(ROOT, 'podcasts');
const OUTPUT_DIR = path.join(ROOT, 'data/chunks');
const TARGET_WORDS = 500;

interface Chunk {
  id: string;
  slug: string;
  idx: number;
  text: string;
  guest: string;
  episode_title: string;
  episode_date: string;
  post_url?: string;
}

function chunkText(text: string, targetWords: number): string[] {
  // Split on paragraph boundaries; group paragraphs until target word count is reached.
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    const proposed = current ? `${current}\n\n${para}` : para;
    const wordCount = proposed.split(/\s+/).length;
    if (wordCount > targetWords && current) {
      chunks.push(current);
      current = para;
    } else {
      current = proposed;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function main() {
  const files = fs.readdirSync(PODCAST_DIR).filter(f => f.endsWith('.md'));
  console.log(`Found ${files.length} podcast files`);

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(PODCAST_DIR, file), 'utf-8');
    const { data: fm, content: body } = matter(raw);

    const texts = chunkText(body, TARGET_WORDS);
    const chunks: Chunk[] = texts.map((text, idx) => ({
      id: `${slug}-${idx}`,
      slug,
      idx,
      text,
      guest: fm.guest ?? slug,
      episode_title: fm.title ?? slug,
      episode_date: fm.date ?? '',
      post_url: fm.post_url,
    }));

    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${slug}.json`),
      JSON.stringify(chunks, null, 2),
    );
    console.log(`  ${slug}: ${chunks.length} chunks`);
  }
  console.log('Done.');
}

main();
```

- [ ] **Step 2: Run it**

```bash
npx tsx scripts/chunk-transcripts.ts
```

Expected: 50 lines like `boris-cherny: 38 chunks`, then `Done.`

- [ ] **Step 3: Spot-check output**

```bash
ls data/chunks/ | wc -l                  # Expected: 50 + 1 (.gitkeep) = 51
cat data/chunks/boris-cherny.json | head -40   # Should show chunk #0 with text
```

- [ ] **Step 4: Commit**

```bash
git add scripts/chunk-transcripts.ts data/chunks/
git commit -m "Phase 0.2: chunk transcripts into 500-word segments"
```

---

### Task 0.2-fix: Make the chunker robust to single-newline transcripts

**Why:** at least one transcript (`ravi-mehta.md`) uses single newlines between speaker turns instead of blank lines, so the `\n\n+` splitter sees the whole body as one paragraph and emits a single oversized chunk. Any chunk where (raw split produces < 5 chunks OR any chunk exceeds 2× `targetWords`) should be sub-split.

**Files:**
- Modify: `scripts/chunk-transcripts.ts`
- Regenerate: `data/chunks/{slug}.json`

- [ ] **Step 1: Replace `chunkText` with a 2-pass splitter**

```typescript
function chunkText(text: string, targetWords: number): string[] {
  // Pass 1: split on blank-line paragraphs.
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  const coarse: string[] = [];
  let current = '';
  for (const para of paragraphs) {
    const proposed = current ? `${current}\n\n${para}` : para;
    if (proposed.split(/\s+/).length > targetWords && current) {
      coarse.push(current);
      current = para;
    } else {
      current = proposed;
    }
  }
  if (current) coarse.push(current);

  // Pass 2: any coarse chunk exceeding 2× target gets sub-split on single newlines.
  const finalChunks: string[] = [];
  for (const chunk of coarse) {
    if (chunk.split(/\s+/).length <= targetWords * 2) {
      finalChunks.push(chunk);
      continue;
    }
    const lines = chunk.split(/\n+/).map(l => l.trim()).filter(Boolean);
    let inner = '';
    for (const line of lines) {
      const proposed = inner ? `${inner}\n${line}` : line;
      if (proposed.split(/\s+/).length > targetWords && inner) {
        finalChunks.push(inner);
        inner = line;
      } else {
        inner = proposed;
      }
    }
    if (inner) finalChunks.push(inner);
  }

  return finalChunks;
}
```

- [ ] **Step 2: Delete stale chunks and re-run**

```bash
rm data/chunks/*.json
npx tsx scripts/chunk-transcripts.ts
```

Expected: `ravi-mehta` now produces > 1 chunk (something in the 25-50 range). Other files should be unchanged (the second pass is a no-op when chunks are already small).

- [ ] **Step 3: Verify ravi-mehta specifically**

```bash
node -e "console.log(require('./data/chunks/ravi-mehta.json').length)"
```

Expected: at least 20.

- [ ] **Step 4: Commit**

```bash
git add scripts/chunk-transcripts.ts data/chunks/
git commit -m "Phase 0.2-fix: sub-split oversized chunks on single newlines"
```

---

### Task 0.3: Generate embeddings for all chunks (Ollama, runs locally)

**Prerequisite:** Install Ollama (https://ollama.com/download) and pull the embeddings model:
```bash
ollama pull nomic-embed-text
ollama serve &  # if not already running as a service
```

Verify Ollama is reachable:
```bash
curl http://localhost:11434/api/version  # should return JSON with version
```

**Files:**
- Create: `scripts/embed-chunks.ts`
- Modifies: `data/chunks/{slug}.json` (adds `embedding` field to each chunk)

- [ ] **Step 1: Write the embedding script**

Create `scripts/embed-chunks.ts`:

```typescript
import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';

const ROOT = path.join(__dirname, '..');
const CHUNKS_DIR = path.join(ROOT, 'data/chunks');
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const MODEL = 'nomic-embed-text';

async function embedOne(text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, prompt: text }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Ollama error ${res.status}: ${errText}`);
  }
  const data = await res.json() as { embedding: number[] };
  return data.embedding;
}

async function main() {
  const files = fs.readdirSync(CHUNKS_DIR).filter(f => f.endsWith('.json'));
  console.log(`Embedding ${files.length} guest files via Ollama (${MODEL})`);

  for (const file of files) {
    const filepath = path.join(CHUNKS_DIR, file);
    const chunks = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

    // Skip files where embeddings already exist (idempotent re-runs).
    if (chunks.length > 0 && chunks[0].embedding) {
      console.log(`  ${file}: already embedded, skipping`);
      continue;
    }

    // Ollama's /api/embeddings is one-at-a-time; process sequentially.
    for (let i = 0; i < chunks.length; i++) {
      chunks[i].embedding = await embedOne(chunks[i].text);
    }

    fs.writeFileSync(filepath, JSON.stringify(chunks, null, 2));
    console.log(`  ${file}: ${chunks.length} chunks embedded`);
  }
  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Run it** (you run this when ready; subagents skip execution)

```bash
npx tsx scripts/embed-chunks.ts
```

Expected: 50 lines like `boris-cherny.json: 38 chunks embedded`. Takes 5–20 minutes depending on your hardware (Ollama embeds one-at-a-time, ~50-200ms per chunk). If it errors midway, re-run — the script skips already-embedded files.

- [ ] **Step 3: Verify**

```bash
node -e "const c = require('./data/chunks/boris-cherny.json'); console.log('chunks:', c.length, 'embedding dims:', c[0].embedding.length);"
```

Expected: `chunks: 38 embedding dims: 768`

- [ ] **Step 4: Check file sizes**

```bash
du -sh data/chunks/
```

Expected: somewhere in the 25–75 MB range (768-dim vectors are half the size of OpenAI's 1536-dim). If above 100 MB, consider truncating chunks per file before committing.

- [ ] **Step 5: Commit**

```bash
git add scripts/embed-chunks.ts data/chunks/
git commit -m "Phase 0.3: generate Ollama embeddings for chunks"
```

---

### Task 0.3.5: Verify embedding quality

**Why:** Ollama's `nomic-embed-text` is smaller than OpenAI's model. Before depending on it for the demo, run a smoke test to confirm retrieval returns sensible results (right guests dominate for known queries).

**Files:**
- Create: `scripts/verify-embeddings.ts`

- [ ] **Step 1: Write the verification script**

```typescript
import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';

const ROOT = path.join(__dirname, '..');
const CHUNKS_DIR = path.join(ROOT, 'data/chunks');
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const MODEL = 'nomic-embed-text';

interface ChunkWithEmbedding {
  id: string;
  slug: string;
  text: string;
  guest: string;
  episode_title: string;
  embedding: number[];
}

const TEST_QUERIES: { query: string; expectedGuests: string[] }[] = [
  {
    query: 'How do I improve user retention?',
    expectedGuests: ['elena-verna-40', 'albert-cheng', 'jason-cohen', 'amol-avasare'],
  },
  {
    query: 'Our AI feature hallucinates — how do we evaluate it?',
    expectedGuests: ['hamel-husain--shreya-shankar', 'cat-wu', 'asha-sharma', 'claire-vo-openclaw'],
  },
  {
    query: 'I need to have a hard performance conversation with an employee',
    expectedGuests: ['molly-graham', 'rachel-lockett', 'ben-horowitz', 'matt-macinnis'],
  },
  {
    query: 'How do I find product-market fit early on?',
    expectedGuests: ['eric-ries-2', 'melanie-perkins', 'grant-lee', 'brian-halligan'],
  },
  {
    query: 'Should I become a manager or stay an individual contributor?',
    expectedGuests: ['sam-lessin', 'nikhyl-singhal-2', 'keith-rabois'],
  },
];

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function embed(text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, prompt: text }),
  });
  if (!res.ok) throw new Error(`Ollama error ${res.status}: ${await res.text()}`);
  const data = await res.json() as { embedding: number[] };
  return data.embedding;
}

function loadAllChunks(): ChunkWithEmbedding[] {
  const files = fs.readdirSync(CHUNKS_DIR).filter(f => f.endsWith('.json'));
  const all: ChunkWithEmbedding[] = [];
  for (const file of files) {
    const chunks = JSON.parse(fs.readFileSync(path.join(CHUNKS_DIR, file), 'utf-8'));
    all.push(...chunks);
  }
  if (all.length === 0 || !all[0].embedding) {
    throw new Error('No embeddings found. Run `npx tsx scripts/embed-chunks.ts` first.');
  }
  return all;
}

function topK(queryEmb: number[], chunks: ChunkWithEmbedding[], k: number): { chunk: ChunkWithEmbedding; score: number }[] {
  const scored = chunks.map(c => ({ chunk: c, score: cosine(queryEmb, c.embedding) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

async function runSelfRetrieval(chunks: ChunkWithEmbedding[]) {
  console.log('\n=== Sanity check: self-retrieval ===');
  const samples = [chunks[0], chunks[Math.floor(chunks.length / 2)], chunks[chunks.length - 1]];
  let passed = 0;
  for (const sample of samples) {
    const queryEmb = await embed(sample.text.slice(0, 1500));
    const top = topK(queryEmb, chunks, 3);
    const found = top.some(t => t.chunk.id === sample.id);
    console.log(`  ${found ? '✅' : '❌'} ${sample.id} → top-3: ${top.map(t => t.chunk.id).join(', ')}`);
    if (found) passed++;
  }
  console.log(`Self-retrieval: ${passed}/${samples.length} found themselves in top-3`);
}

async function runTopicalQueries(chunks: ChunkWithEmbedding[]) {
  console.log('\n=== Topical relevance: hand-curated queries ===');
  for (const test of TEST_QUERIES) {
    console.log(`\nQuery: "${test.query}"`);
    console.log(`Expecting dominant guests from: ${test.expectedGuests.join(', ')}`);
    const queryEmb = await embed(test.query);
    const top = topK(queryEmb, chunks, 5);
    const topGuests = new Set(top.map(t => t.chunk.slug));
    const matches = test.expectedGuests.filter(g => topGuests.has(g));
    console.log(`  ${matches.length >= 2 ? '✅' : '⚠️ '} ${matches.length}/${test.expectedGuests.length} expected guests in top-5`);
    for (const t of top) {
      const snippet = t.chunk.text.replace(/\s+/g, ' ').slice(0, 100);
      const flag = test.expectedGuests.includes(t.chunk.slug) ? '✓' : ' ';
      console.log(`    ${flag} [${t.score.toFixed(3)}] ${t.chunk.guest}: ${snippet}...`);
    }
  }
}

async function runCustomQuery(query: string, chunks: ChunkWithEmbedding[]) {
  console.log(`\n=== Custom query: "${query}" ===`);
  const queryEmb = await embed(query);
  const top = topK(queryEmb, chunks, 5);
  for (const t of top) {
    const snippet = t.chunk.text.replace(/\s+/g, ' ').slice(0, 150);
    console.log(`  [${t.score.toFixed(3)}] ${t.chunk.guest} (${t.chunk.episode_title}): ${snippet}...`);
  }
}

async function main() {
  const chunks = loadAllChunks();
  console.log(`Loaded ${chunks.length} chunks across ${new Set(chunks.map(c => c.slug)).size} guests`);

  const customQuery = process.argv.find(a => a.startsWith('--query='))?.replace('--query=', '');
  if (customQuery) {
    await runCustomQuery(customQuery, chunks);
    return;
  }

  await runSelfRetrieval(chunks);
  await runTopicalQueries(chunks);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Run it** (after embeddings exist)

```bash
npx tsx scripts/verify-embeddings.ts
```

Expected output:
- Self-retrieval: 3/3 pass
- Topical: ideally 4/5 queries hit ≥2 expected guests in top-5. If under 2/5 queries pass, embedding quality is concerning — consider switching to OpenAI or Voyage AI for embeddings.

For one-off exploration:
```bash
npx tsx scripts/verify-embeddings.ts --query="how to ship AI features fast"
```

- [ ] **Step 3: Commit**

```bash
git add scripts/verify-embeddings.ts
git commit -m "Phase 0.3.5: embedding-quality verification script"
```

---

### Task 0.4: Generate character sheets for all guests

**Files:**
- Create: `scripts/build-character-sheets.ts`
- Outputs: `data/guests/{slug}.json` (50 files)

- [ ] **Step 1: Write the script**

Create `scripts/build-character-sheets.ts`:

```typescript
import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import matter from 'gray-matter';

const ROOT = path.join(__dirname, '..');
const PODCAST_DIR = path.join(ROOT, 'podcasts');
const OUTPUT_DIR = path.join(ROOT, 'data/guests');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are analyzing a podcast transcript to build a "character sheet" for the guest. Your output will be used to generate in-voice persona responses to product/career scenarios, so capture what makes this person distinctive.

Output strict JSON matching this schema:
{
  "persona_summary": "one paragraph (3-5 sentences) capturing their worldview, what they advocate for, and their general vibe",
  "core_frameworks": ["3-5 concise items, each a framework or principle they emphasize"],
  "signature_phrases": ["3-7 distinctive phrases or vocabulary they use repeatedly"],
  "pushes_back_on": ["3-5 things they explicitly criticize, dismiss, or warn against"],
  "speaking_style": "one sentence on tone, pacing, and how they argue (e.g. 'direct, contrarian, uses concrete examples', 'measured and analogical')"
}

Be specific. Avoid generic startup-advice platitudes. Quote distinctive language where possible.`;

async function buildSheet(slug: string, body: string, fm: any) {
  const truncated = body.slice(0, 60000); // ~15k tokens, leaves room for response
  const res = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Guest: ${fm.guest ?? slug}\nEpisode: ${fm.title ?? slug}\n\nTranscript:\n${truncated}`,
    }],
  });

  const text = res.content[0].type === 'text' ? res.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON in response for ${slug}: ${text.slice(0, 200)}`);
  return JSON.parse(jsonMatch[0]);
}

async function main() {
  const files = fs.readdirSync(PODCAST_DIR).filter(f => f.endsWith('.md'));
  console.log(`Building character sheets for ${files.length} guests`);

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const outPath = path.join(OUTPUT_DIR, `${slug}.json`);

    if (fs.existsSync(outPath)) {
      console.log(`  ${slug}: already exists, skipping`);
      continue;
    }

    const raw = fs.readFileSync(path.join(PODCAST_DIR, file), 'utf-8');
    const { data: fm, content: body } = matter(raw);

    try {
      const sheet = await buildSheet(slug, body, fm);
      const out = {
        slug,
        guest: fm.guest ?? slug,
        episode_title: fm.title ?? slug,
        episode_date: fm.date ?? '',
        post_url: fm.post_url,
        ...sheet,
      };
      fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
      console.log(`  ${slug}: ✓`);
    } catch (err: any) {
      console.error(`  ${slug}: FAILED — ${err.message}`);
    }
  }
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
```

- [ ] **Step 2: Run it**

```bash
npx tsx scripts/build-character-sheets.ts
```

Expected: 50 lines like `boris-cherny: ✓`. Takes 5–10 minutes (one Sonnet call per guest, ~10-15s each). Idempotent — re-runnable if interrupted.

- [ ] **Step 3: Spot-check 3 character sheets**

```bash
cat data/guests/eric-ries-2.json
cat data/guests/elena-verna-40.json
cat data/guests/boris-cherny.json
```

Each should have all 5 fields (`persona_summary`, `core_frameworks`, `signature_phrases`, `pushes_back_on`, `speaking_style`) filled with non-generic content. Eric Ries should mention validated learning / MVPs. Boris should mention Claude Code / shipping fast.

If any are generic ("delivers practical insights about product development"), regenerate that one by deleting its file and re-running the script.

- [ ] **Step 4: Commit**

```bash
git add scripts/build-character-sheets.ts data/guests/
git commit -m "Phase 0.4: generate character sheets for all 50 guests"
```

---

### Task 0.5: Author scenario cards

**Files:**
- Modify: `data/scenarios.json`

- [ ] **Step 1: Replace `data/scenarios.json` with the full 25-card deck**

Use this structure as the spine, then fill in the 4 remaining cards per bucket using Claude Code interactively:

```json
{
  "growth": [
    {
      "id": "retention-cliff",
      "title": "The Retention Cliff",
      "setup": "You're a PM at a B2C AI app. Day-1 activation is 70%, but only 12% of users return after week 2. Leadership wants to launch a referral program. Marketing wants more paid acquisition spend.",
      "suggested_moves": [
        "Pause growth spend; fix the leaky bucket first",
        "Ship the referral program anyway — momentum matters",
        "Dig into the week-2 cohort to understand who churns and why"
      ],
      "judge_bench": ["elena-verna-40", "albert-cheng", "jason-cohen", "amol-avasare", "ethan-smith"],
      "themes": ["retention", "growth-levers", "cohorts"]
    }
  ],
  "shipping-ai": [
    {
      "id": "demo-or-delay",
      "title": "Demo or Delay",
      "setup": "Your AI feature works 70% of the time. Leadership wants it in the keynote demo next week. Your eval suite is half-built and shows clear failure modes.",
      "suggested_moves": [
        "Ship it for the keynote — fix issues after",
        "Push back hard; refuse to demo until evals look good",
        "Demo with a narrow scope that hides the failure modes"
      ],
      "judge_bench": ["cat-wu", "boris-cherny", "asha-sharma", "hamel-husain--shreya-shankar", "claire-vo-openclaw"],
      "themes": ["evals", "shipping-velocity", "AI-quality"]
    }
  ],
  "leadership": [
    {
      "id": "checked-out-star",
      "title": "The Checked-Out Star",
      "setup": "Your highest-output engineer has visibly disengaged in the last 2 months. Reviews are due in 2 weeks. The team is starting to notice.",
      "suggested_moves": [
        "Have the hard conversation now, before reviews",
        "Wait for reviews; gather more data first",
        "Reassign their highest-priority project to someone else"
      ],
      "judge_bench": ["molly-graham", "rachel-lockett", "matt-macinnis", "ben-horowitz", "jessica-fain"],
      "themes": ["performance-management", "difficult-conversations", "team-dynamics"]
    }
  ],
  "zero-to-one": [
    {
      "id": "love-but-no-pay",
      "title": "Love But No Pay",
      "setup": "Your first 10 users adore your product and use it daily. None of them are willing to pay. Your runway is 5 months.",
      "suggested_moves": [
        "Pivot the audience to one with budget",
        "Charge anyway and see who churns",
        "Keep building; figure out monetization at 100 users"
      ],
      "judge_bench": ["eric-ries-2", "melanie-perkins", "grant-lee", "brian-halligan", "stewart-butterfield"],
      "themes": ["pmf", "monetization", "early-traction"]
    }
  ],
  "career": [
    {
      "id": "pm-as-pmgr",
      "title": "PM As Project Manager",
      "setup": "You're a PM at a fast-growing startup. Eng treats you like a project manager — tickets, dates, standups. You want strategic input but no one's asking.",
      "suggested_moves": [
        "Stop showing up at standups; create vacuum for someone else",
        "Pitch a strategy doc unprompted; force a seat at the table",
        "Find an exec sponsor first; build influence before reach"
      ],
      "judge_bench": ["sam-lessin", "tomer-cohen", "keith-rabois", "dr-becky-kennedy", "nikhyl-singhal-2"],
      "themes": ["influence", "role-clarity", "career-strategy"]
    }
  ]
}
```

- [ ] **Step 2: Add 4 more cards per bucket using Claude Code**

Open Claude Code and ask it: *"Read the spec at `docs/superpowers/specs/2026-05-22-lenny-tank-design.md` and the seed scenario in `data/scenarios.json`. Generate 4 more scenario cards for each of the 5 buckets, matching the JSON shape exactly. Each card must: (1) have a distinct tension from the others in its bucket; (2) reference a real role/number/situation; (3) vary protagonist roles across cards (not always 'you're the CEO'); (4) map to a tension where multiple bench guests have distinct views."*

Verify it produces 5 cards per bucket (25 total) before saving.

- [ ] **Step 3: Validate scenarios**

```bash
node -e "const s = require('./data/scenarios.json'); for (const k of Object.keys(s)) console.log(k, s[k].length); console.log('total:', Object.values(s).flat().length);"
```

Expected:
```
growth 5
shipping-ai 5
leadership 5
zero-to-one 5
career 5
total: 25
```

Also verify every `judge_bench` slug matches a file in `data/guests/`:

```bash
node -e "
const s = require('./data/scenarios.json');
const fs = require('fs');
const guests = new Set(fs.readdirSync('./data/guests').filter(f=>f.endsWith('.json')).map(f=>f.replace('.json','')));
for (const cards of Object.values(s)) for (const c of cards) for (const j of c.judge_bench) {
  if (!guests.has(j)) console.log('MISSING:', j, 'in', c.id);
}
console.log('done');
"
```

Expected: just `done` with no `MISSING` lines.

- [ ] **Step 4: Commit**

```bash
git add data/scenarios.json
git commit -m "Phase 0.5: author 25 scenario cards across 5 buckets"
```

---

### Task 0.6: Bundle data for Replit

**Files:**
- Create: `data/index.ts` (TypeScript types + barrel export)
- Create: `data/README.md` (notes on the data shape, for future you and Replit Agent)

- [ ] **Step 1: Create `data/index.ts`**

```typescript
export interface Chunk {
  id: string;
  slug: string;
  idx: number;
  text: string;
  guest: string;
  episode_title: string;
  episode_date: string;
  post_url?: string;
  embedding: number[];
}

export interface CharacterSheet {
  slug: string;
  guest: string;
  episode_title: string;
  episode_date: string;
  post_url?: string;
  persona_summary: string;
  core_frameworks: string[];
  signature_phrases: string[];
  pushes_back_on: string[];
  speaking_style: string;
}

export interface ScenarioCard {
  id: string;
  title: string;
  setup: string;
  suggested_moves: string[];
  judge_bench: string[];
  themes: string[];
}

export type Bucket = 'growth' | 'shipping-ai' | 'leadership' | 'zero-to-one' | 'career';

export interface ScenarioDeck {
  growth: ScenarioCard[];
  'shipping-ai': ScenarioCard[];
  leadership: ScenarioCard[];
  'zero-to-one': ScenarioCard[];
  career: ScenarioCard[];
}

export const BUCKET_LABELS: Record<Bucket, string> = {
  'growth': 'Growth & Retention',
  'shipping-ai': 'Shipping AI',
  'leadership': 'Leadership & Tough Calls',
  'zero-to-one': 'Zero-to-One',
  'career': 'Career Crossroads',
};
```

- [ ] **Step 2: Create `data/README.md`**

```markdown
# Data artifacts

Generated by Phase 0 scripts. Imported by the Replit Lenny Tank app.

- `guests/{slug}.json` — character sheets (50 guests). See `index.ts:CharacterSheet`.
- `chunks/{slug}.json` — embedded transcript chunks (~500 words each). See `index.ts:Chunk`.
- `scenarios.json` — 25 curated scenario cards across 5 buckets. See `index.ts:ScenarioDeck`.

All chunks use Ollama `nomic-embed-text` (768-dim), generated locally.

## Regenerating

```bash
npx tsx scripts/chunk-transcripts.ts
npx tsx scripts/embed-chunks.ts
npx tsx scripts/build-character-sheets.ts
```

Each script is idempotent — re-running skips already-completed work.
```

- [ ] **Step 3: Commit**

```bash
git add data/index.ts data/README.md
git commit -m "Phase 0.6: data types and README"
```

Phase 0 complete. The `data/` folder is now everything the Replit app needs to consume.

---

## Phase 1 — Replit Scaffold + Landing Page

**Handoff:** Start a new Replit project (Next.js template). The `data/` folder needs to be copied in before you start prompting Replit Agent. Each Phase 1+ task is one prompt to paste into Replit Agent.

### Task 1.0: Get the data into Replit

**Why this is its own task:** `data/chunks/` contains ~50–150 MB of embeddings (50 files, each with 1536-dim vectors per chunk). Replit's drag-and-drop UI struggles with that volume. Use one of these paths:

- [ ] **Path A (recommended): Git pull in Replit shell.**

If your `lennys-newsletterpodcastdata` repo is on GitHub, in the Replit shell after creating the Next.js project:

```bash
git clone --depth 1 <your-data-repo-url> /tmp/data-repo
cp -r /tmp/data-repo/data ./data
ls data/chunks | wc -l   # Expect 51 (50 files + .gitkeep)
ls data/guests | wc -l   # Expect 51
```

- [ ] **Path B: Zip + upload.**

```bash
# In this repo, locally:
tar czf data.tar.gz data/
# Upload data.tar.gz via Replit's file UI
# Then in Replit shell:
tar xzf data.tar.gz && rm data.tar.gz
```

- [ ] **Path C: Replit's GitHub import.**

Create a new Replit project by importing from your `lennys-newsletterpodcastdata` GitHub repo (which now contains `data/`). Then layer Next.js on top, or extract just the `data/` folder and start fresh with a Next.js template.

### Task 1.1: Initialize Replit project with the bucket landing page

- [ ] **Step 1: Set up Replit project**

Create a new Repl using the "Next.js" template. Confirm `data/` is in the project root (from Task 1.0). Verify with:

```bash
ls data/  # Expect: chunks/ guests/ index.ts README.md scenarios.json
```

- [ ] **Step 2: Add environment variables in Replit**

In the Replit "Secrets" tab, add:
- `ANTHROPIC_API_KEY` (same key as in your local `.env`)
- `OPENAI_API_KEY` (same key as in your local `.env`)

- [ ] **Step 3: Paste this prompt into Replit Agent**

```
Build the landing page for "The Lenny Tank" — a Shark-Tank-style scenario practice app.

Stack: Next.js 16 App Router, TypeScript, Tailwind CSS. The data folder at /data is already populated; do not modify it.

This prompt only asks you to build the landing page. Do NOT add API routes, AI integration, or scenario flow yet — that comes in later steps.

Requirements:
1. Use the App Router pattern. The root route ("/") shows the landing page.
2. Header: app title "The Lenny Tank" with subtitle "Practice the high-stakes decisions of your craft. Get feedback from people who've already lived them."
3. Below the subtitle, render 5 bucket tiles in a responsive grid (1 col mobile, 2-3 cols desktop). Each tile shows:
   - Bucket emoji (Growth: 📈, Shipping AI: 🤖, Leadership: 🧭, Zero-to-One: 🚀, Career: 🎯)
   - Bucket label (use BUCKET_LABELS from /data/index.ts)
   - 1-line description of who it's for
4. Bucket data MUST come from importing /data/index.ts. Don't hardcode.
5. Each tile is a Next.js Link to /bucket/[slug] (slug = bucket key). The /bucket route doesn't exist yet — that's the next step. For now just create the link.
6. Style: dark mode, big punchy headline, generous spacing. Imagine a startup landing page that wants to feel like a game, not a quiz.

Do not build /bucket pages or any other routes. Only the landing page.
```

- [ ] **Step 4: Verify**

Visit the Replit preview URL. You should see:
- App title "The Lenny Tank"
- The mission subtitle
- 5 bucket tiles arranged in a grid
- Hover/click feedback on tiles (clicking a tile navigates to /bucket/growth or similar — page will 404 since /bucket route doesn't exist yet, that's fine)

If anything is off (hardcoded data, wrong styling, extra features), give Replit Agent a targeted correction prompt before moving on.

---

## Phase 2 — Scenario Browsing

### Task 2.1: Bucket page showing scenario cards

- [ ] **Step 1: Paste this prompt into Replit Agent**

```
Build the bucket page at /bucket/[slug] for The Lenny Tank.

Context: I just built the landing page. The 5 bucket tiles on / link to /bucket/[slug] where slug is one of: growth, shipping-ai, leadership, zero-to-one, career. The data is in /data/scenarios.json (typed by /data/index.ts:ScenarioDeck). Use BUCKET_LABELS for the page title.

Requirements:
1. Server component reads /data/scenarios.json. If the slug isn't a valid Bucket, return a 404 (use notFound()).
2. Page header: bucket emoji + label + a "← Back" link to /.
3. Render the 5 scenario cards for that bucket in a single-column list (cards are wide, easy to read). Each card shows:
   - Title (large)
   - Setup paragraph
   - "Suggested moves:" header followed by the 3 suggested moves as clickable buttons, plus a 4th button labeled "✏️ Write my own move"
   - When the user clicks a move (suggested or own), navigate to /tank?scenarioId=X&moveId=Y where moveId is the array index 0-2 for suggested or "custom" for own
4. At the very bottom of the page, after the 5 cards, render an "✏️ Write your own scenario" affordance (button or expandable form). Clicking it navigates to /tank?scenarioId=custom (we'll handle the form on the /tank page in a later step).
5. Style: match the dark-mode landing page. Cards have hover states. Move buttons feel tactile.

Do NOT yet implement the /tank page. The buttons just need to navigate with the correct query params.
```

- [ ] **Step 2: Verify**

1. Click each of the 5 bucket tiles from /; you should see 5 scenario cards in each.
2. Verify no two buckets share the same cards.
3. Click a suggested move; the URL changes to /tank?scenarioId=X&moveId=Y but the page may 404. That's fine — Task 2.2 builds /tank.
4. Click "← Back"; you return to /.

---

### Task 2.2: Tank page that captures the user's move and free-text inputs

- [ ] **Step 1: Paste this prompt into Replit Agent**

```
Build the /tank page for The Lenny Tank.

The /tank page accepts query params: scenarioId (string), moveId ("0" | "1" | "2" | "custom"). Both may be undefined or "custom".

Requirements:

1. Server component reads /data/scenarios.json. Resolve the scenario by id (across all buckets). If scenarioId is undefined or "custom", render a "Write your own scenario" form (textarea labeled "Describe the situation you're facing", with a submit button that navigates to /tank?scenarioId=custom&moveId=custom&scenarioText=<encoded>).

2. If a valid scenario is found AND moveId is "0", "1", or "2", display:
   - The scenario title + setup at the top (so the user sees context)
   - Their chosen move (the resolved suggested move text) below
   - A "Step into the Tank" button that navigates to /tank/result?scenarioId=X&moveId=Y (this route doesn't exist yet — that's the next step)

3. If moveId is "custom" (and scenarioId resolves), display:
   - The scenario title + setup
   - A textarea labeled "Your move" with placeholder "What do you do?"
   - A submit button "Step into the Tank" that navigates to /tank/result?scenarioId=X&moveId=custom&moveText=<encoded>

4. If scenarioId is "custom" and moveId is "custom", show both textareas (scenario + move), then submit goes to /tank/result?scenarioId=custom&moveId=custom&scenarioText=<encoded>&moveText=<encoded>

5. Style consistent with the rest of the app. Keep this page minimal — it's a transition screen.

Do NOT build /tank/result yet.
```

- [ ] **Step 2: Verify**

1. Click a suggested move from a bucket page; you land on /tank showing scenario + your move + "Step into the Tank" button.
2. Click "✏️ Write my own move" from a bucket page; you land on /tank showing scenario + a textarea.
3. Click "✏️ Write your own scenario" from a bucket page; you land on /tank showing two textareas.
4. The "Step into the Tank" buttons all navigate to /tank/result with correct query params.

---

## Phase 3 — Judge Reactions API

### Task 3.1: Set up retrieval utility and judge-reaction API route

- [ ] **Step 1: Paste this prompt into Replit Agent**

```
Build the core AI integration for The Lenny Tank.

I need a Next.js API route at /api/tank that takes a scenario + move and returns 3 judge reactions plus a final verdict.

I want you to build this in 3 files:

FILE 1: /lib/retrieval.ts
Purpose: given a query string and a guest slug, return the top-3 most relevant chunks from /data/chunks/{slug}.json.

```typescript
import OpenAI from 'openai';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { Chunk } from '@/data';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function embed(query: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  return res.data[0].embedding;
}

export async function topChunks(slug: string, queryEmbedding: number[], k = 3): Promise<Chunk[]> {
  const filepath = path.join(process.cwd(), 'data/chunks', `${slug}.json`);
  const chunks: Chunk[] = JSON.parse(await fs.readFile(filepath, 'utf-8'));
  const scored = chunks.map(c => ({ chunk: c, score: cosine(queryEmbedding, c.embedding) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map(s => s.chunk);
}
```

FILE 2: /lib/judges.ts
Purpose: given a scenario/move/chunks/character-sheet, ask Claude Haiku 4.5 to produce a reaction.

```typescript
import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { CharacterSheet, Chunk } from '@/data';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface JudgeReaction {
  slug: string;
  guest: string;
  episode_title: string;
  post_url?: string;
  reaction: string;
  pull_quote: string;
  score: number;
}

const SYSTEM = `You are role-playing as a podcast guest reacting to a product/career scenario. Use the character sheet to capture their voice. Be specific and in-character — avoid generic advice.

Output strict JSON:
{
  "reaction": "2-3 sentences in their voice reacting to the user's move. Reference specific aspects of their thinking. Avoid platitudes.",
  "pull_quote_idx": <integer 0-2: which of the provided chunks contains the best verbatim quote that supports your reaction>,
  "pull_quote": "<the EXACT verbatim text of a 1-3 sentence quote from that chunk — do not paraphrase, do not invent>",
  "score": <integer 1-10: how strongly this guest would endorse the user's move; calibrate to their philosophy>
}`;

export async function loadCharacterSheet(slug: string): Promise<CharacterSheet> {
  const filepath = path.join(process.cwd(), 'data/guests', `${slug}.json`);
  return JSON.parse(await fs.readFile(filepath, 'utf-8'));
}

export async function judgeReaction(args: {
  slug: string;
  sheet: CharacterSheet;
  scenarioSetup: string;
  move: string;
  chunks: Chunk[];
}): Promise<JudgeReaction> {
  const userPrompt = `CHARACTER SHEET for ${args.sheet.guest}:
Persona: ${args.sheet.persona_summary}
Core frameworks: ${args.sheet.core_frameworks.join('; ')}
Signature phrases: ${args.sheet.signature_phrases.join('; ')}
Pushes back on: ${args.sheet.pushes_back_on.join('; ')}
Speaking style: ${args.sheet.speaking_style}

SCENARIO:
${args.scenarioSetup}

USER'S MOVE:
${args.move}

CANDIDATE QUOTES from this guest's actual episode (pick ONE for your pull_quote, verbatim):
${args.chunks.map((c, i) => `[${i}] ${c.text}`).join('\n\n---\n\n')}

Now respond as ${args.sheet.guest} reacting to the user's move.`;

  const res = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    system: SYSTEM,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const text = res.content[0].type === 'text' ? res.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON in judge response for ${args.slug}`);
  const parsed = JSON.parse(jsonMatch[0]);

  return {
    slug: args.slug,
    guest: args.sheet.guest,
    episode_title: args.sheet.episode_title,
    post_url: args.sheet.post_url,
    reaction: parsed.reaction,
    pull_quote: parsed.pull_quote,
    score: parsed.score,
  };
}

export async function synthesizeVerdict(reactions: JudgeReaction[]): Promise<{ verdict: string; score: number }> {
  const avgScore = reactions.reduce((s, r) => s + r.score, 0) / reactions.length;
  const res = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    system: 'Synthesize 3 judge reactions into ONE sentence capturing the panel\'s overall stance. If they disagree, note the split. Be concise. Output a single sentence, no quotes around it.',
    messages: [{ role: 'user', content: reactions.map(r => `${r.guest}: ${r.reaction}`).join('\n\n') }],
  });
  const text = res.content[0].type === 'text' ? res.content[0].text.trim() : 'The panel has weighed in.';
  return { verdict: text, score: Math.round(avgScore * 10) / 10 };
}
```

FILE 3: /app/api/tank/route.ts
Purpose: orchestrate the runtime — embed query, pick 3 random judges, fetch top chunks per judge in parallel, run reactions in parallel, synthesize verdict, return JSON.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { embed, topChunks } from '@/lib/retrieval';
import { loadCharacterSheet, judgeReaction, synthesizeVerdict } from '@/lib/judges';
import scenarios from '@/data/scenarios.json';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { scenarioId, moveId, scenarioText, moveText } = body;

  let scenarioSetup: string;
  let move: string;
  let judgeBench: string[];

  if (scenarioId === 'custom') {
    scenarioSetup = scenarioText || '';
    move = moveText || '';
    // For custom scenarios, pick a default bench (universal judges).
    judgeBench = ['eric-ries-2', 'ben-horowitz', 'cat-wu', 'elena-verna-40', 'sam-lessin'];
  } else {
    const all = Object.values(scenarios).flat();
    const card = all.find((c: any) => c.id === scenarioId);
    if (!card) return NextResponse.json({ error: 'Scenario not found' }, { status: 400 });
    scenarioSetup = card.setup;
    move = moveId === 'custom' ? (moveText || '') : card.suggested_moves[parseInt(moveId)];
    judgeBench = card.judge_bench;
  }

  // Pick 3 random judges from the bench.
  const shuffled = [...judgeBench].sort(() => Math.random() - 0.5);
  const chosen = shuffled.slice(0, 3);

  // Embed once; reuse for all judges.
  const queryEmbedding = await embed(`${scenarioSetup}\n\nMove: ${move}`);

  // Run all 3 judges in parallel.
  const reactions = await Promise.all(chosen.map(async (slug) => {
    const [sheet, chunks] = await Promise.all([
      loadCharacterSheet(slug),
      topChunks(slug, queryEmbedding, 3),
    ]);
    return judgeReaction({ slug, sheet, scenarioSetup, move, chunks });
  }));

  const { verdict, score } = await synthesizeVerdict(reactions);

  return NextResponse.json({ reactions, verdict, score, scenarioSetup, move });
}
```

Don't add UI yet. Make sure the route compiles and is reachable.
```

- [ ] **Step 2: Verify the API works**

In Replit's shell, test directly:

```bash
curl -X POST http://localhost:3000/api/tank \
  -H "Content-Type: application/json" \
  -d '{"scenarioId":"retention-cliff","moveId":"0"}'
```

Expected: a JSON response with `reactions` (array of 3), `verdict` (string), `score` (number). If you get 500s, check Replit logs and ask Replit Agent to fix the specific error.

If pull_quotes look suspiciously paraphrased rather than verbatim, the model may be drifting. Re-run; if persistent, adjust the prompt to be stricter ("if you paraphrase, you fail the task").

---

### Task 3.2: Wire the Tank UI to the API

- [ ] **Step 1: Paste this prompt into Replit Agent**

```
Build the /tank/result page that calls /api/tank and renders the judge reactions.

This is a CLIENT component because the API call should run in the browser (so we can show a loading state).

Requirements:

1. /app/tank/result/page.tsx accepts query params: scenarioId, moveId, scenarioText (optional), moveText (optional).

2. On mount, POST to /api/tank with the params as a JSON body.

3. While loading, show a "The panel is convening..." spinner with the 3 judge slots empty.

4. When the response arrives, render in order:
   a) The scenario setup (small, at top, for context)
   b) The user's move (also small, below scenario)
   c) Three judge cards, side-by-side on desktop, stacked on mobile. Each card has:
      - Guest name (big)
      - Episode title + date (small, with a link to post_url if present)
      - The reaction text (2-3 sentences, prominent)
      - A "❝ ... ❞" block showing the verbatim pull_quote, visually distinct (italic, indented, bordered)
      - A score badge showing "<score> / 10" with color coding (1-4 red, 5-7 yellow, 8-10 green)
   d) Below the cards, the synthesized verdict ("THE PANEL HAS SPOKEN") with the aggregate score in large display.
   e) Three action buttons: [Share quote] [Share spirit judge] [Try another scenario → / ]

5. Streaming reveal is a NICE-TO-HAVE. For MVP, render all 3 judges at once when the response arrives. Add a 200ms fade-in if easy.

6. Style: dark mode, big text, lots of breathing room. The reactions are the hero content.

7. If the API returns an error, show a friendly error message and a "Try again" button.

Do NOT implement the share buttons functionally yet — just make them buttons that log "TODO" to console when clicked. We'll wire them up in the next step.
```

- [ ] **Step 2: End-to-end verify**

Go through the full flow:
1. Visit /. Click a bucket. Click a scenario. Click a suggested move. Click "Step into the Tank".
2. You should see "The panel is convening...", then ~6-8 seconds later, 3 judge cards appear with reactions + quotes + scores.
3. The reactions should sound different from each other in voice. Read all 3 — if they sound interchangeable, Phase 0 character sheets are too generic and need regeneration.
4. Pull-quotes should look like real conversational transcript text, not polished aphorisms.
5. Verdict appears at the bottom with an aggregate score.

If any step fails, give Replit Agent a targeted correction (e.g. "the score badges are showing 0 — debug what's coming back from the API").

---

## Phase 4 — Share Cards

### Task 4.1: "Best Advice I Got" share image

- [ ] **Step 1: Paste this prompt into Replit Agent**

```
Add a share-card feature to The Lenny Tank.

When the user clicks [Share quote] on /tank/result, generate a PNG image they can save/post.

Use @vercel/og for the image generation (already supported in Next.js 16). Create an OG route at /app/api/share/quote/route.tsx that takes query params: guest, quote, judges (comma-separated names), and renders a 1200x630 image with this layout:

- Dark background (slate-900 or near-black)
- Top: small label "I just sat with The Lenny Tank"
- Center: the verbatim quote in large quote marks ("❝ {quote} ❞") — limit to ~200 chars; truncate with "..." if longer
- Below quote: the guest name in attribution style ("— {guest}")
- Bottom: small text "Got tanked by: {judges}" and the app URL ("lennytank.app" — use a placeholder)
- Use Inter or a similar clean sans-serif

On /tank/result, the [Share quote] button:
1. Picks the highest-scoring reaction
2. Opens /api/share/quote?guest=...&quote=...&judges=... in a new tab so the user can right-click → save
3. OR: fetches the image as a blob and triggers a download with filename "lenny-tank-share.png"

Pick whichever pattern Replit Agent finds simpler.
```

- [ ] **Step 2: Verify**

Complete a round. Click [Share quote]. Confirm:
1. An image opens or downloads
2. The image renders the quote correctly (text fits, no overflow)
3. Long quotes are truncated gracefully
4. The image is readable when posted at thumbnail size (e.g. 400px wide)

---

### Task 4.2 (Nice-to-have): "Your Spirit Judge" share image

- [ ] **Step 1: Paste this prompt into Replit Agent**

```
Add a second share card variant to The Lenny Tank: "Your Spirit Judge".

Create a route /app/api/share/spirit/route.tsx that takes guest, role (episode title), tagline (use the persona_summary first sentence). Render at 1200x630:

- Dark background, slightly different accent color from the quote card
- Top: "I think most like..."
- Center, large: the guest name
- Below: their role (smaller)
- Below that, in italics: the tagline (truncate to ~120 chars)
- Bottom: app URL

On /tank/result, the [Share spirit judge] button picks the highest-scoring reaction's judge (their "spirit judge") and links to /api/share/spirit?guest=...&role=...&tagline=...

The persona_summary first sentence isn't in the API response yet — add it. Modify /lib/judges.ts to include the character sheet's persona_summary on each JudgeReaction. Update /app/api/tank/route.ts to pass it through.
```

- [ ] **Step 2: Verify**

Click [Share spirit judge] on /tank/result. An image opens/downloads with the highest-scoring judge as your "spirit judge."

---

## Phase 5 — Polish

Phase 5 covers three different kinds of polish: copy (5.1), visual/design (5.2), and behavior/bugs (5.3). The brand tokens established up-front (see `decisions.md` §16) mean styling work in this phase is mostly about applying tokens consistently, not redefining them. Run tasks in order — copy decisions sometimes change what visual elements are needed.

### Task 5.1: Landing page social proof and copy pass

- [ ] **Step 1: Paste this prompt into Replit Agent**

```
Polish the landing page for The Lenny Tank.

Add to /:
1. Below the bucket tiles, a small "How it works" section with 3 horizontal steps:
   - "1. Pick a scenario" (with a small card icon)
   - "2. Make your move" (with a small target icon)
   - "3. Get judged by the panel" (with a small group icon)
2. Below that, a footer with: "Powered by 50 episodes of Lenny's Podcast" and a link to lennyspodcast.com (external)
3. Make sure the page is responsive: mobile single-column, desktop multi-column for the bucket tiles and the "How it works" steps.

Don't change anything else. Don't add tracking, no animations beyond simple fade-ins.
```

- [ ] **Step 2: Verify**

Visit / on mobile (responsive devtools) and desktop. Confirm the layout looks good at both.

---

### Task 5.2: Replace emoji icons with brand SVG icons

**Why:** the MVP shipped with emoji icons (📈 🤖 🧭 🚀 🎯) on the bucket tiles for speed. Emojis render inconsistently across OS/browser combos and don't pick up the brand color tokens. Swapping to a proper SVG icon library is a small, high-leverage polish move that ties the visual identity together. Do this AFTER Task 5.1 so any icons added in the "How it works" section get swapped in the same pass.

- [ ] **Step 1: Paste this prompt into Replit Agent**

```
Replace every emoji icon in the app with custom SVG icons matching the brand. Use lucide-react (https://lucide.dev) — it's well-supported in Next.js, tree-shakable, and has a consistent outline style that fits the editorial brand.

Specifically:
1. Install: `npm install lucide-react`
2. Replace the 5 bucket emojis on the landing page with these Lucide icons (outline style, size 28, color brand.ink with a yellow accent on hover):
   - Growth (📈) → TrendingUp
   - Shipping AI (🤖) → Bot
   - Leadership (🧭) → Compass
   - Zero-to-One (🚀) → Rocket
   - Career (🎯) → Target
3. Replace the "How it works" step icons (card, target, group) with: FileText, MousePointer2, Users — same outline style and sizing.
4. If any other emoji exist in the app (e.g. on the verdict screen or share buttons), swap them for matching Lucide icons in the same style. List them in your response.
5. Keep the existing tile layout, spacing, and bucket-to-icon mapping intact. Only the icon glyphs change.

Use the brand color tokens from tailwind.config.ts (text-brand-ink default, hover:text-brand-yellow or similar). Do NOT inline hex codes.
```

- [ ] **Step 2: Verify**

1. Visit / and confirm each bucket tile shows the correct Lucide icon at the same position and size where the emoji was.
2. Hover a tile and confirm the icon color shifts to the brand yellow.
3. Check the "How it works" section icons look consistent in style with the bucket icons.
4. Confirm no stray emojis remain anywhere in the app (open /tank/result for a sample round to check).
5. Mobile check — icons should scale appropriately on a narrow viewport.

If Replit Agent picked different Lucide names than the ones above (Lucide occasionally renames icons across versions), that's fine as long as the meanings match — note the swaps in your response.

---

### Task 5.3: Bug bash and final polish

- [ ] **Step 1: Run through every user path**

In Replit's preview window, manually:
1. Visit /. Click each of 5 bucket tiles.
2. In each bucket, click each of 5 scenarios.
3. For 3 random scenarios, try a suggested move; for 1, write your own move; for 1 in another bucket, use the "Write your own scenario" path.
4. Verify every round produces 3 reactions with quotes and a verdict.
5. Click [Share quote] on at least 3 rounds.

- [ ] **Step 2: List any issues**

For each issue, paste a targeted prompt to Replit Agent. Examples:
- "The reaction text on /tank/result wraps awkwardly on mobile — fix the layout"
- "Free-text scenarios produce reactions that don't reference the user's situation — increase relevance by including the scenario text more prominently in the user prompt"
- "Some pull-quotes look paraphrased. In /lib/judges.ts, add a post-generation check that the pull_quote substring exists within one of the provided chunks; if not, retry once."

- [ ] **Step 3: Final commit (in Replit)**

Replit auto-saves, but if you're using a Replit-linked Git repo, commit the final state.

---

## Phase 6 — Deploy + Demo Prep

### Task 6.1: Promote to Replit's production URL

- [ ] **Step 1: Click "Deploy" in Replit**

Replit auto-deploys to a public URL. Confirm the URL works and all routes load.

- [ ] **Step 2: Smoke-test the deployed URL**

Same as Task 5.2 Step 1, but on the production URL — make sure secrets propagated (no missing-API-key errors).

- [ ] **Step 3: Build a demo flight**

For your buildathon demo:
1. Pick the bucket + scenario + move that produces the most spicy / differentiated panel.
2. Practice the demo 3 times, timing it. Goal: under 90 seconds from landing → verdict.
3. Have a backup scenario in case your demo round happens to produce a weak reaction.

- [ ] **Step 4: Make a 30-second pitch script**

Three beats:
1. "Existing projects with this dataset all give you the consensus. The Lenny Tank shows you the disagreement — by putting you on the spot."
2. (Live demo) Click → click → click → "Look, Eric Ries thinks this is wrong, Cat Wu thinks it's brilliant, and Ben wants my backup plan."
3. "The reactions are generated; the quotes are verbatim. So when Eric Ries 'reacts to your move,' you can click into the real episode where he said that."

---

## Done

You've built The Lenny Tank end-to-end:
- 50 character sheets and embedded transcripts ready in `data/`
- Next.js app on Replit with 5 buckets, 25 scenarios, free-text fallbacks, 3-judge panels, verdicts, and share cards
- Deployed to a Replit URL
- Demo ready

Things deferred to v2 (see spec §11 explicitly-out):
- Audio playback of judge voices
- Multi-round "Pitch Week" campaign mode
- Document upload for the panel to react to
- User accounts / saved rounds
- Tone variants (Roast Battle / Press Junket)
- Interview Mode and "play as" role-switcher
