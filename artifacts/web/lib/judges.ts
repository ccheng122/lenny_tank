import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs/promises";
import path from "node:path";
import type { CharacterSheet, Chunk } from "@data";

// Use Replit's managed Anthropic integration when present; fall back to a raw key.
const anthropic = new Anthropic({
  apiKey:
    process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ??
    process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

// Next.js dev cwd is artifacts/web/, so workspace data/ is two levels up.
const GUESTS_ROOT = path.join(process.cwd(), "..", "..", "data", "guests");

const MODEL = "claude-haiku-4-5";

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

Output STRICT JSON ONLY, no prose before or after:
{
  "reaction": "2-3 sentences in their voice reacting to the user's move. Reference specific aspects of their thinking. Avoid platitudes.",
  "pull_quote_idx": <integer 0-2: which of the provided chunks contains the best verbatim quote that supports your reaction>,
  "pull_quote": "<the EXACT verbatim text of a 1-3 sentence quote from that chunk — do not paraphrase, do not invent. If you paraphrase, you fail the task.>",
  "score": <integer 1-10: how strongly this guest would endorse the user's move; calibrate to their philosophy>
}`;

export async function loadCharacterSheet(
  slug: string,
): Promise<CharacterSheet> {
  const filepath = path.join(GUESTS_ROOT, `${slug}.json`);
  return JSON.parse(await fs.readFile(filepath, "utf-8"));
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
Core frameworks: ${args.sheet.core_frameworks.join("; ")}
Signature phrases: ${args.sheet.signature_phrases.join("; ")}
Pushes back on: ${args.sheet.pushes_back_on.join("; ")}
Speaking style: ${args.sheet.speaking_style}

SCENARIO:
${args.scenarioSetup}

USER'S MOVE:
${args.move}

CANDIDATE QUOTES from this guest's actual episode (pick ONE for your pull_quote, verbatim):
${args.chunks.map((c, i) => `[${i}] ${c.text}`).join("\n\n---\n\n")}

Now respond as ${args.sheet.guest} reacting to the user's move. Output JSON only.`;

  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 800,
    system: SYSTEM,
    messages: [{ role: "user", content: userPrompt }],
  });

  const block = res.content[0];
  const text = block && block.type === "text" ? block.text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON in judge response for ${args.slug}`);
  const parsed = JSON.parse(jsonMatch[0]) as {
    reaction: string;
    pull_quote: string;
    score: number;
  };

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

export async function synthesizeVerdict(
  reactions: JudgeReaction[],
): Promise<{ verdict: string; score: number }> {
  const avgScore =
    reactions.reduce((s, r) => s + r.score, 0) / reactions.length;
  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 200,
    system:
      "Synthesize 3 judge reactions into ONE sentence capturing the panel's overall stance. If they disagree, note the split. Be concise. Output a single sentence, no quotes around it.",
    messages: [
      {
        role: "user",
        content: reactions.map((r) => `${r.guest}: ${r.reaction}`).join("\n\n"),
      },
    ],
  });
  const block = res.content[0];
  const text =
    block && block.type === "text"
      ? block.text.trim()
      : "The panel has weighed in.";
  return { verdict: text, score: Math.round(avgScore * 10) / 10 };
}
