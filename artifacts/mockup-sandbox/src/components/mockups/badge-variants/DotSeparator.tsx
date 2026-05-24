export function DotSeparator() {
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
        {/* C — Dot separator: icon · text inline, subtle orange color on icon */}
        <p
          style={{
            fontSize: "13px",
            color: "#7C6E66",
            fontWeight: 500,
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "16px" }}>🦈</span>
          <span
            style={{
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              backgroundColor: "#E07432",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <span>Shark-tank-style scenario practice</span>
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
