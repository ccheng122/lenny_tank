"use client";

import { useRouter } from "next/navigation";
import type { ScenarioCard } from "@data";

export default function ScenarioCardItem({ card }: { card: ScenarioCard }) {
  const router = useRouter();

  const go = (moveId: string) =>
    router.push(`/tank?scenarioId=${card.id}&moveId=${moveId}`);

  return (
    <article className="scenario-card rounded-2xl p-7 flex flex-col gap-5">
      {/* Title */}
      <h2 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
        {card.title}
      </h2>

      {/* Setup */}
      <p className="text-base leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
        {card.setup}
      </p>

      {/* Moves */}
      <div className="flex flex-col gap-3">
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--color-text-muted)" }}
        >
          Suggested moves
        </p>

        <div className="flex flex-col gap-2">
          {card.suggested_moves.map((move, i) => (
            <button
              key={i}
              onClick={() => go(String(i))}
              className="move-btn text-left text-sm"
            >
              <span className="move-letter">{String.fromCharCode(65 + i)}</span>
              <span>{move}</span>
            </button>
          ))}

          <button
            onClick={() => go("custom")}
            className="move-btn move-btn--own text-left text-sm"
          >
            <span className="move-letter move-letter--own">✏️</span>
            <span>Write my own move</span>
          </button>
        </div>
      </div>
    </article>
  );
}
