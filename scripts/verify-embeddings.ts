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

function topK(queryEmb: number[], chunks: ChunkWithEmbedding[], k: number) {
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
