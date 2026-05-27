"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Reaction = {
  slug: string;
  guest: string;
  episode_title: string;
  episode_date?: string;
  post_url?: string;
  reaction: string;
  pull_quote: string;
  score: number;
};

type VerdictTake = { name: string; text: string };

type TankResponse = {
  reactions: Reaction[];
  summary: string;
  takes: VerdictTake[];
  score: number;
  scenarioSetup: string;
  move: string;
};

// ── Theme (scoped to this page; the rest of the app stays in light mode) ──
const T = {
  bg: "#0f0a08",
  surface: "#1a1311",
  surfaceRaised: "#221915",
  border: "#3a2c24",
  borderStrong: "#5a4538",
  text: "#f5ede4",
  textSecondary: "#bfb0a3",
  textMuted: "#8a7c72",
  orange: "#e07432",
  orangeLight: "#f5a76b",
};

function scoreColor(score: number) {
  if (score <= 4) return { bg: "#3a1a14", text: "#ff8a7a", border: "#6b2a20" };
  if (score <= 7) return { bg: "#3a2e0e", text: "#f5cf60", border: "#6b5418" };
  return { bg: "#13301e", text: "#7ee0a3", border: "#205436" };
}

export default function ResultClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const scenarioId = searchParams.get("scenarioId");
  const moveId = searchParams.get("moveId");
  const scenarioText = searchParams.get("scenarioText");
  const moveText = searchParams.get("moveText");

  const [data, setData] = useState<TankResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  function buildShareUrl() {
    if (!data) return null;
    // Strip any ", title" suffix from each guest name before sending.
    // Use `|` as the separator so commas inside names (titles) don't split.
    const judges = data.reactions
      .map((r) => r.guest.split(",")[0].trim())
      .filter(Boolean)
      .join("|");
    const params = new URLSearchParams({ judges });
    return `/api/share?${params.toString()}`;
  }

  function openShareModal() {
    const url = buildShareUrl();
    if (!url) return;
    setShareUrl(url);
    setShareOpen(true);
    setCopyState("idle");
  }

  function closeShareModal() {
    setShareOpen(false);
  }

  async function handleCopyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(window.location.origin + shareUrl);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      // ignore — clipboard may be blocked
    }
  }

  // Close modal on Escape
  useEffect(() => {
    if (!shareOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShareOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shareOpen]);

  useEffect(() => {
    if (!scenarioId || !moveId) {
      setError("Missing scenario or move. Pick a scenario to start a round.");
      return;
    }
    let cancelled = false;
    setData(null);
    setError(null);

    // Cache canonical (scenarioId, moveId) pairs in localStorage. Custom
    // scenarios/moves carry unique text so they're not cacheable. Retries
    // (attempt > 0) skip the cache and re-fetch fresh.
    const cacheable =
      scenarioId !== "custom" && moveId !== "custom" && attempt === 0;
    const cacheKey = cacheable ? `tank:v2:${scenarioId}:${moveId}` : null;

    if (cacheKey) {
      try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
          setData(JSON.parse(raw) as TankResponse);
          return;
        }
      } catch {
        // bad/blocked storage — fall through to fetch
      }
    }

    (async () => {
      try {
        const body: Record<string, string> = { scenarioId, moveId };
        if (scenarioText) body.scenarioText = scenarioText;
        if (moveText) body.moveText = moveText;
        const res = await fetch("/api/tank", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json?.error ?? "Something went wrong. Try again.");
          return;
        }
        setData(json as TankResponse);
        if (cacheKey) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(json));
          } catch {
            // quota exceeded or blocked — ignore
          }
        }
      } catch {
        if (!cancelled) setError("Couldn't reach The Tank. Check your connection and try again.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [scenarioId, moveId, scenarioText, moveText, attempt]);

  // ── Error state ────────────────────────────────────────────────────────
  if (error) {
    return (
      <Shell>
        <div className="mx-auto max-w-2xl text-center pt-24">
          <p
            className="text-eyebrow mb-4"
            style={{ color: T.textMuted, letterSpacing: "0.18em" }}
          >
            The panel hit a snag
          </p>
          <p className="text-xl mb-8" style={{ color: T.text }}>
            {error}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setAttempt((a) => a + 1)}
              className="result-btn result-btn--primary"
            >
              Try again
            </button>
            <Link href="/" className="result-btn result-btn--secondary">
              ← Back home
            </Link>
          </div>
        </div>
        <ButtonStyles />
      </Shell>
    );
  }

  // ── Loading state ──────────────────────────────────────────────────────
  if (!data) {
    return (
      <Shell>
        <div className="mx-auto max-w-4xl pt-10">
          <div className="text-center mb-14">
            <div className="shark-swim-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/shark-fin-waterline.png"
                alt=""
                aria-hidden
                className="shark-swim-img"
              />
            </div>
            <p
              className="mt-2 text-lg"
              style={{ color: T.textSecondary, fontStyle: "italic" }}
            >
              The panel is convening…
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="result-card--skeleton"
                style={{ animationDelay: `${i * 150}ms`, height: "110px", borderRadius: "1rem" }}
              />
            ))}
          </div>
        </div>
        <SpinnerStyles />
      </Shell>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────
  return (
    <Shell>
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 fade-in">
          <div className="ctx-card">
            <div className="ctx-scenario">
              <p className="ctx-scenario-label">The scenario</p>
              <p className="ctx-scenario-text">{data.scenarioSetup}</p>
            </div>
            <hr className="ctx-divider" />
            <div className="ctx-move">
              <span className="ctx-move-label">Your move</span>
              <p className="ctx-move-text">{data.move}</p>
            </div>
          </div>
        </header>

        <ul className="judge-cards">
          {data.reactions.map((r, i) => (
            <li key={r.slug} className="judge-card fade-in" style={{ animationDelay: `${i * 120}ms` }}>
              <div className="judge-meta">
                <p className="judge-name">{r.guest}</p>
                <ScoreBadge score={r.score} />
                {r.post_url && (
                  <a
                    href={r.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="judge-ep-pill"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="currentColor" width="10" height="10" aria-hidden="true"><path d="M3.5 3a.5.5 0 0 0 0 1H7.3L3.14 8.15a.5.5 0 1 0 .71.71L8 4.71V8.5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5h-5Z"/></svg>
                    Open episode
                  </a>
                )}
              </div>
              <div className="judge-body">
                <p className="judge-reaction">{r.reaction}</p>
                <blockquote className="judge-pull"><p>❝ {r.pull_quote} ❞</p></blockquote>
              </div>
            </li>
          ))}
        </ul>

        <section className="result-verdict fade-in" style={{ animationDelay: "400ms" }}>
          <div className="flex items-center justify-between gap-6 mb-4 flex-wrap">
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: T.orangeLight }}>The panel has spoken</p>
            <div className="flex items-baseline gap-1.5">
              <span style={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1, color: T.orange }}>{data.score.toFixed(1)}</span>
              <span style={{ color: T.textMuted, fontSize: "1rem" }}>/ 10</span>
            </div>
          </div>
          {data.summary ? (
            <p style={{ fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.55, color: T.text, marginBottom: "1.5rem" }}>
              {data.summary}
            </p>
          ) : null}
          <div className="vd-takes">
            {(data.takes ?? []).map((t, i) => (
              <div key={i} className="vd-take">
                <span className="vd-take-name">{t.name}</span>
                <p className="vd-take-text">{t.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 flex flex-wrap justify-center gap-3 fade-in" style={{ animationDelay: "500ms" }}>
          <button onClick={openShareModal} className="result-btn result-btn--primary">Share → I got tanked</button>
          <button onClick={() => router.push("/")} className="result-btn result-btn--ghost">Try another scenario →</button>
        </section>
      </div>

      {shareOpen && shareUrl && (
        <ShareModal
          imageUrl={shareUrl}
          onClose={closeShareModal}
          onCopy={handleCopyLink}
          copyState={copyState}
        />
      )}

      <ButtonStyles />
      <CardStyles />
      <ModalStyles />
    </Shell>
  );
}

function ShareModal({
  imageUrl,
  onClose,
  onCopy,
  copyState,
}: {
  imageUrl: string;
  onClose: () => void;
  onCopy: () => void;
  copyState: "idle" | "copied";
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className="share-modal-backdrop"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        className="share-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Share quote preview"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="share-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <header className="share-modal__header">
          <p
            className="text-eyebrow"
            style={{ color: T.textMuted, letterSpacing: "0.18em" }}
          >
            Your share card
          </p>
          <p
            className="mt-1 text-sm"
            style={{ color: T.textSecondary }}
          >
            Name-drop the panel that just tanked you.
          </p>
        </header>

        <div className="share-modal__preview">
          {!loaded && <div className="share-modal__skeleton" aria-hidden />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Share card preview"
            onLoad={() => setLoaded(true)}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              borderRadius: "0.75rem",
              opacity: loaded ? 1 : 0,
              transition: "opacity 200ms ease",
            }}
          />
        </div>

        <footer className="share-modal__footer">
          <a
            href={imageUrl}
            download="lenny-tank.png"
            className="result-btn result-btn--primary"
          >
            ↓ Download PNG
          </a>
          <button
            type="button"
            onClick={onCopy}
            className="result-btn result-btn--secondary"
          >
            {copyState === "copied" ? "✓ Link copied" : "Copy link"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="result-btn result-btn--ghost"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const c = scoreColor(score);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: "0.25rem",
        padding: "0.375rem 0.875rem",
        borderRadius: "9999px",
        backgroundColor: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        fontWeight: 700,
        fontSize: "0.95rem",
      }}
    >
      {score}
      <span style={{ opacity: 0.6, fontSize: "0.8rem", fontWeight: 500 }}>/ 10</span>
    </span>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="min-h-screen px-6 pb-24 pt-10 sm:px-10"
      style={{ backgroundColor: T.bg, color: T.text }}
    >
      {children}
    </main>
  );
}

