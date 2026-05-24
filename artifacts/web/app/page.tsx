import Link from "next/link";
import { BUCKET_LABELS, type Bucket } from "@data";

const BUCKET_META: Record<Bucket, { emoji: string; description: string }> = {
  growth: {
    emoji: "📈",
    description: "For PMs obsessed with moving the needle on activation and retention",
  },
  "shipping-ai": {
    emoji: "🤖",
    description: "For builders navigating real tradeoffs in AI product development",
  },
  leadership: {
    emoji: "🧭",
    description: "For leads who must make the call when there's no playbook",
  },
  "zero-to-one": {
    emoji: "🚀",
    description: "For founders and PMs building something from nothing",
  },
  career: {
    emoji: "🎯",
    description: "For anyone at a career inflection point who needs a real sounding board",
  },
};

const buckets = Object.keys(BUCKET_LABELS) as Bucket[];

export default function Home() {
  return (
    <main
      className="min-h-screen px-6 pb-24 pt-16 sm:px-10"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      {/* Hero */}
      <div className="mx-auto max-w-3xl text-center">
        {/* Badge */}
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
          style={{
            backgroundColor: "var(--color-brand-orange-light)",
            color: "var(--color-brand-orange)",
            border: "1px solid #f5d9bf",
          }}
        >
          <span>🦈</span>
          <span>Shark-tank-style scenario practice</span>
        </div>

        {/* Title — script font matching Lenny's brand */}
        <h1
          className="mt-2 text-6xl font-bold leading-tight sm:text-8xl"
          style={{
            fontFamily: "var(--font-caveat)",
            color: "var(--color-text-primary)",
          }}
        >
          The Lenny Tank
        </h1>

        {/* Subtitle */}
        <p
          className="mx-auto mt-5 max-w-xl text-lg leading-relaxed sm:text-xl"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Practice the high-stakes decisions of your craft.{" "}
          <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>
            Get feedback from people who've already lived them.
          </span>
        </p>

        {/* Divider */}
        <div
          className="mx-auto mt-10 h-px w-16"
          style={{ backgroundColor: "var(--color-border-strong)" }}
        />
      </div>

      {/* Bucket grid */}
      <div className="mx-auto mt-12 max-w-5xl">
        <p
          className="mb-8 text-center text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--color-text-muted)" }}
        >
          Pick your arena
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {buckets.map((key) => {
            const { emoji, description } = BUCKET_META[key];
            const label = BUCKET_LABELS[key];

            return (
              <Link
                key={key}
                href={`/bucket/${key}`}
                className="bucket-card group relative flex flex-col gap-4 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5"
              >
                <span className="text-4xl">{emoji}</span>

                <div>
                  <h2
                    className="text-base font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {label}
                  </h2>
                  <p
                    className="mt-1.5 text-sm leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {description}
                  </p>
                </div>

                <div
                  className="mt-auto flex items-center gap-1 text-xs font-semibold transition-colors"
                  style={{ color: "var(--color-brand-orange)" }}
                >
                  Enter arena
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
            );
          })}
        </div>
      </div>

      {/* Footer note */}
      <p
        className="mt-16 text-center text-xs"
        style={{ color: "var(--color-text-muted)" }}
      >
        Inspired by the guests of{" "}
        <span style={{ color: "var(--color-brand-orange)" }}>
          Lenny's Podcast
        </span>
      </p>
    </main>
  );
}
