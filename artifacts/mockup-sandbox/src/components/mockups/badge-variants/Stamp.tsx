export function Stamp() {
  return (
    <div
      style={{ fontFamily: "system-ui, sans-serif", backgroundColor: "#FFFCF8" }}
      className="flex min-h-screen items-center justify-center"
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap"
      />
      <div className="text-center px-8">
        {/* B — Stamp tag: solid orange rect, white text, short label */}
        <div style={{ marginBottom: "20px" }}>
          <span
            style={{
              display: "inline-block",
              backgroundColor: "#E07432",
              color: "#fff",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "5px 12px",
              borderRadius: "4px",
            }}
          >
            Scenario Practice
          </span>
        </div>
        <h1
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "64px",
            fontWeight: 700,
            color: "#1A1110",
            lineHeight: 1.1,
          }}
        >
          The Lenny Tank
        </h1>
      </div>
    </div>
  );
}
