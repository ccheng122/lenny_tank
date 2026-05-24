import Link from "next/link";
import { headers } from "next/headers";
import { readFileSync } from "fs";
import { join } from "path";
import type { Bucket, ScenarioCard, ScenarioDeck } from "@data";
import CustomScenarioForm from "./CustomScenarioForm";
import CustomMoveForm from "./CustomMoveForm";

function loadDeck(): ScenarioDeck {
  const raw = readFileSync(
    join(process.cwd(), "../../data/scenarios.json"),
    "utf-8",
  );
  return JSON.parse(raw) as ScenarioDeck;
}

function findScenario(
  deck: ScenarioDeck,
  id: string,
): { card: ScenarioCard; bucket: Bucket } | null {
  for (const bucket of Object.keys(deck) as Bucket[]) {
    const card = deck[bucket].find((c) => c.id === id);
    if (card) return { card, bucket };
  }
  return null;
}

async function getBackHref(
  fallback: string,
  fromParam?: string,
): Promise<string> {
  // Prefer explicit `from` (threaded through the custom flow).
  if (fromParam && fromParam.startsWith("/bucket/")) return fromParam;

  const h = await headers();
  const referer = h.get("referer");
  if (!referer) return fallback;
  try {
    const url = new URL(referer);
    if (url.pathname.startsWith("/bucket/")) return url.pathname;
  } catch {
    /* ignore */
  }
  return fallback;
}

export default async function TankPage({
  searchParams,
}: {
  searchParams: Promise<{
    scenarioId?: string;
    scenarioText?: string;
    moveText?: string;
    from?: string;
  }>;
}) {
  const { scenarioId, scenarioText, from } = await searchParams;

  // ── STATE 2: custom scenario, no text yet ────────────────────────────────
  if (scenarioId === "custom" && !scenarioText) {
    const backHref = await getBackHref("/", from);
    return (
      <main className="min-h-screen px-6 pb-32 pt-10 sm:px-10">
        <div className="mx-auto max-w-2xl">
          <BackLink href={backHref} />
          <header className="mb-8">
            <h1
              className="text-3xl font-bold sm:text-4xl"
              style={{ color: "var(--color-text-primary)" }}
            >
              Write your own scenario
            </h1>
            <p
              className="mt-3 text-base"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Drop the real situation you're wrestling with. The Tank will take
              it seriously.
            </p>
          </header>
          <CustomScenarioForm from={from} />
        </div>
      </main>
    );
  }

  // ── STATE 3: custom scenario WITH text ───────────────────────────────────
  if (scenarioId === "custom" && scenarioText) {
    const backHref = await getBackHref("/", from);
    return (
      <main className="min-h-screen px-6 pb-32 pt-10 sm:px-10">
        <div className="mx-auto max-w-2xl">
          <BackLink href={backHref} />
          <section className="card p-7 mb-10">
            <p
              className="text-eyebrow mb-3"
              style={{ color: "var(--color-text-muted)" }}
            >
              Your scenario
            </p>
            <p
              className="text-base leading-relaxed"
              style={{ color: "var(--color-text-primary)" }}
            >
              {scenarioText}
            </p>
          </section>

          <h2
            className="text-2xl font-bold mb-5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Your move
          </h2>
          <CustomMoveForm
            scenarioId="custom"
            scenarioText={scenarioText}
            submitLabel="Step into the Tank"
            standalone
          />
        </div>
      </main>
    );
  }

  // ── STATE 1: real scenario id ────────────────────────────────────────────
  if (!scenarioId) {
    return (
      <main className="min-h-screen px-6 pb-32 pt-10 sm:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <BackLink href="/" />
          <p
            className="mt-10 text-base"
            style={{ color: "var(--color-text-secondary)" }}
          >
            No scenario selected. Pick one from a bucket to enter the Tank.
          </p>
        </div>
      </main>
    );
  }

  const deck = loadDeck();
  const found = findScenario(deck, scenarioId);

  if (!found) {
    return (
      <main className="min-h-screen px-6 pb-32 pt-10 sm:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <BackLink href="/" />
          <p
            className="mt-10 text-base"
            style={{ color: "var(--color-text-secondary)" }}
          >
            We couldn't find that scenario.
          </p>
        </div>
      </main>
    );
  }

  const { card, bucket } = found;
  const backHref = await getBackHref(`/bucket/${bucket}`, from);

  return (
    <main className="min-h-screen px-6 pb-32 pt-10 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <BackLink href={backHref} />

        {/* Scenario block */}
        <section className="card p-7 mb-12">
          <p
            className="text-eyebrow mb-3"
            style={{ color: "var(--color-text-muted)" }}
          >
            The scenario
          </p>
          <h1
            className="text-3xl font-bold sm:text-4xl mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            {card.title}
          </h1>
          <p
            className="text-base leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {card.setup}
          </p>
        </section>

        {/* Moves */}
        <h2
          className="text-2xl font-bold mb-5"
          style={{ color: "var(--color-text-primary)" }}
        >
          Your move
        </h2>

        <ol className="flex flex-col gap-4 mb-6">
          {card.suggested_moves.map((move, i) => {
            const letter = String.fromCharCode(65 + i); // A, B, C
            return (
              <li key={i}>
                <Link
                  href={`/tank/result?scenarioId=${encodeURIComponent(card.id)}&moveId=${i}`}
                  className="btn-secondary group block w-full text-left px-6 py-5"
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="text-lg font-bold leading-7 shrink-0"
                      style={{ color: "var(--color-brand-orange)" }}
                    >
                      {letter}
                    </span>
                    <span
                      className="text-base leading-7"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {move}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>

        {/* Write your own move */}
        <CustomMoveForm scenarioId={card.id} />
      </div>
    </main>
  );
}

function BackLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm mb-10 transition-opacity hover:opacity-70"
      style={{ color: "var(--color-text-muted)" }}
    >
      <span aria-hidden>←</span>
      Pick a different scenario
    </Link>
  );
}
