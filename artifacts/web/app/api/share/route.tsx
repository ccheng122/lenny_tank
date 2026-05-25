import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

// Brand tokens (hex literals — next/og renders outside React so CSS vars don't resolve).
// Source of truth: artifacts/web/app/globals.css @theme {}.
const CREAM = "#fffcf8";        // --color-surface
const CREAM_TINT = "#fff8f3";   // --color-surface-tint
const INK = "#1a1110";          // --color-text-primary
const INK_MUTED = "#7c6e66";    // --color-text-secondary
const INK_FAINT = "#a8998f";    // --color-text-muted
const ORANGE = "#e07432";       // --color-brand-orange — used as the accent line

const MAX_NAME_CHARS = 30;

function truncate(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

/**
 * Judges arrive as one query-param value; individual judges are separated by `|`
 * so we don't collide with commas embedded in titles ("Eric Ries, Lean Startup author").
 * We also defensively strip any trailing comma-clause, in case a caller forgot to clean.
 */
function cleanName(s: string): string {
  const beforeComma = s.split(",")[0];
  return beforeComma.replace(/\s+/g, " ").trim();
}

function parseJudges(raw: string | null): string[] {
  if (!raw) return [];
  // Prefer `|` as the separator; fall back to `,` if the caller used the old shape.
  const parts = raw.includes("|") ? raw.split("|") : raw.split(",");
  return parts
    .map(cleanName)
    .filter(Boolean)
    .slice(0, 3)
    .map((s) => truncate(s, MAX_NAME_CHARS));
}

export async function GET(req: NextRequest) {
  const judges = parseJudges(req.nextUrl.searchParams.get("judges"));
  const displayJudges = judges.length > 0 ? judges : ["The Panel"];

  // Scale name size down when names are long, so they fit comfortably.
  const longestName = Math.max(...displayJudges.map((n) => n.length));
  const nameSize = longestName > 22 ? 60 : longestName > 16 ? 72 : 84;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: CREAM,
          padding: "64px 80px",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        {/* Top: brand label */}
        <div
          style={{
            display: "flex",
            color: INK_FAINT,
            fontSize: 22,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          The Lenny Tank
        </div>

        {/* Center: phrase + judge names + accent line */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            marginTop: 24,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              color: INK_MUTED,
              fontSize: 34,
              fontFamily: "Georgia, 'Times New Roman', Times, serif",
              fontStyle: "italic",
              marginBottom: 28,
            }}
          >
            I just got tanked by
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            {displayJudges.map((name, i) => (
              <div
                key={`${name}-${i}`}
                style={{
                  display: "flex",
                  color: INK,
                  fontSize: nameSize,
                  lineHeight: 1.05,
                  fontWeight: 700,
                  fontFamily: "Georgia, 'Times New Roman', Times, serif",
                  letterSpacing: "0.01em",
                  textTransform: "uppercase",
                }}
              >
                {name}
              </div>
            ))}
          </div>

          {/* Brand accent line — anchors the negative space */}
          <div
            style={{
              width: 140,
              height: 5,
              backgroundColor: ORANGE,
              borderRadius: 999,
              marginTop: 36,
            }}
          />
        </div>

        {/* Bottom: CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: INK_MUTED,
            fontSize: 22,
            fontWeight: 500,
            backgroundColor: CREAM_TINT,
            padding: "14px 22px",
            borderRadius: 999,
          }}
        >
          <span>Wanna play?</span>
          <span style={{ color: ORANGE }}>→</span>
          <span style={{ color: INK, fontWeight: 700 }}>lennytank.app</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
