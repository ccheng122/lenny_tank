import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const CREAM     = "#f5ede4";
const CREAM_DK  = "#e8ddd4";
const INK       = "#1e1410";
const INK_MUTED = "#7c6e66";
const INK_FAINT = "#a8998f";
const ORANGE    = "#e07432";
const DIVIDER   = "#d4c4b8";

const MAX_NAME_CHARS = 28;

function truncate(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

function cleanName(s: string): string {
  return s.split(",")[0].replace(/\s+/g, " ").trim();
}

function parseJudges(raw: string | null): string[] {
  if (!raw) return [];
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

  const longestName = Math.max(...displayJudges.map((n) => n.length));
  const nameSize = longestName > 20 ? 52 : longestName > 14 ? 62 : 72;

  const origin = req.nextUrl.origin;
  const finUrl = `${origin}/images/shark-fin-waterline.png`;

  // Load Geist from /public/fonts — a local fetch that works in the edge runtime.
  // We only have the regular weight; Satori synthesizes bold from it.
  let fontData: ArrayBuffer | null = null;
  try {
    fontData = await fetch(`${origin}/fonts/Geist-Regular.ttf`).then((r) => r.arrayBuffer());
  } catch {
    // fall through — render with Satori's default font
  }

  const fonts: { name: string; data: ArrayBuffer; weight: 400; style: "normal" }[] =
    fontData ? [{ name: "Geist", data: fontData, weight: 400, style: "normal" }] : [];
  const sans = fonts.length > 0 ? "Geist, sans-serif" : "sans-serif";

  const scaledW = Math.round(1408 * (630 / 768));
  const leftPanelW = 460;
  const imgLeft = -Math.round((scaledW - leftPanelW) / 2);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          backgroundColor: CREAM,
          fontFamily: sans,
        }}
      >
        {/* Left: shark fin */}
        <div
          style={{
            width: leftPanelW,
            height: 630,
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexShrink: 0,
            borderRight: `1px solid ${DIVIDER}`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={finUrl}
            width={scaledW}
            height={630}
            style={{ position: "absolute", top: 0, left: imgLeft }}
          />
        </div>

        {/* Right: content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "52px 60px 48px",
            backgroundColor: CREAM,
          }}
        >
          <div style={{ display: "flex", color: INK_FAINT, fontSize: 17, letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700 }}>
            The Lenny Tank
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", color: INK_MUTED, fontSize: 28, fontStyle: "italic", marginBottom: 18 }}>
              I got tanked by
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {displayJudges.map((name, i) => (
                <div key={`${name}-${i}`} style={{ display: "flex", color: INK, fontSize: nameSize, fontWeight: 700, lineHeight: 1.08 }}>
                  {name}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, backgroundColor: CREAM_DK, padding: "12px 20px", borderRadius: 999, alignSelf: "flex-start" }}>
            <span style={{ color: INK_MUTED, fontSize: 19, fontWeight: 500 }}>Wanna play?</span>
            <span style={{ color: ORANGE, fontSize: 19 }}>→</span>
            <span style={{ color: INK, fontSize: 19, fontWeight: 700 }}>lennytank.app</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts },
  );
}
