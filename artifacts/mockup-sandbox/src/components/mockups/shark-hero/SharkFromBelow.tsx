import { ArrowRight } from "lucide-react";

export function SharkFromBelow() {
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: "#FFFCF8" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Geist:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* Full-bleed cinematic background */}
      <img
        src="/__mockup/images/shark-from-below.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Warm wash + vignette to harmonize with brand cream */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(255, 252, 248, 0.35) 0%, rgba(255, 252, 248, 0) 50%), linear-gradient(180deg, rgba(255, 252, 248, 0.15) 0%, rgba(255, 252, 248, 0) 30%, rgba(26, 17, 16, 0.18) 100%)",
        }}
      />

      <div
        className="relative z-10 flex min-h-screen flex-col items-center px-6 py-16"
        style={{ fontFamily: "'Geist', sans-serif" }}
      >
        {/* Top: eyebrow + headline */}
        <div className="flex flex-col items-center text-center">
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.24em] mb-8"
            style={{ color: "#7C6E66" }}
          >
            Shark-tank-style scenario practice
          </span>

          <h1
            className="text-center"
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: "clamp(4.5rem, 11vw, 9rem)",
              lineHeight: 0.95,
              color: "#1A1110",
              letterSpacing: "-0.01em",
              textShadow: "0 4px 30px rgba(255, 252, 248, 0.9)",
            }}
          >
            The Lenny Tank
          </h1>

          <p className="mt-6 max-w-xl text-center text-[17px] md:text-xl leading-relaxed">
            <span style={{ color: "#3D2E2A" }}>
              Practice the high-stakes decisions of your craft.{" "}
            </span>
            <span style={{ color: "#1A1110", fontWeight: 500 }}>
              Get feedback from people who've already lived them.
            </span>
          </p>
        </div>

        {/* Bottom: CTA + footer pinned over the shark's depth */}
        <div className="mt-auto flex flex-col items-center pt-32">
          <button
            className="group flex items-center gap-2 rounded-[10px] px-8 py-3.5 text-white font-medium shadow-lg transition-all hover:-translate-y-0.5"
            style={{
              backgroundColor: "#E07432",
              boxShadow: "0 12px 32px -8px rgba(224, 116, 50, 0.55)",
            }}
          >
            Pick your arena
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <p
            className="mt-6 text-[13px]"
            style={{ color: "#FFFCF8", textShadow: "0 1px 8px rgba(26,17,16,0.6)" }}
          >
            Inspired by the guests of{" "}
            <span style={{ color: "#FCBE8A", fontWeight: 600 }}>
              Lenny's Podcast
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
