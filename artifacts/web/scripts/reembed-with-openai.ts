/**
 * One-time re-embed script.
 *
 * Reads the Ollama-embedded chunks at workspace `data/chunks/{slug}.json`
 * (768-dim, search_document: prefix) and writes OpenAI text-embedding-3-small
 * versions (1536-dim, no prefix) to `artifacts/web/data-runtime/chunks/{slug}.json`.
 *
 * Idempotent: skips files where the output already exists.
 *
 * Run with:
 *   pnpm --filter @workspace/web exec tsx scripts/reembed-with-openai.ts
 */
import OpenAI from "openai";
import fs from "node:fs/promises";
import path from "node:path";

interface InputChunk {
  id: string;
  slug: string;
  idx: number;
  text: string;
  guest: string;
  episode_title: string;
  episode_date: string;
  post_url?: string;
  embedding: number[]; // Ollama 768-dim — will be replaced
}

const WORKSPACE_ROOT = path.resolve(__dirname, "..", "..", "..");
const SRC_DIR = path.join(WORKSPACE_ROOT, "data", "chunks");
const OUT_DIR = path.join(__dirname, "..", "data-runtime", "chunks");

const MODEL = "text-embedding-3-small";
const BATCH_SIZE = 100; // OpenAI accepts arrays; batching cuts request count

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function reembedFile(filename: string): Promise<{
  status: "skipped" | "embedded";
  chunks: number;
}> {
  const outPath = path.join(OUT_DIR, filename);
  try {
    await fs.access(outPath);
    return { status: "skipped", chunks: 0 };
  } catch {
    // not present — proceed
  }

  const srcPath = path.join(SRC_DIR, filename);
  const chunks: InputChunk[] = JSON.parse(await fs.readFile(srcPath, "utf-8"));

  const out: InputChunk[] = [];
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const res = await openai.embeddings.create({
      model: MODEL,
      input: batch.map((c) => c.text),
    });
    res.data.forEach((d, j) => {
      out.push({ ...batch[j], embedding: d.embedding });
    });
  }

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(out));
  return { status: "embedded", chunks: out.length };
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set.");
    process.exit(1);
  }

  const files = (await fs.readdir(SRC_DIR))
    .filter((f) => f.endsWith(".json"))
    .sort();

  console.log(`Found ${files.length} chunk files at ${SRC_DIR}`);
  console.log(`Output dir: ${OUT_DIR}\n`);

  let totalEmbedded = 0;
  let totalSkipped = 0;
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const result = await reembedFile(f);
    const tag = result.status === "skipped" ? "skip" : `embed (${result.chunks})`;
    console.log(`[${i + 1}/${files.length}] ${tag.padEnd(14)} ${f}`);
    if (result.status === "embedded") totalEmbedded += result.chunks;
    else totalSkipped += 1;
  }

  console.log(
    `\nDone. Embedded ${totalEmbedded} chunks across ${files.length - totalSkipped} files; skipped ${totalSkipped}.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
