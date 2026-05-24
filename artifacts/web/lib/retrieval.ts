import OpenAI from "openai";
import fs from "node:fs/promises";
import path from "node:path";
import type { Chunk } from "@data";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Re-embedded chunks live INSIDE artifacts/web/ so Next.js dev cwd resolves correctly.
// Original Ollama-embedded chunks at workspace data/chunks/ are not used at runtime.
const CHUNKS_ROOT = path.join(process.cwd(), "data-runtime", "chunks");

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function embed(query: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  return res.data[0].embedding;
}

export async function topChunks(
  slug: string,
  queryEmbedding: number[],
  k = 3,
): Promise<Chunk[]> {
  const filepath = path.join(CHUNKS_ROOT, `${slug}.json`);
  const chunks: Chunk[] = JSON.parse(await fs.readFile(filepath, "utf-8"));
  const scored = chunks.map((c) => ({
    chunk: c,
    score: cosine(queryEmbedding, c.embedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map((s) => s.chunk);
}
