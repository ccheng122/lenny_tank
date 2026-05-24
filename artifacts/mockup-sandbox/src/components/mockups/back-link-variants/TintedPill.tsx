export function TintedPill() {
  return (
    <div
      className="min-h-screen p-8 font-['Geist']"
      style={{ backgroundColor: "#FFFCF8" }}
    >
      <a
        href="#"
        className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors"
        style={{ backgroundColor: "#FEF0E2", color: "#B85C22" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#FEECD8";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#FEF0E2";
        }}
      >
        <span aria-hidden>←</span>
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
