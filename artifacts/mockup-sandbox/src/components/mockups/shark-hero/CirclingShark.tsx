import { ArrowRight } from "lucide-react";

export function CirclingShark() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Geist:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div
        className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 py-20"
        style={{
          backgroundColor: "#FFFCF8",
          fontFamily: "'Geist', sans-serif",
        }}
      >
        <div className="relative flex w-full max-w-5xl flex-col items-center text-center">
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.24em] mb-10"
            style={{ color: "#A8998F" }}
          >
            Shark-tank-style scenario practice
          </span>

          {/* Headline + shark composition */}
          <div className="relative w-full flex items-center justify-center">
            {/* Shark silhouette sits behind/under the headline, swimming left to right */}
            <img
              src="/__mockup/images/shark-circling.png"
              alt=""
              className="pointer-events-none absolute left-1/2 top-1/2 w-[120%] max-w-[1100px] -translate-x-1/2 -translate-y-1/2 opacity-95"
              style={{ transform: "translate(-50%, -30%) rotate(-4deg)" }}
            />

            <h1
              className="relative z-10"
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "clamp(5rem, 13vw, 10rem)",
                lineHeight: 0.95,
                color: "#1A1110",
                letterSpacing: "-0.02em",
                textShadow: "0 6px 30px rgba(255, 252, 248, 0.95), 0 0 60px rgba(255, 252, 248, 0.7)",
              }}
            >
              The Lenny Tank
            </h1>
          </div>

          <p className="relative z-10 mt-32 max-w-xl text-[17px] md:text-xl leading-relaxed">
            <span style={{ color: "#7C6E66" }}>
              Practice the high-stakes decisions of your craft.{" "}
            </span>
            <span style={{ color: "#1A1110", fontWeight: 500 }}>
              Get feedback from people who've already lived them.
            </span>
          </p>

          <button
            className="group relative z-10 mt-10 flex items-center gap-2 rounded-[10px] px-8 py-3.5 text-white font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ backgroundColor: "#E07432" }}
          >
            Pick your arena
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[13px]"
          style={{ color: "#A8998F" }}
        >
          Inspired by the guests of{" "}
          <span style={{ color: "#E07432", fontWeight: 600 }}>
            Lenny's Podcast
          </span>
        </div>
      </div>
    </>
  );
}