// ── Scoped style blocks (page-local; don't leak into the rest of the app) ──

function ButtonStyles() {
  return (
    <style jsx global>{`
      .result-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border-radius: 0.625rem;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.15s, border-color 0.15s, color 0.15s,
          box-shadow 0.15s, transform 0.15s;
        border: 1.5px solid transparent;
      }
      .result-btn--primary {
        background-color: ${T.orange};
        color: #fff;
        border-color: ${T.orange};
      }
      .result-btn--primary:hover {
        background-color: #f0884a;
        border-color: #f0884a;
        box-shadow: 0 4px 14px rgba(224, 116, 50, 0.35);
        transform: translateY(-1px);
      }
      .result-btn--secondary {
        background-color: ${T.surface};
        color: ${T.text};
        border-color: ${T.borderStrong};
      }
      .result-btn--secondary:hover {
        border-color: ${T.orange};
        color: ${T.orangeLight};
      }
      .result-btn--ghost {
        background-color: transparent;
        color: ${T.textSecondary};
        border-color: ${T.border};
        border-style: dashed;
      }
      .result-btn--ghost:hover {
        color: ${T.text};
        border-color: ${T.borderStrong};
      }
      .result-btn:focus-visible {
        outline: 2px solid ${T.orange};
        outline-offset: 3px;
      }
    `}</style>
  );
}

