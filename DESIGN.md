---
name: The Lenny Tank
description: Shark-tank-style PM scenario practice, judged by Lenny's Podcast guests
colors:
  brand-orange: "#e07432"
  brand-orange-light: "#fef0e2"
  brand-orange-dark: "#b85c22"
  surface: "#fffcf8"
  surface-tint: "#fff8f3"
  surface-press: "#feecd8"
  card: "#ffffff"
  border: "#ead9cb"
  border-strong: "#d4c2b0"
  text-primary: "#1a1110"
  text-secondary: "#7c6e66"
  text-muted: "#a8998f"
  result-bg: "#0f0a08"
  result-surface: "#1a1311"
  result-surface-raised: "#221915"
  result-border: "#3a2c24"
  result-border-strong: "#5a4538"
  result-text: "#f5ede4"
  result-text-secondary: "#bfb0a3"
  result-text-muted: "#8a7c72"
  result-orange-light: "#f5a76b"
typography:
  display:
    fontFamily: "Caveat, cursive"
    fontSize: "clamp(3.75rem, 8vw, 6rem)"
    fontWeight: 700
    lineHeight: 1.1
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    letterSpacing: "0.18em"
rounded:
  btn: "10px"
  card: "16px"
  pill: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.brand-orange}"
    textColor: "#ffffff"
    rounded: "{rounded.btn}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.brand-orange-dark}"
    textColor: "#ffffff"
  button-secondary:
    backgroundColor: "{colors.card}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.btn}"
    padding: "10px 20px"
  button-secondary-hover:
    textColor: "{colors.brand-orange}"
  button-ghost:
    backgroundColor: "{colors.card}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.btn}"
    padding: "10px 20px"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.card}"
    padding: "28px"
  card-interactive-hover:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.card}"
---

# Design System: The Lenny Tank

## 1. Overview

**Creative North Star: "The Mentor's War Room"**

The Lenny Tank looks like a warm editorial publication and functions like a pressure chamber. The light pages — cream surfaces, Caveat script, warm tan borders — carry the feel of a trusted newsletter or a well-read book. They are inviting without being soft. Then the result page drops the lights and everything shifts: near-black, amber-tinted dark, the same orange now glowing rather than popping. The transition is abrupt by design. You were preparing; now you are being judged.

The typography is the personality. Caveat (handwritten, loose, confident) carries the title and nothing else. Geist (clean, focused, slightly technical) handles everything downstream. The contrast between the two isn't decoration — it says: this is a place with a distinct voice that also takes your time seriously.

Orange is the only accent in the system. It appears on fewer than 10% of any given screen, always at a point of commitment or consequence: the CTA, the hover signal, the move letter, the score. When it shows up, it means something. This restraint is the system's most important discipline.

