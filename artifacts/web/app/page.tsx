import Link from "next/link";
import { BUCKET_LABELS, type Bucket } from "@data";

const BUCKET_META: Record<
  Bucket,
  { emoji: string; description: string }
> = {
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
    <main className="min-h-screen bg-zinc-950 px-6 pb-24 pt-20 sm:px-10">
      {/* Hero */}
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-sm text-zinc-400">
          <span className="text-amber-400">🦈</span>
          <span>Shark-tank-style scenario practice</span>
        </div>

        <h1 className="mt-6 bg-gradient-to-br from-white via-zinc-100 to-zinc-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl">
          The Lenny Tank
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
          Practice the high-stakes decisions of your craft.{" "}
          <span className="text-zinc-200">
            Get feedback from people who've already lived them.
          </span>
        </p>
      </div>

      {/* Bucket grid */}
      <div className="mx-auto mt-16 max-w-5xl">
        <p className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-zinc-500">
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
                className="group relative flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-zinc-600 hover:bg-zinc-800 hover:shadow-xl hover:shadow-black/40"
              >
                {/* Subtle glow on hover */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-1 ring-inset ring-white/10 transition-opacity group-hover:opacity-100" />

                <span className="text-4xl">{emoji}</span>

                <div>
                  <h2 className="text-lg font-bold text-white">{label}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                    {description}
                  </p>
                </div>

                <div className="mt-auto flex items-center gap-1 text-xs font-medium text-zinc-500 transition-colors group-hover:text-zinc-300">
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
    </main>
  );
}
