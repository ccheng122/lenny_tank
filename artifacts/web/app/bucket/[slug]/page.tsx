import { notFound } from "next/navigation";
import Link from "next/link";
import { readFileSync } from "fs";
import { join } from "path";
import { BUCKET_LABELS, type Bucket, type ScenarioDeck } from "@data";

const BUCKET_EMOJI: Record<Bucket, string> = {
  growth: "📈",
  "shipping-ai": "🤖",
  leadership: "🧭",
  "zero-to-one": "🚀",
  career: "🎯",
};

const VALID_BUCKETS = new Set<string>(Object.keys(BUCKET_LABELS));

function loadDeck(): ScenarioDeck {
  const raw = readFileSync(
    join(process.cwd(), "../../data/scenarios.json"),
    "utf-8",
  );
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
    <main className="min-h-screen px-6 pb-32 pt-10 sm:px-10">
      <div className="mx-auto max-w-2xl">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm mb-10 transition-opacity hover:opacity-70"
          style={{ color: "var(--color-text-muted)" }}
        >
          <span aria-hidden>←</span>
          Back to buckets
        </Link>

        {/* Page header */}
        <header className="mb-10 flex items-center gap-3">
          <span className="text-4xl">{emoji}</span>
          <h1
            className="text-3xl font-bold sm:text-4xl"
            style={{ color: "var(--color-text-primary)" }}
          >
            {label}
          </h1>
        </header>

        {/* Scenario cards — entire card is a link to /tank?scenarioId=<id> */}
        <ol className="flex flex-col gap-5">
          {cards.map((card) => (
            <li key={card.id}>
              <Link
                href={`/tank?scenarioId=${encodeURIComponent(card.id)}`}
                className="card card-interactive group block p-7 transition-all duration-200 hover:-translate-y-0.5"
              >
                <h2
                  className="text-xl font-bold mb-3"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {card.title}
                </h2>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {card.setup}
                </p>

                {/* Click affordance — appears on hover */}
                <div
                  className="mt-5 flex items-center gap-1 text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ color: "var(--color-brand-orange)" }}
                >
                  Step into the tank
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </Link>
            </li>
          ))}
        </ol>

        {/* Write your own scenario */}
        <div className="mt-14 flex justify-center">
          <Link
            href={`/tank?scenarioId=custom&from=${encodeURIComponent(`/bucket/${bucket}`)}`}
            className="btn-ghost rounded-xl px-6 py-3.5"
          >
            <span>✏️</span>
            Write your own scenario
          </Link>
        </div>
      </div>
    </main>
  );
}
