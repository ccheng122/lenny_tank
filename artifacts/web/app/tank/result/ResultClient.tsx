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

type TankResponse = {
  reactions: Reaction[];
  verdict: string;
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
    const top = [...data.reactions].sort((a, b) => b.score - a.score)[0];
    const judges = data.reactions.map((r) => r.guest).join(", ");
    const params = new URLSearchParams({
      guest: top.guest,
      quote: top.pull_quote,
      judges,
    });
    return `/api/share/quote?${params.toString()}`;
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
        <div className="mx-auto max-w-5xl pt-16">
          <div className="text-center mb-12">
            <div className="result-spinner" aria-hidden />
            <p
              className="mt-6 text-lg"
              style={{ color: T.textSecondary, fontStyle: "italic" }}
            >
              The panel is convening…
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="result-card result-card--skeleton"
                style={{ animationDelay: `${i * 150}ms` }}
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
      <div className="mx-auto max-w-5xl">
        {/* Context header: scenario + move */}
        <header className="mb-10 fade-in">
          <p
            className="text-eyebrow mb-2"
            style={{ color: T.textMuted, letterSpacing: "0.18em" }}
          >
            The scenario
          </p>
          <p
            className="text-base leading-relaxed mb-5"
            style={{ color: T.textSecondary }}
          >
            {data.scenarioSetup}
          </p>
          <p
            className="text-eyebrow mb-2"
            style={{ color: T.textMuted, letterSpacing: "0.18em" }}
          >
            Your move
          </p>
          <p className="text-base leading-relaxed" style={{ color: T.text }}>
            {data.move}
          </p>
        </header>

        {/* Judge cards */}
        <section className="grid gap-6 md:grid-cols-3 mb-14">
          {data.reactions.map((r, i) => (
            <article
              key={r.slug}
              className="result-card fade-in"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <header className="mb-4">
                <h2
                  className="text-2xl font-bold leading-tight"
                  style={{ color: T.text }}
                >
                  {r.guest}
                </h2>
                <p
                  className="mt-1 text-sm"
                  style={{ color: T.textMuted, lineHeight: 1.4 }}
                >
                  {r.post_url ? (
                    <a
                      href={r.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: T.textSecondary, textDecoration: "underline", textDecorationColor: T.border }}
                    >
                      {r.episode_title}
                    </a>
                  ) : (
                    <span style={{ color: T.textSecondary }}>{r.episode_title}</span>
                  )}
                  {r.episode_date ? ` · ${r.episode_date}` : ""}
                </p>
              </header>

              <p
                className="text-lg leading-relaxed mb-5"
                style={{ color: T.text }}
              >
                {r.reaction}
              </p>

              <blockquote className="result-pull">
                <span className="result-pull__mark" aria-hidden>❝</span>
                <p>{r.pull_quote}</p>
                <span className="result-pull__mark result-pull__mark--end" aria-hidden>❞</span>
              </blockquote>

              <div className="mt-5 flex justify-end">
                <ScoreBadge score={r.score} />
              </div>
            </article>
          ))}
        </section>

        {/* Verdict */}
        <section
          className="result-verdict fade-in"
          style={{ animationDelay: "400ms" }}
        >
          <p
            className="text-eyebrow mb-3"
            style={{ color: T.orangeLight, letterSpacing: "0.22em" }}
          >
            The panel has spoken
          </p>
          <p
            className="text-xl leading-relaxed mb-8"
            style={{ color: T.text }}
          >
            {data.verdict}
          </p>
          <div className="flex items-baseline gap-4">
            <span style={{ color: T.textMuted, fontSize: "0.875rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Aggregate score
            </span>
            <span
              style={{
                fontSize: "3.5rem",
                fontWeight: 800,
                lineHeight: 1,
                color: T.orange,
              }}
            >
              {data.score.toFixed(1)}
            </span>
            <span style={{ color: T.textMuted, fontSize: "1.25rem" }}>
              / 10
            </span>
          </div>
        </section>

        {/* Actions */}
        <section
          className="mt-12 flex flex-wrap justify-center gap-3 fade-in"
          style={{ animationDelay: "500ms" }}
        >
          <button
            onClick={openShareModal}
            className="result-btn result-btn--primary"
          >
            Share a quote
          </button>
          <button
            onClick={() => router.push("/")}
            className="result-btn result-btn--ghost"
          >
            Try another scenario →
          </button>
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
      role="dialog"
      aria-modal="true"
      aria-label="Share quote preview"
    >
      <div
        className="share-modal"
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
            Save it, post it — or just admire it.
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
            download="lenny-tank-share.png"
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
    `}</style>
  );
}

function SpinnerStyles() {
  return (
    <style jsx global>{`
      .result-spinner {
        display: inline-block;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 3px solid ${T.border};
        border-top-color: ${T.orange};
        animation: result-spin 0.9s linear infinite;
      }
      @keyframes result-spin {
        to { transform: rotate(360deg); }
      }
      .result-card--skeleton {
        height: 320px;
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
      .result-card {
        border-radius: 1rem;
      }
    `}</style>
  );
}

function CardStyles() {
  return (
    <style jsx global>{`
      .result-card {
        background-color: ${T.surface};
        border: 1.5px solid ${T.border};
        border-radius: 1rem;
        padding: 1.75rem;
        display: flex;
        flex-direction: column;
      }
      .result-pull {
        position: relative;
        margin: 0;
        padding: 0.5rem 0 0.5rem 1.25rem;
        border-left: 3px solid ${T.orange};
        font-style: italic;
        color: ${T.textSecondary};
        line-height: 1.6;
      }
      .result-pull p {
        margin: 0;
        font-size: 0.95rem;
      }
      .result-pull__mark {
        color: ${T.orange};
        font-size: 1.25rem;
        font-style: normal;
        margin-right: 0.25rem;
        opacity: 0.85;
      }
      .result-pull__mark--end {
        margin-left: 0.25rem;
        margin-right: 0;
      }
      .result-verdict {
        background-color: ${T.surfaceRaised};
        border: 1.5px solid ${T.borderStrong};
        border-radius: 1.25rem;
        padding: 2.25rem 2rem;
      }
      .fade-in {
        animation: result-fade 280ms ease-out both;
      }
      @keyframes result-fade {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
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
