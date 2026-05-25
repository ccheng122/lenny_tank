import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const MAX_QUOTE_CHARS = 200;

function truncate(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

function clean(s: string | null, fallback = "") {
  if (!s) return fallback;
  return s.replace(/\s+/g, " ").trim();
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const guest = clean(sp.get("guest"), "A judge");
  const quote = truncate(clean(sp.get("quote"), ""), MAX_QUOTE_CHARS);
  const judges = clean(sp.get("judges"), "");

  const BG = "#0f0a08";
  const SURFACE = "#1a1311";
  const TEXT = "#f5ede4";
  const MUTED = "#8a7c72";
  const SECONDARY = "#bfb0a3";
  const ORANGE = "#e07432";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: BG,
          padding: "64px 80px",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          position: "relative",
        }}
      >
        {/* Orange accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "8px",
            backgroundColor: ORANGE,
          }}
        />

        {/* Top label */}
        <div
          style={{
            display: "flex",
            color: MUTED,
            fontSize: 22,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          I just sat with The Lenny Tank
        </div>

        {/* Center: quote + attribution */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            marginTop: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              color: TEXT,
              fontSize: quote.length > 120 ? 46 : 56,
              lineHeight: 1.25,
              fontWeight: 600,
              fontStyle: "italic",
            }}
          >
            <span style={{ color: ORANGE, marginRight: 8 }}>“</span>
            <span style={{ flex: 1 }}>{quote || "…"}</span>
            <span style={{ color: ORANGE, marginLeft: 8 }}>”</span>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 36,
              color: SECONDARY,
              fontSize: 30,
              fontWeight: 500,
            }}
          >
            — {guest}
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: `1px solid ${SURFACE}`,
            paddingTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 760,
            }}
          >
            <span
              style={{
                color: MUTED,
                fontSize: 16,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Got tanked by
            </span>
            <span style={{ color: SECONDARY, fontSize: 22, fontWeight: 500 }}>
              {judges || "The panel"}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              color: ORANGE,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            lennytank.app
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
