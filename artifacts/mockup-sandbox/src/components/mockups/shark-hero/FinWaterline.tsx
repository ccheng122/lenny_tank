import { ArrowRight } from "lucide-react";

export function FinWaterline() {
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: "#FFFCF8", color: "#1A1110" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Geist:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* Hero illustration as full-bleed bottom band */}
      <div className="absolute inset-x-0 bottom-0 h-[58vh] pointer-events-none">
        <img
          src="/__mockup/images/shark-fin-waterline.png"
          alt=""
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div
        className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-20 md:pt-28"
        style={{ fontFamily: "'Geist', sans-serif" }}
      >
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.24em] mb-10"
          style={{ color: "#A8998F" }}
        >
          Shark-tank-style scenario practice
        </div>

        <h1
          className="text-center"
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "clamp(4.5rem, 11vw, 9rem)",
            lineHeight: 0.95,
            color: "#1A1110",
            letterSpacing: "-0.01em",
          }}
        >
          The Lenny Tank
        </h1>

        <p className="mt-8 max-w-xl text-center text-[17px] md:text-xl leading-relaxed">
          <span style={{ color: "#7C6E66" }}>
            Practice the high-stakes decisions of your craft.{" "}
          </span>
          <span style={{ color: "#1A1110", fontWeight: 500 }}>
            Get feedback from people who've already lived them.
          </span>
        </p>

        <button
          className="group mt-10 flex items-center gap-2 rounded-[10px] px-8 py-3.5 text-white font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ backgroundColor: "#E07432" }}
        >
          Pick your arena
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>

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
    </div>
  );
}
