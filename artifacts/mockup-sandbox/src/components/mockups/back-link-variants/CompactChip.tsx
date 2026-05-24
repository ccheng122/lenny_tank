export function CompactChip() {
  return (
    <div
      className="min-h-screen p-8 font-['Geist']"
      style={{ backgroundColor: "#FFFCF8" }}
    >
      <a
        href="#"
        className="group inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-xs font-semibold transition-colors"
        style={{
          backgroundColor: "#1A1110",
          color: "#FFFCF8",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#E07432";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#1A1110";
        }}
      >
        <span
          className="inline-flex h-5 w-5 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
          aria-hidden
        >
          ←
        </span>
        Scenarios
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
