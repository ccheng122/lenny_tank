---
name: about-page-design
description: Design spec for the /about page and home footer nav link — mission-forward structure with 4-goal grid, how-it-works steps, and fan-made disclaimer
metadata:
  type: project
---

# About Page — Design Spec

**Date:** 2026-05-26
**Status:** Approved for implementation

---

## 1. Overview

Add an `/about` page to The Lenny Tank and a navigation link to it from the home page footer. The page is project-focused (not personal-biography-focused), with one brief personal sentence at the bottom. Tone matches the app: warm, structured, confident.

## 2. Navigation Entry Point

On the home page (`app/page.tsx`), add an "About" text link inside the existing footer `div` (alongside the Lenny's Newsletter button). It should sit below the newsletter button, centered, styled as a small muted link — not a button.

```
Inspired by the guests of Lenny's Podcast

[ Lenny's Newsletter ↗ ]

About
```

## 3. Page Structure: `/about`

**Route:** `app/about/page.tsx`

### 3.1 Back Link
Standard `back-pill` component linking back to `/`.

### 3.2 Hero
- Eyebrow: "About"
- H1 (Caveat font, display size): "The Lenny Tank"
- Subtitle (body text): the mission statement verbatim —
  > "A low-stakes way to practice the high-stakes decisions of your craft — and get feedback from the people who've already lived them."

No CTA in the hero. Just grounding.

### 3.3 "Why people come here" — 4-goal grid
- Eyebrow: "What's it for?"
- 2×2 card grid (`.card` style), one card per goal:

| # | Title | Body |
|---|-------|------|
| 1 | Rehearse decisions you only face once | "What do you do when retention craters? How do you handle a founder dispute? Most people meet these moments exactly once — and badly. The Tank lets you rehearse them before they're real." |
| 2 | Practice for interviews | "PM, founder, and leadership interviews are full of scenario questions. Getting expert feedback on your reasoning before you sit across from a hiring manager builds calibration that mock interviews with friends can't." |
| 3 | Try on a different role | "A designer plays a PM. An IC plays a manager. A non-founder plays a founder. Each arena lets you step into a perspective you don't live in day-to-day — and see how the experts in that world actually think." |
| 4 | Learn from experts you'd never get a meeting with | "The gamified format means you absorb frameworks from Eric Ries or Cat Wu the way you'd absorb a Wordle pattern — by playing, not studying. Expert wisdom as a hangout, not homework." |

### 3.4 "How it works" — 3-step section
- Eyebrow: "How it works"
- Three numbered steps displayed as a vertical list (consistent across all breakpoints):

1. **Pick a scenario** — Choose an arena and a situation you'd actually face in your role — or write your own.
2. **Choose your move** — Pick from three strategic approaches, or type your own answer.
3. **Get judged by people who've lived it** — A panel of three guests reacts to your move. Each reaction is backed by a verbatim quote pulled from their actual episode transcript — not generated, not paraphrased.

The third step should visually call out the real-quote differentiator (bold or accent color on the last sentence).

### 3.5 Footer Strip
Small, centered, muted text at the bottom of the page:

- Personal line: "Built by Clara Cheng for the Lenny's buildathon."
- Disclaimer: "Fan-made project. Not officially affiliated with Lenny's Newsletter or Lenny Rachitsky."

## 4. Visual Design

- Follows existing design system: cream background, brand orange accents, Geist body, Caveat for display heading
- Cards use `.card` class (white bg, warm border)
- Steps can use a simple numbered list with a left accent line or inline number badges in brand orange
- No new design tokens needed

## 5. What's NOT on this page

- Personal biography / photo
- Metrics / stats (episode count, etc.) — not enough unique value to warrant
- Technical architecture deep-dive
- Links to source code

## 6. Implementation Scope

- New file: `app/about/page.tsx` (static, no data fetching needed)
- Edit: `app/page.tsx` — add About link to footer section
- No new components needed; reuses `.card`, `.back-pill`, `.text-eyebrow`, `.btn-secondary` from globals.css
