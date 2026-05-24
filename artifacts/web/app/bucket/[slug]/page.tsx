import { notFound } from "next/navigation";
import Link from "next/link";
import { readFileSync } from "fs";
import { join } from "path";
import { BUCKET_LABELS, type Bucket, type ScenarioDeck } from "@data";
import ScenarioCardItem from "./ScenarioCardItem";

const BUCKET_EMOJI: Record<Bucket, string> = {
  growth: "📈",
  "shipping-ai": "🤖",
  leadership: "🧭",
  "zero-to-one": "🚀",
  career: "🎯",
};

const VALID_BUCKETS = new Set<string>(Object.keys(BUCKET_LABELS));

function loadDeck(): ScenarioDeck {
  const raw = readFileSync(join(process.cwd(), "../../data/scenarios.json"), "utf-8");
  return JSON.parse(raw) as ScenarioDeck;
}

export default async function BucketPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!VALID_BUCKETS.has(slug)) notFound();

  const bucket = slug as Bucket;
  const deck = loadDeck();
  const cards = deck[bucket];
  const label = BUCKET_LABELS[bucket];
  const emoji = BUCKET_EMOJI[bucket];

  return (
    <main
      className="min-h-screen px-6 pb-32 pt-10 sm:px-10"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      <div className="mx-auto max-w-2xl">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors hover:opacity-70"
          style={{ color: "var(--color-text-muted)" }}
        >
          <span aria-hidden>←</span>
          Back
        </Link>

        {/* Page header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-4xl">{emoji}</span>
            <h1
              className="text-3xl font-bold sm:text-4xl"
              style={{ color: "var(--color-text-primary)" }}
            >
              {label}
            </h1>
          </div>
          <p className="mt-3 text-sm" style={{ color: "var(--color-text-muted)" }}>
            {cards.length} scenarios · Pick a situation, pick your move, get roasted.
          </p>
        </header>

        {/* Scenario cards */}
        <ol className="flex flex-col gap-5">
          {cards.map((card) => (
            <li key={card.id}>
              <ScenarioCardItem card={card} />
            </li>
          ))}
        </ol>

        {/* Write your own scenario */}
        <div className="mt-14 flex justify-center">
          <Link
            href="/tank?scenarioId=custom"
            className="own-scenario-btn inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all"
          >
            <span>✏️</span>
            Write your own scenario
          </Link>
        </div>
      </div>
    </main>
  );
}