function SpinnerStyles() {
  return (
    <style jsx global>{`
      .shark-swim-wrap {
        position: relative;
        max-width: 500px;
        margin: 0 auto;
        overflow: hidden;
        -webkit-mask-image: radial-gradient(ellipse 68% 88% at 50% 54%, black 38%, transparent 70%);
        mask-image: radial-gradient(ellipse 68% 88% at 50% 54%, black 38%, transparent 70%);
      }
      .shark-swim-img {
        width: 100%;
        height: auto;
        display: block;
        animation: shark-swim 4.5s ease-in-out infinite;
        transform-origin: center 70%;
      }
      @keyframes shark-swim {
        0%   { transform: translateX(-30px) translateY(0px)  rotate(-2.5deg); }
        25%  { transform: translateX(-8px)  translateY(-6px) rotate(-0.5deg); }
        50%  { transform: translateX(30px)  translateY(0px)  rotate(2.5deg);  }
        75%  { transform: translateX(8px)   translateY(-6px) rotate(0.5deg);  }
        100% { transform: translateX(-30px) translateY(0px)  rotate(-2.5deg); }
      }
      .result-card--skeleton {
        border: 1.5px solid ${T.border};
        background: linear-gradient(
          90deg,
          ${T.surface} 0%,
          ${T.surfaceRaised} 50%,
          ${T.surface} 100%
        );
        background-size: 200% 100%;
        animation: result-shimmer 1.6s ease-in-out infinite;
      }
      @keyframes result-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        .shark-swim-img { animation: none; }
        .result-card--skeleton { animation: none; }
      }
    `}</style>
  );
}

