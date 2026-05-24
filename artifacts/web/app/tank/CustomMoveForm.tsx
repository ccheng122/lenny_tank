"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  scenarioId: string;
  scenarioText?: string;
  submitLabel?: string;
  /** When true, render the textarea immediately (no "Write my own move" toggle). */
  standalone?: boolean;
};

export default function CustomMoveForm({
  scenarioId,
  scenarioText,
  submitLabel = "Step into the Tank",
  standalone = false,
}: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(standalone);
  const [text, setText] = useState("");
  const trimmed = text.trim();
  const disabled = trimmed.length === 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    const params = new URLSearchParams();
    params.set("scenarioId", scenarioId);
    params.set("moveId", "custom");
    params.set("moveText", trimmed);
    if (scenarioText) params.set("scenarioText", scenarioText);
    router.push(`/tank/result?${params.toString()}`);
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="btn-ghost w-full px-6 py-4 justify-start"
      >
        <span>✏️</span>
        Write my own move
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {!standalone && (
        <p
          className="text-eyebrow"
          style={{ color: "var(--color-text-muted)" }}
        >
          Your own move
        </p>
      )}
      <textarea
        autoFocus={!standalone}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder="What would you actually do? Be specific — the sharper the move, the sharper the feedback."
        className="card w-full p-4 text-base leading-relaxed resize-y focus:outline-none focus:ring-2"
        style={{
          color: "var(--color-text-primary)",
          // @ts-expect-error ring color custom property
          "--tw-ring-color": "var(--color-brand-orange)",
        }}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={disabled}
          className="btn-primary px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitLabel} →
        </button>
      </div>
    </form>
  );
}
