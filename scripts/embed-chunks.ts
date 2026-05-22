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

    if (chunks.length > 0 && chunks[0].embedding) {
      console.log(`  ${file}: already embedded, skipping`);
      continue;
    }

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
