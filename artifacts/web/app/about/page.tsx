import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — The Lenny Tank",
  description:
    "A low-stakes way to practice the high-stakes decisions of your craft — and get feedback from the people who've already lived them.",
};

const GOALS = [
  {
    title: "Rehearse decisions you only face once",
    body: "What do you do when retention craters? How do you handle a founder dispute? Most people meet these moments exactly once — and badly. The Tank lets you rehearse them before they're real.",
  },
  {
    title: "Practice for interviews",
    body: "PM, founder, and leadership interviews are full of scenario questions. Getting expert feedback on your reasoning before you sit across from a hiring manager builds calibration that mock interviews with friends can't.",
  },
  {
    title: "Try on a different role",
    body: "A designer plays a PM. An IC plays a manager. A non-founder plays a founder. Each arena lets you step into a perspective you don't live in day-to-day — and see how the experts in that world actually think.",
  },
  {
    title: "Learn from experts you'd never get a meeting with",
    body: "The gamified format means you absorb frameworks from Eric Ries or Cat Wu the way you'd absorb a Wordle pattern — by playing, not studying. Expert wisdom as a hangout, not homework.",
  },
] as const;

const STEPS = [
  {
    title: "Pick a scenario",
    body: "Choose an arena and a situation you'd actually face in your role — or write your own.",
  },
  {
    title: "Choose your move",
    body: "Pick from three strategic approaches, or type your own answer.",
  },
  {
    title: "Get judged by people who've lived it",
    body: "A panel of three guests reacts to your move. Each reaction is backed by a verbatim quote pulled from their actual episode transcript —",
    emphasis: "not generated, not paraphrased.",
  },
] as const;

export default function AboutPage() {
  return (
    <main className="min-h-screen px-6 pb-24 pt-10 sm:px-10">
      <div className="mx-auto max-w-2xl">

        {/* Back link */}
        <div className="mb-10">
          <Link href="/" className="back-pill">
            <span className="back-pill__icon" aria-hidden>←</span>
            Back to home
          </Link>
        </div>

        {/* Hero */}
        <header className="mb-16 text-center">
          <p className="text-eyebrow mb-4">About</p>
          <h1
            className="mt-2 text-6xl font-bold leading-tight sm:text-7xl"
            style={{ fontFamily: "var(--font-caveat)", color: "var(--color-text-primary)" }}
          >
            The Lenny Tank
          </h1>
          <p
            className="mx-auto mt-5 max-w-xl text-lg leading-relaxed sm:text-xl"
            style={{ color: "var(--color-text-secondary)" }}
          >
            A low-stakes way to practice the high-stakes decisions of your craft —{" "}
            <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>
              and get feedback from the people who&apos;ve already lived them.
            </span>
          </p>
        </header>

        {/* 4-goal grid */}
        <section className="mb-16">
          <p className="text-eyebrow mb-8 text-center">What&apos;s it for?</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {GOALS.map((goal) => (
              <div key={goal.title} className="card p-6">
                <h2
                  className="mb-2 text-base font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {goal.title}
                </h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {goal.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-16">
          <p className="text-eyebrow mb-8 text-center">How it works</p>
          <ol className="flex flex-col gap-6">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: "var(--color-brand-orange)" }}
                >
                  {i + 1}
                </span>
                <div>
                  <p
                    className="text-base font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {step.title}
                  </p>
                  <p
                    className="mt-1 text-sm leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {step.body}
                    {"emphasis" in step && (
                      <span
                        className="font-semibold"
                        style={{ color: "var(--color-brand-orange)" }}
                      >
                        {" "}{step.emphasis}
                      </span>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Footer strip */}
        <footer
          className="border-t pt-8 text-center text-xs"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          <p>Built by Clara Cheng for the Lenny&apos;s buildathon.</p>
          <p className="mt-1">
            Fan-made project. Not officially affiliated with Lenny&apos;s Newsletter or Lenny Rachitsky.
          </p>
        </footer>

      </div>
    </main>
  );
}