**Key Characteristics:**
- Warm parchment surfaces (#fffcf8) with white card floors — shallow depth through tonal layering, not shadows
- Single accent (Lenny's Orange, #e07432) used only at decision and consequence points
- Handwritten display type (Caveat) for titles only; clean sans (Geist) for everything else
- Flat-by-default elevation; shadows appear only as hover state signals
- Two-mode system: light for preparation, dark (#0f0a08) for the result reveal
- Uppercase tracked labels (eyebrows) as the consistent context-setting pattern

## 2. Colors: The Amber Thread

Every surface in this system, light or dark, pulls toward amber and orange. There are no cool neutrals. The hue thread connects the parchment page to the near-black result background — they are the same warmth, just pulled apart on the lightness axis.

### Primary

- **Lenny's Orange** (#e07432): the tank's heat. Used on CTAs, hover borders, score indicators, icon circles, move letters, and the accent line anywhere consequence is being signaled. Its presence is always earned.
- **Ember** (#b85c22): the pressed and darkened state of orange. Used on button :hover and :active. Never as a standalone accent.
- **Pale Ember** (#fef0e2): the orange wash. Used for icon circle backgrounds, pressed surface fills, and anywhere an orange-adjacent warmth is needed without full saturation.

### Neutral

- **Afternoon Parchment** (#fffcf8): the page surface. The base layer everything floats on. Warm, not white.
- **Warm Hover** (#fff8f3): slightly deeper tint for hover fills on interactive surfaces.
- **Pressed Apricot** (#feecd8): active/pressed state for move buttons and orange-adjacent interactions.
- **Cloud** (#ffffff): card surfaces. Floats above Afternoon Parchment to create tonal depth without shadows.
- **Warm Driftwood** (#ead9cb): the default border. Used on all cards and move buttons at rest.
- **Dark Driftwood** (#d4c2b0): stronger border, used for ghost button strokes and emphasized dividers.
- **Near-Black** (#1a1110): primary text. Barely saturated, just enough warmth to stay in the amber thread.
- **Warm Ash** (#7c6e66): secondary text and body copy on light surfaces.
- **Faded Ash** (#a8998f): muted text, eyebrow labels, timestamps, metadata.

### Dark Variant (result page only)

- **Charred** (#0f0a08): the tank floor. Near-black with an amber undercurrent, not a neutral black.
- **Ember Dark** (#1a1311): judge card surfaces.
- **Raised Ember** (#221915): the verdict section background — elevated above Ember Dark.
- **Dark Driftwood** (#3a2c24): card borders in dark mode.
- **Strong Dark Driftwood** (#5a4538): emphasized borders and structural dividers in dark mode.
- **Warm White** (#f5ede4): primary text on dark. Never pure white.
- **Warm Mist** (#bfb0a3): secondary text on dark.
- **Dim Ash** (#8a7c72): muted text and metadata on dark. Check contrast; this is at risk.
- **Amber Glow** (#f5a76b): the orange variant for dark mode. Slightly lighter than Lenny's Orange for legibility on dark surfaces.

### Named Rules

**The Rarity Rule.** Lenny's Orange (#e07432) appears on 10% or less of any light-mode screen. It marks what matters. Widening its presence turns a heat signal into wallpaper.

**The Hue Thread Rule.** Every neutral in this system, light or dark, is tinted toward amber. Never introduce a neutral with a blue or green bias. If a new surface color doesn't feel like it belongs in the same firelight as Afternoon Parchment and Charred, rework it.

**The Two-Mode Rule.** This is a two-mode system, not a dark-mode toggle. Light mode is preparation. Dark mode is judgment. The transition is abrupt on purpose. Do not add intermediate states, partial dark surfaces on light pages, or blended themes.

## 3. Typography: Handwritten Authority

**Display Font:** Caveat (with cursive fallback)
**Body Font:** Geist (with system-ui, sans-serif fallback)

**Character:** Caveat is a handwritten script that reads as confident rather than cute — loose, informal, but not uncertain. Geist is precise and slightly technical without being cold. Together they split the personality cleanly: Caveat holds the brand voice, Geist holds the content.

### Hierarchy

- **Display** (700 weight, clamp(3.75rem, 8vw, 6rem), line-height 1.1): reserved exclusively for the hero title "The Lenny Tank." Never used below the hero fold or on downstream pages.
- **Headline** (700 weight, 1.875–2.25rem, line-height 1.2): scenario titles, page h1s on bucket and tank pages. Geist, not Caveat.
- **Title** (700 weight, 1.25rem, line-height 1.3): card h2s, judge names on the result page, section headers in forms.
- **Body** (400 weight, 1rem, line-height 1.625, max 65–75ch): scenario setup text, judge reactions, feedback copy. The primary reading surface.
- **Label** (600 weight, 0.6875rem, 0.18em letter-spacing, uppercase): eyebrow labels only. "The scenario", "Your move", "Pick your arena". Used sparingly as context-setting signals above headings.

### Named Rules

**The One-Font Display Rule.** Caveat is used for the hero title and nowhere else in the product. Using it on downstream pages — subheadings, labels, decorative text — dilutes the moment it creates on the landing page. Downstream typography is Geist exclusively.

**The Eyebrow Rule.** Uppercase tracked labels (the `.text-eyebrow` pattern) are the system's context-setting primitive. One per section maximum. Never use them as decorative text or to introduce non-functional hierarchy.

## 4. Elevation

This system is flat by default. Cards at rest rely entirely on their warm driftwood border for boundary definition — no shadow at rest. The surface/card tonal split (parchment page, white card) provides depth through color layering alone. Shadows enter only as hover state feedback, communicating lift and interactability.

The one exception is the back-pill component, which carries a resting ambient shadow (`0 1px 2px rgba(26,17,16,0.04), 0 4px 12px rgba(26,17,16,0.05)`) to signal that it floats above the page content rather than being embedded in it. This is intentional and should not be replicated on other components.

The result page dark mode is entirely flat. Depth is expressed through the three tonal layers — Charred (page), Ember Dark (cards), Raised Ember (verdict) — not through shadows.

### Shadow Vocabulary

- **Resting ambient** (`0 1px 2px rgba(26,17,16,0.04), 0 4px 12px rgba(26,17,16,0.05)`): back-pill only. Signals floating navigation affordance.
- **Card hover lift** (`0 4px 16px rgba(224,116,50,0.12)`): interactive card on :hover. Orange-tinted to stay in the hue thread.
- **Button hover glow** (`0 2px 8px rgba(224,116,50,0.25)`): primary button on :hover. Slightly tighter spread than the card lift.
- **Secondary/ghost hover** (`0 2px 10px rgba(224,116,50,0.10)`): secondary and ghost buttons on :hover. Softer, same orange tint.

### Named Rules

**The Hover-Only Shadow Rule.** Shadows are state feedback, not decoration. A component at rest has no shadow (back-pill excepted). Adding resting shadows to cards, buttons, or containers violates this principle and makes the system feel heavier than it is.

## 5. Components

### Buttons

Three variants. All share the same border-radius (10px — gently curved, not soft), the same font size (0.875rem, 600 weight), and the same transition timing (0.15s).

- **Primary:** Filled Lenny's Orange (#e07432), white text, 1.5px orange border. On :hover, background shifts to Ember (#b85c22) and a warm glow shadow appears. Used for the primary commitment action on any screen.
- **Secondary:** White background, Warm Ash (#7c6e66) text, 1.5px Dark Driftwood (#d4c2b0) solid border. On :hover, border and text shift to Lenny's Orange. Used for supplementary actions alongside a primary button, or for move options (with modified padding).
- **Ghost:** White background, 1.5px dashed Dark Driftwood border. Same hover as Secondary. The dashed border signals an optional, generative, or exploratory action — specifically "write your own" affordances. Never use a ghost button for a required action.

### Cards

Cards are white (#ffffff) on a parchment page (#fffcf8). The tonal contrast provides depth without shadows. A 1.5px Warm Driftwood (#ead9cb) border defines the boundary at rest, supplemented by a barely-visible ambient shadow (`0 1px 3px rgba(180,130,90,0.06)`).

Interactive cards gain hover treatment: border shifts to Lenny's Orange, a warm orange-tinted shadow lifts the card (`0 4px 16px rgba(224,116,50,0.12)`), and the card translates up 2px. The scenario title's underline decoration simultaneously shifts from Warm Driftwood to Lenny's Orange — a secondary hover signal inside the card.

Corner radius is 16px throughout. Internal padding is 28px (1.75rem).

**The No-Nested-Cards Rule.** Cards never appear inside other cards. The scenario-card-on-page-surface is the maximum nesting depth.

### Move Buttons

Full-width scenario move buttons are a structured affordance, not a card variant. They are a flat surface (parchment background, #fffcf8) with a 1.5px Warm Driftwood border and 10px radius — matching the button radius, not the card radius. On :hover, the border turns orange, the background warms to surface-tint, and a soft shadow appears.

The interior layout is fixed: a letter label (A/B/C) in Lenny's Orange on the left, move text at full width on the right. The letter label is uppercase, 0.75rem, 700 weight. The "write your own" variant uses a dashed border and muted text, signaling optional entry.

### Back-Pill

A floating navigation capsule: pill shape (9999px radius), white background, 1px Warm Driftwood border, and the system's only resting ambient shadow. The left end contains a 28px circle in Pale Ember (#fef0e2) with an arrow in Lenny's Orange. The right end has plain body text with 18px right padding.

On :hover, the shadow deepens with an orange tint and the pill lifts 1px. This is the only navigation component in the system and should not be replicated as a general-purpose pill component.

### Eyebrow Label

Uppercase tracked text (0.6875rem, 600 weight, 0.18em letter-spacing) in Faded Ash (#a8998f). Appears above headings to set context: "The scenario", "Your move", "Pick your arena", "The panel has spoken." One per section, never decorative.

On the dark result page, eyebrow labels shift to Dim Ash (#8a7c72) or Amber Glow (#f5a76b) when the section they introduce carries elevated importance (e.g. "The panel has spoken").

### Score Badge (Result page)

A pill badge (9999px radius) displaying a score out of 10. Background, text color, and border are determined by score range: red-toned for scores 1–4, amber-toned for 5–7, green-toned for 8–10. All three variants are dark-mode only — they appear exclusively on the result page. Do not port this component to light-mode surfaces.

## 6. Do's and Don'ts

### Do:
- **Do** use Lenny's Orange (#e07432) as the sole accent and keep it at 10% or less of any given screen. Its rarity is its meaning.
- **Do** tint every neutral toward amber. If a new color doesn't belong in the same warmth family as Afternoon Parchment (#fffcf8) and Charred (#0f0a08), reconsider it.
- **Do** keep Caveat exclusively for the hero title. Downstream pages use Geist for everything.
- **Do** use the tonal layer (parchment page / white card) as the primary depth signal — not shadows at rest.
- **Do** let the result page feel abrupt and dramatic. The light-to-dark transition is the product's most intentional design choice. Don't smooth it out.
- **Do** keep body line length to 65–75ch maximum on scenario and result text.
- **Do** use uppercase tracked eyebrow labels (`text-eyebrow` pattern) as the sole context-setting primitive above headings.

### Don't:
- **Don't** use generic SaaS / startup cream aesthetics: neutral beige, Inter font, softly rounded corners, standard component library defaults. The system already diverges from this and must stay that way.
- **Don't** make it feel corporate or LinkedIn-serious: stiff, credential-heavy, over-professional. The product is practice, not a performance review.
- **Don't** add gamification: streaks, XP bars, achievement badges, progress rings. Stakes should feel real, not like a language app.
- **Don't** use border-left or border-right greater than 1px as a colored accent stripe on cards, callouts, or list items. Rewrite with full borders, background tints, or leading labels instead.
- **Don't** use gradient text (background-clip: text with a gradient). Use a single solid color. Emphasis through weight or size.
- **Don't** use Caveat on downstream pages, labels, or any component below the hero. One font does one job.
- **Don't** add intermediate dark/light states between the light preparation pages and the dark result page. The shift is binary.
- **Don't** widen the orange accent beyond its current usage. Adding orange backgrounds, orange sections, or orange decorative elements turns the accent into ambient color.
- **Don't** use pure #ffffff for new surface colors. New surfaces should use Afternoon Parchment (#fffcf8) or surface-tint (#fff8f3). The white card (#ffffff) is a specific token for card floors only.
