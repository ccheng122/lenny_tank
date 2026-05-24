export function OutlinedPill() {
  return (
    <div
      className="min-h-screen p-8 font-['Geist']"
      style={{ backgroundColor: "#FFFCF8" }}
    >
      <a
        href="#"
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all"
        style={{
          backgroundColor: "#FFFFFF",
          color: "#1A1110",
          border: "1px solid #EAD9CB",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#E07432";
          e.currentTarget.style.color = "#B85C22";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#EAD9CB";
          e.currentTarget.style.color = "#1A1110";
        }}
      >
        <span
          className="inline-flex items-center justify-center"
          style={{ color: "#E07432" }}
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