function CardStyles() {
  return (
    <style jsx global>{`
      /* Context card (cream brief at top of results) */
      .ctx-card { background-color: rgba(245, 237, 228, 0.82); border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.45); }
      .ctx-scenario { padding: 1.25rem 1.5rem; }
      .ctx-scenario-label { font-size: 0.6875rem; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 600; color: #a08070; margin: 0 0 0.4rem; }
      .ctx-scenario-text { font-size: 0.9375rem; line-height: 1.65; color: #5a4538; margin: 0; }
      .ctx-divider { height: 1px; background-color: #d9cdc4; margin: 0; border: none; }
      .ctx-move { padding: 1.25rem 1.5rem; background-color: rgba(237, 228, 216, 0.82); }
      .ctx-move-label { display: block; font-size: 0.6875rem; letter-spacing: 0.14em; text-transform: uppercase; color: ${T.orange}; margin-bottom: 0.35rem; font-weight: 700; }
      .ctx-move-text { font-size: 1.0625rem; line-height: 1.55; color: #1e1410; font-weight: 600; margin: 0; }

      /* Judge cards */
      .judge-cards { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 3.5rem; list-style: none; padding: 0; margin-top: 0; }
      .judge-card {
        display: grid;
        grid-template-columns: 200px 1fr;
        gap: 0 2rem;
        background-color: ${T.surface};
        border: 1.5px solid ${T.borderStrong};
        border-radius: 1rem;
        padding: 1.5rem 1.75rem;
        align-items: start;
        box-shadow: 0 2px 12px rgba(0,0,0,0.35);
      }
      .judge-meta { padding-right: 2rem; border-right: 1px solid ${T.border}; }
      .judge-body { min-width: 0; }
      .judge-name { font-size: 1.125rem; font-weight: 700; color: ${T.text}; line-height: 1.3; margin: 0 0 0.5rem; }
      .judge-ep-pill { display: inline-flex; align-items: center; gap: 0.35rem; margin-top: 0.75rem; padding: 0.3rem 0.65rem; border-radius: 9999px; border: 1px solid ${T.borderStrong}; background: ${T.surfaceRaised}; color: ${T.textSecondary}; font-size: 0.75rem; font-weight: 500; text-decoration: none; transition: border-color 0.15s, color 0.15s; }
      .judge-ep-pill:hover { border-color: ${T.orange}; color: ${T.orangeLight}; }
      .judge-reaction { font-size: 0.9375rem; line-height: 1.65; color: ${T.textSecondary}; margin: 0 0 1rem; }
      .judge-pull {
        margin: 0; padding: 0.75rem 1rem;
        background-color: ${T.surfaceRaised}; border: 1px solid ${T.border};
        border-radius: 0.5rem; font-style: italic;
        color: ${T.textMuted}; font-size: 0.875rem; line-height: 1.6;
      }
      .judge-pull p { margin: 0; }
      @media (max-width: 640px) {
        .judge-card { grid-template-columns: 1fr; gap: 1rem 0; }
        .judge-meta { padding-right: 0; border-right: none; border-bottom: 1px solid ${T.border}; padding-bottom: 1rem; }
      }

      /* Verdict */
      .result-verdict {
        background-color: ${T.surfaceRaised};
        border: 1.5px solid ${T.borderStrong};
        border-radius: 1.25rem;
        padding: 2.25rem 2rem;
      }
      .vd-takes { display: flex; flex-direction: column; gap: 0; }
      .vd-take { display: grid; grid-template-columns: 140px 1fr; gap: 0 1.25rem; padding: 0.875rem 0; border-top: 1px solid ${T.border}; align-items: baseline; }
      .vd-take:last-child { border-bottom: 1px solid ${T.border}; }
      .vd-take-name { font-size: 0.9375rem; font-weight: 600; color: ${T.orange}; opacity: 0.8; }
      .vd-take-text { font-size: 0.9375rem; line-height: 1.6; color: ${T.text}; margin: 0; min-width: 0; }
      @media (max-width: 480px) {
        .vd-take { grid-template-columns: 1fr; gap: 0.2rem 0; padding: 0.75rem 0; }
        .vd-take-name { opacity: 1; }
      }

      /* Animations */
      .fade-in { animation: result-fade 280ms ease-out both; }
      @keyframes result-fade {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @media (prefers-reduced-motion: reduce) {
        .fade-in { animation: none; }
      }
    `}</style>
  );
}

function ModalStyles() {
  return (
    <style jsx global>{`
      .share-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 50;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        background-color: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        animation: share-fade 180ms ease-out both;
      }
      .share-modal {
        position: relative;
        width: 100%;
        max-width: 760px;
        max-height: calc(100vh - 3rem);
        overflow-y: auto;
        background-color: ${T.surfaceRaised};
        border: 1.5px solid ${T.borderStrong};
        border-radius: 1.25rem;
        padding: 1.75rem;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
        animation: share-rise 220ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      .share-modal__close {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        width: 36px;
        height: 36px;
        border-radius: 9999px;
        border: 1px solid transparent;
        background-color: transparent;
        color: ${T.textSecondary};
        font-size: 1.5rem;
        line-height: 1;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.15s, color 0.15s, border-color 0.15s;
      }
      .share-modal__close:hover {
        background-color: ${T.surface};
        color: ${T.text};
        border-color: ${T.border};
      }
      .share-modal__header {
        margin-bottom: 1.25rem;
        padding-right: 2.5rem;
      }
      .share-modal__preview {
        position: relative;
        aspect-ratio: 1200 / 630;
        border-radius: 0.75rem;
        overflow: hidden;
        background-color: ${T.bg};
        border: 1px solid ${T.border};
        margin-bottom: 1.25rem;
      }
      .share-modal__skeleton {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          ${T.surface} 0%,
          ${T.surfaceRaised} 50%,
          ${T.surface} 100%
        );
        background-size: 200% 100%;
        animation: result-shimmer 1.6s ease-in-out infinite;
      }
      .share-modal__footer {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 0.625rem;
      }
      @keyframes share-fade {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes share-rise {
        from { opacity: 0; transform: translateY(12px) scale(0.98); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
    `}</style>
  );
}
