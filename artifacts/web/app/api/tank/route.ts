import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { embed, topChunks, loadPrecomputedMoveEmbedding } from "@/lib/retrieval";
import {
  loadCharacterSheet,
  judgeReaction,
  synthesizeVerdict,
} from "@/lib/judges";
import type { ScenarioCard, ScenarioDeck } from "@data";

export const runtime = "nodejs";
export const maxDuration = 60;

// Fallback bench for "custom" scenarios — broad PM/career generalists.
const UNIVERSAL_BENCH = [
  "eric-ries-2",
  "ben-horowitz",
  "cat-wu",
  "elena-verna-40",
  "sam-lessin",
];

const MAX_SCENARIO_LEN = 2000;
const MAX_MOVE_LEN = 1000;
const MIN_TEXT_LEN = 8;

async function loadScenarios(): Promise<ScenarioDeck> {
  const filepath = path.join(
    process.cwd(),
    "..",
    "..",
    "data",
    "scenarios.json",
  );
  return JSON.parse(await fs.readFile(filepath, "utf-8"));
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function asString(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (trimmed.length > max) return null;
  return trimmed;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return bad("Invalid JSON body");
  }

  const scenarioId =
    typeof body.scenarioId === "string" ? body.scenarioId : undefined;
  const moveId = typeof body.moveId === "string" ? body.moveId : undefined;

  if (!scenarioId) return bad("scenarioId is required");
  if (!moveId) return bad("moveId is required");

  let scenarioSetup: string;
  let move: string;
  let judgeBench: string[];

  try {
    if (scenarioId === "custom") {
      const s = asString(body.scenarioText, MAX_SCENARIO_LEN);
      const m = asString(body.moveText, MAX_MOVE_LEN);
      if (!s || s.length < MIN_TEXT_LEN) return bad("scenarioText too short or too long");
      if (!m || m.length < MIN_TEXT_LEN) return bad("moveText too short or too long");
      scenarioSetup = s;
      move = m;
      judgeBench = UNIVERSAL_BENCH;
    } else {
      const scenarios = await loadScenarios();
      const all: ScenarioCard[] = Object.values(scenarios).flat();
      const card = all.find((c) => c.id === scenarioId);
      if (!card) return bad("Scenario not found");
      scenarioSetup = card.setup;

      if (moveId === "custom") {
        const m = asString(body.moveText, MAX_MOVE_LEN);
        if (!m || m.length < MIN_TEXT_LEN)
          return bad("moveText too short or too long");
        move = m;
      } else {
        const idx = parseInt(moveId, 10);
        if (Number.isNaN(idx) || !card.suggested_moves[idx]) {
          return bad("Invalid moveId");
        }
        move = card.suggested_moves[idx];
      }
      judgeBench = card.judge_bench;
    }
  } catch (err) {
    console.error("[/api/tank] input prep error:", err);
    return bad("Failed to load scenario", 500);
  }

  if (judgeBench.length === 0) return bad("No judges available", 500);

  const shuffled = [...judgeBench].sort(() => Math.random() - 0.5);
  const chosen = shuffled.slice(0, 3);

  try {
    // Canonical (scenarioId, moveId) pairs have pre-computed embeddings shipped
    // in data-runtime/move-embeddings.json — skip the live OpenAI call when present.
    let queryEmbedding: number[] | null = null;
    if (scenarioId !== "custom" && moveId !== "custom") {
      const idx = parseInt(moveId, 10);
      if (!Number.isNaN(idx)) {
        queryEmbedding = await loadPrecomputedMoveEmbedding(scenarioId, idx);
      }
    }
    if (!queryEmbedding) {
      queryEmbedding = await embed(`${scenarioSetup}\n\nMove: ${move}`);
    }

    // allSettled so a single upstream blip doesn't tank the whole panel.
    const settled = await Promise.allSettled(
      chosen.map(async (slug) => {
        const [sheet, chunks] = await Promise.all([
          loadCharacterSheet(slug),
          topChunks(slug, queryEmbedding, 3),
        ]);
        return judgeReaction({ slug, sheet, scenarioSetup, move, chunks });
      }),
    );

    const reactions = settled
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof judgeReaction>>> =>
        r.status === "fulfilled",
      )
      .map((r) => r.value);
    const failed = settled.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      for (const f of failed) {
        console.error("[/api/tank] judge failure:", (f as PromiseRejectedResult).reason);
      }
    }
    if (reactions.length < 2) {
      return bad("Judges unavailable, please try again", 503);
    }

    const { takes, score } = await synthesizeVerdict(reactions);

    return NextResponse.json({
      reactions,
      takes,
      score,
      scenarioSetup,
      move,
    });
  } catch (err) {
    console.error("[/api/tank] runtime error:", err);
    return bad("Something went wrong, please try again", 500);
  }
}
