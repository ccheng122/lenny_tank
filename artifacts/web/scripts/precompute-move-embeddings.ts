/**
 * Pre-computes OpenAI embeddings for every (canonical scenario, suggested move)
 * pair in data/scenarios.json so the runtime API can skip the live embed call.
 *
 * Input format embedded (must match app/api/tank/route.ts):
 *   `${scenarioSetup}\n\nMove: ${move}`
 *
 * Output: artifacts/web/data-runtime/move-embeddings.json
 *   { [scenarioId]: { [moveIdx: number]: number[] } }
 *
 * Idempotent: if the output file exists and already covers every canonical move,
 * the script exits without making API calls. Pass --force to re-embed.
 *
 * Run with:
 *   pnpm --filter @workspace/web exec tsx scripts/precompute-move-embeddings.ts
 */
import OpenAI from "openai";
import fs from "node:fs/promises";
import path from "node:path";
import type { ScenarioCard, ScenarioDeck } from "@data";

const WORKSPACE_ROOT = path.resolve(__dirname, "..", "..", "..");
const SCENARIOS_PATH = path.join(WORKSPACE_ROOT, "data", "scenarios.json");
const OUT_PATH = path.join(
  __dirname,
  "..",
  "data-runtime",
  "move-embeddings.json",
);

const MODEL = "text-embedding-3-small";

type MoveEmbeddings = Record<string, Record<number, number[]>>;

interface Job {
  scenarioId: string;
  moveIdx: number;
  input: string;
}

function buildInput(card: ScenarioCard, moveIdx: number): string {
  return `${card.setup}\n\nMove: ${card.suggested_moves[moveIdx]}`;
}

async function loadExisting(): Promise<MoveEmbeddings> {
  try {
    const raw = await fs.readFile(OUT_PATH, "utf-8");
    return JSON.parse(raw) as MoveEmbeddings;
  } catch {
    return {};
  }
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set.");
    process.exit(1);
  }

  const force = process.argv.includes("--force");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const raw = await fs.readFile(SCENARIOS_PATH, "utf-8");
  const deck = JSON.parse(raw) as ScenarioDeck;
  const allCards: ScenarioCard[] = Object.values(deck).flat();

  const existing = force ? {} : await loadExisting();
  const out: MoveEmbeddings = { ...existing };

  const jobs: Job[] = [];
  for (const card of allCards) {
    for (let i = 0; i < card.suggested_moves.length; i++) {
      if (existing[card.id]?.[i]) continue;
      jobs.push({ scenarioId: card.id, moveIdx: i, input: buildInput(card, i) });
    }
  }

  if (jobs.length === 0) {
    console.log("All canonical moves already embedded. Nothing to do.");
    console.log(`(Pass --force to re-embed everything.)`);
    return;
  }

  console.log(
    `Found ${allCards.length} scenarios. Need to embed ${jobs.length} move(s).`,
  );

  const res = await openai.embeddings.create({
    model: MODEL,
    input: jobs.map((j) => j.input),
  });

  res.data.forEach((d, i) => {
    const { scenarioId, moveIdx } = jobs[i];
    if (!out[scenarioId]) out[scenarioId] = {};
    out[scenarioId][moveIdx] = d.embedding;
  });

  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });
  await fs.writeFile(OUT_PATH, JSON.stringify(out));
  const totalPairs = Object.values(out).reduce(
    (n, m) => n + Object.keys(m).length,
    0,
  );
  console.log(`Wrote ${OUT_PATH}`);
  console.log(`Embedded ${jobs.length} new pairs; file now covers ${totalPairs} pairs total.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
