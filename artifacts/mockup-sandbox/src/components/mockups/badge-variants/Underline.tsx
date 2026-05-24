export function Underline() {
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
        {/* D — Underline accent: text with orange bottom border, ghost container */}
        <div style={{ marginBottom: "20px" }}>
          <span
            style={{
              fontSize: "13px",
              color: "#7C6E66",
              fontWeight: 500,
              borderBottom: "2px solid #E07432",
              paddingBottom: "3px",
            }}
          >
            🦈&ensp;Shark-tank-style scenario practice
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
