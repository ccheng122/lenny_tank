import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { embed, topChunks } from "@/lib/retrieval";
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

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      scenarioId?: string;
      moveId?: string;
      scenarioText?: string;
      moveText?: string;
    };
    const { scenarioId, moveId, scenarioText, moveText } = body;

    let scenarioSetup: string;
    let move: string;
    let judgeBench: string[];

    if (scenarioId === "custom") {
      scenarioSetup = scenarioText ?? "";
      move = moveText ?? "";
      judgeBench = UNIVERSAL_BENCH;
    } else {
      const scenarios = await loadScenarios();
      const all: ScenarioCard[] = Object.values(scenarios).flat();
      const card = all.find((c) => c.id === scenarioId);
      if (!card) {
        return NextResponse.json(
          { error: "Scenario not found" },
          { status: 400 },
        );
      }
      scenarioSetup = card.setup;
      if (moveId === "custom") {
        move = moveText ?? "";
      } else {
        const idx = parseInt(moveId ?? "", 10);
        if (Number.isNaN(idx) || !card.suggested_moves[idx]) {
          return NextResponse.json(
            { error: "Invalid moveId" },
            { status: 400 },
          );
        }
        move = card.suggested_moves[idx];
      }
      judgeBench = card.judge_bench;
    }

    if (!scenarioSetup.trim() || !move.trim()) {
      return NextResponse.json(
        { error: "Scenario and move text required" },
        { status: 400 },
      );
    }

    const shuffled = [...judgeBench].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, 3);

    const queryEmbedding = await embed(`${scenarioSetup}\n\nMove: ${move}`);

    const reactions = await Promise.all(
      chosen.map(async (slug) => {
        const [sheet, chunks] = await Promise.all([
          loadCharacterSheet(slug),
          topChunks(slug, queryEmbedding, 3),
        ]);
        return judgeReaction({ slug, sheet, scenarioSetup, move, chunks });
      }),
    );

    const { verdict, score } = await synthesizeVerdict(reactions);

    return NextResponse.json({
      reactions,
      verdict,
      score,
      scenarioSetup,
      move,
    });
  } catch (err) {
    console.error("[/api/tank] error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
