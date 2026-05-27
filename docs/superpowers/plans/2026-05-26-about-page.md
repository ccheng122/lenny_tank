# About Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a static `/about` page and an "About" link in the home page footer.

**Architecture:** Two small changes — a new static `app/about/page.tsx` that reuses existing CSS classes, and a one-line edit to `app/page.tsx` to add the About link. No new components, no data fetching, no new design tokens.

**Tech Stack:** Next.js App Router, Tailwind CSS v4 (via `@theme` tokens), existing globals.css component classes (`.card`, `.back-pill`, `.text-eyebrow`).

---

## File Map

| Action | Path | What it does |
|--------|------|--------------|
| Modify | `artifacts/web/app/page.tsx` | Add "About" text link to the footer div |
| Create | `artifacts/web/app/about/page.tsx` | Static about page — hero, 4-goal grid, how-it-works, footer strip |

---

## Task 1: Add "About" link to home footer

**Files:**
- Modify: `artifacts/web/app/page.tsx`

- [ ] **Step 1: Open the file and locate the footer div**

The footer section is at the bottom of `app/page.tsx`. It currently looks like this:

```tsx
{/* Footer note */}
<div className="mt-16 flex flex-col items-center gap-4">
  <p
    className="text-center text-xs"
    style={{ color: "var(--color-text-muted)" }}
  >
    Inspired by the guests of{" "}
    <span style={{ color: "var(--color-brand-orange)" }}>
      Lenny's Podcast
    </span>
  </p>
  <a
    href="https://www.lennysnewsletter.com/"
    target="_blank"
    rel="noopener noreferrer"
    className="btn-secondary"
  >
    Lenny's Newsletter
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69L6.22 8.72Z" />
      <path d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 0 0 7 4H4.75A2.75 2.75 0 0 0 2 6.75v4.5A2.75 2.75 0 0 0 4.75 14h4.5A2.75 2.75 0 0 0 12 11.25V9a.75.75 0 0 0-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25v-4.5Z" />
    </svg>
  </a>
</div>
```

- [ ] **Step 2: Add the About link below the newsletter button**

Add a `Link` import at the top of the file if not already present (it is — `import Link from "next/link"` is already there). Then add the About link inside the footer div, after the `<a>` tag:

```tsx
{/* Footer note */}
<div className="mt-16 flex flex-col items-center gap-4">
  <p
    className="text-center text-xs"
    style={{ color: "var(--color-text-muted)" }}
  >
    Inspired by the guests of{" "}
    <span style={{ color: "var(--color-brand-orange)" }}>
      Lenny's Podcast
    </span>
  </p>
  <a
    href="https://www.lennysnewsletter.com/"
    target="_blank"
    rel="noopener noreferrer"
    className="btn-secondary"
  >
    Lenny's Newsletter
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69L6.22 8.72Z" />
      <path d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 0 0 7 4H4.75A2.75 2.75 0 0 0 2 6.75v4.5A2.75 2.75 0 0 0 4.75 14h4.5A2.75 2.75 0 0 0 12 11.25V9a.75.75 0 0 0-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25v-4.5Z" />
    </svg>
  </a>
  <Link
    href="/about"
    className="text-xs transition-colors hover:underline"
    style={{ color: "var(--color-text-muted)" }}
  >
    About
  </Link>
</div>
```

- [ ] **Step 3: Verify visually**

The home page footer should now show, top to bottom:
1. "Inspired by the guests of Lenny's Podcast" (muted text)
2. "Lenny's Newsletter ↗" (outlined button)
3. "About" (small muted text link)

- [ ] **Step 4: Commit**

```bash
git add artifacts/web/app/page.tsx
git commit -m "feat: add About link to home footer"
```

---

## Task 2: Create the /about page

**Files:**
- Create: `artifacts/web/app/about/page.tsx`

- [ ] **Step 1: Create the file with this full content**

```tsx
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
```

- [ ] **Step 2: Verify the page renders**

Navigate to `http://localhost:3000/about`. Confirm:
- Back link ("← Back to home") navigates to `/`
- Hero shows "The Lenny Tank" in Caveat font with the mission statement beneath
- 4 cards appear in a 2-column grid on desktop, 1 column on mobile
- 3 numbered steps appear with orange number badges; step 3 ends with orange bold text "not generated, not paraphrased."
- Footer shows "Built by Clara Cheng for the Lenny's buildathon." and the disclaimer

- [ ] **Step 3: Commit**

```bash
git add artifacts/web/app/about/page.tsx
git commit -m "feat: add /about page"
```
