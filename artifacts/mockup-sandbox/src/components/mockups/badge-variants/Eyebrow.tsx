export function Eyebrow() {
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
        {/* A — Plain eyebrow: just muted uppercase tracking text, no container */}
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.18em",
            color: "#A8998F",
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: "16px",
          }}
        >
          🦈&ensp;Shark-tank-style scenario practice
        </p>
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
