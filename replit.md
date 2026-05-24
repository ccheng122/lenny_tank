# The Lenny Tank

A Shark-Tank-style scenario practice app where users pick a high-stakes PM/career situation, choose their move, and get feedback from AI personas based on real podcast guests.

## Run & Operate

- `pnpm --filter @workspace/web run dev` — run the Next.js frontend (via workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Next.js must run with `--webpack` flag (Turbopack can't resolve imports outside the project dir)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Next.js 16 App Router, Tailwind CSS v4 (`@tailwindcss/postcss`)
- Fonts: Caveat (display/script) + Geist (body) via `next/font/google`
- Data: static JSON at `/data/` — **never modify files in `/data/`**

## Where things live

- `artifacts/web/app/` — Next.js App Router pages
- `artifacts/web/app/globals.css` — **single source of truth** for brand tokens and component classes
- `data/index.ts` — TypeScript types: `ScenarioCard`, `ScenarioDeck`, `Bucket`, `BUCKET_LABELS`
- `data/scenarios.json` — all 25 scenario cards (5 buckets × 5 cards)
- `artifacts/web/next.config.ts` — webpack alias `@data` → `../../data/index.ts`

## Brand system — use these everywhere

All tokens live in `artifacts/web/app/globals.css` inside `@theme {}`.
They become CSS custom properties usable as `var(--token-name)` in inline styles.

### Color tokens

| Token | Hex | Use |
|---|---|---|
| `--color-brand-orange` | `#E07432` | Primary accent, CTA fills, icons |
| `--color-brand-orange-light` | `#FEF0E2` | Tinted orange backgrounds |
| `--color-brand-orange-dark` | `#B85C22` | Hover/pressed state for orange |
| `--color-surface` | `#FFFCF8` | Page background |
| `--color-surface-tint` | `#FFF8F3` | Warm hover fill on buttons |
| `--color-surface-press` | `#FEECD8` | Active/pressed fill |
| `--color-card` | `#FFFFFF` | Card background |
| `--color-border` | `#EAD9CB` | Default border |
| `--color-border-strong` | `#D4C2B0` | Stronger border, dividers |
| `--color-text-primary` | `#1A1110` | Body text, headings |
| `--color-text-secondary` | `#7C6E66` | Supporting text, subtitles |
| `--color-text-muted` | `#A8998F` | Labels, captions, eyebrows |

### Typography tokens

| Token | Value | Use |
|---|---|---|
| `--font-caveat` | Caveat (injected by Next.js) | Script/display headline (hero h1) |
| `--font-geist` | Geist (injected by Next.js) | All body + UI text |

**Gotcha:** `--font-caveat` and `--font-geist` are injected by Next.js onto `<body>` via className — use them directly as `style={{ fontFamily: "var(--font-caveat)" }}`. The `@theme` aliases `--font-display` / `--font-body` are for documentation only; double-indirection via `var()` doesn't resolve at `:root` level.

### Radius tokens

| Token | Value |
|---|---|
| `--radius-card` | `1rem` (16px) |
| `--radius-btn` | `0.625rem` (10px) |

### Reusable component classes (in `globals.css` `@layer components`)

| Class | Purpose |
|---|---|
| `.card` | White card with warm border + shadow. Use on all card elements. |
| `.card-interactive` | Add to `.card` when the card is a link/button — adds orange hover border. |
| `.btn-primary` | Filled orange button. Primary CTAs. |
| `.btn-secondary` | Outlined button, orange on hover. Secondary actions. |
| `.btn-ghost` | Dashed border button. "Write your own" affordances. |
| `.text-eyebrow` | 11px, spaced uppercase, muted color. Section labels and eyebrows. |
| `.move-btn` | Full-width scenario move button with A/B/C letter prefix. |
| `.move-btn--own` | Dashed variant of `.move-btn` for "write my own" option. |
| `.move-letter` | Orange letter label inside `.move-btn`. |

## Architecture decisions

- **No `tailwind.config.ts`** — Tailwind v4 uses `@theme {}` in `globals.css` as the config. All brand tokens live there.
- **`@data` webpack alias** — resolves `import ... from "@data"` to `../../data/index.ts`. Allows Server Components to import data types without duplicating them.
- **Server Components read JSON directly** — `readFileSync(join(process.cwd(), "../../data/scenarios.json"))` in page.tsx. No API needed for static data.
- **Split Server + Client** — pages are Server Components; interactive pieces (move buttons, forms) are extracted into `"use client"` components alongside the page file.
- **Turbopack disabled** — `next dev --webpack` required; Turbopack can't resolve cross-directory imports outside the artifact root.

## Product

- Landing page (`/`) — 5 bucket tiles linking to arenas
- Bucket page (`/bucket/[slug]`) — 5 scenario cards per bucket, each with 3 suggested moves + "write my own move"
- Tank page (`/tank`) — (coming) AI feedback session after picking a move
- Slugs: `growth`, `shipping-ai`, `leadership`, `zero-to-one`, `career`

## User preferences

- Keep `/data/` read-only — never modify files there
- Brand tokens must be centralized in `globals.css`; no hardcoded hex in component files
- Use `.card` / `.btn-primary` / `.btn-secondary` / `.btn-ghost` / `.text-eyebrow` class names in future prompts

## Gotchas

- `var(--font-display)` does NOT work as a font-family — use `var(--font-caveat)` directly
- Tailwind v4 `@layer components` classes don't hot-reload reliably; restart the workflow after adding new component classes
- `params` in Next.js 16 App Router is a `Promise<{ slug: string }>` — must `await params`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
