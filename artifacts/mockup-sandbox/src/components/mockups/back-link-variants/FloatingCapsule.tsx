export function FloatingCapsule() {
  return (
    <div
      className="min-h-screen p-8 font-['Geist']"
      style={{ backgroundColor: "#FFFCF8" }}
    >
      <a
        href="#"
        className="group inline-flex items-center gap-2.5 rounded-full bg-white py-2 pl-2 pr-5 text-sm font-medium transition-all"
        style={{
          color: "#1A1110",
          border: "1px solid #EAD9CB",
          boxShadow: "0 1px 2px rgba(26,17,16,0.04), 0 4px 12px rgba(26,17,16,0.05)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow =
            "0 2px 4px rgba(224,116,50,0.08), 0 8px 20px rgba(224,116,50,0.12)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow =
            "0 1px 2px rgba(26,17,16,0.04), 0 4px 12px rgba(26,17,16,0.05)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-base"
          style={{ backgroundColor: "#FEF0E2", color: "#E07432" }}
          aria-hidden
        >
          ←
        </span>
        Back to scenarios
      </a>

      <div className="mt-10 space-y-3">
        <p
          className="text-[11px] font-medium tracking-[0.14em] uppercase"
          style={{ color: "#A8998F" }}
        >
          The scenario
        </p>
        <h1
          className="text-3xl font-bold"
          style={{ color: "#1A1110", opacity: 0.35 }}
        >
          The Retention Cliff
        </h1>
      </div>
    </div>
  );
}
