import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { readFileSync } from "fs";
import { join } from "path";
import { BUCKET_LABELS, type Bucket, type ScenarioDeck } from "@data";
import { BUCKET_META } from "@/lib/buckets-meta";

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
  const { image, description } = BUCKET_META[bucket];

  return (
    <main className="min-h-screen px-6 pb-24 pt-10 sm:px-10">
      <div className="mx-auto max-w-2xl">
        {/* Back link */}
        <div className="mb-10">
          <Link href="/" className="back-pill">
            <span className="back-pill__icon" aria-hidden>
              ←
            </span>
            Back to Arena Selection
          </Link>
        </div>

        {/* Page header — illustration beside title, description below */}
        <header className="mb-10">
          <div className="flex items-center gap-5">
            <Image
              src={`/images/${image}.png`}
              alt=""
              width={128}
              height={128}
              className="shrink-0 object-contain"
              style={{ width: '8rem', height: '8rem' }}
              unoptimized
            />
            <div>
              <h1
                className="text-3xl font-bold sm:text-4xl"
                style={{ color: "var(--color-text-primary)" }}
              >
                {label}
              </h1>
              <p
                className="mt-2 text-base leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {description}
              </p>
            </div>
          </div>
        </header>

        {/* Scenario count */}
        <p className="text-eyebrow mb-5">
          {cards.length} scenario{cards.length !== 1 ? "s" : ""}
        </p>

        {/* Scenario cards — entire card is a link to /tank?scenarioId=<id> */}
        <ol className="scenario-list flex flex-col gap-5">
          {cards.map((card) => (
            <li key={card.id}>
              <Link
                href={`/tank?scenarioId=${encodeURIComponent(card.id)}`}
                className="scenario-card-link group"
              >
                <span className="scenario-card-num" aria-hidden="true" />
                <div className="scenario-card-body">
                  <h2 className="scenario-card-title">{card.title}</h2>
                  <p className="scenario-card-setup">{card.setup}</p>
                  <div className="scenario-card-cta h-0 overflow-hidden group-hover:h-auto group-hover:mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    Step into the tank
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style={{ width: 14, height: 14 }}><path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" /></svg>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>

        {/* Write your own scenario */}
        <div className="mt-10 flex justify-center">
          <Link
            href={`/tank?scenarioId=custom&from=${encodeURIComponent(`/arena/${bucket}`)}`}
            className="btn-ghost px-6 py-3.5"
          >
            <span>✏️</span>
            Write your own scenario
          </Link>
        </div>
      </div>
    </main>
  );
}
