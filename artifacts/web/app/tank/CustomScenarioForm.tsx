"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CustomScenarioForm({ from }: { from?: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const trimmed = text.trim();
  const disabled = trimmed.length === 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    const params = new URLSearchParams();
    params.set("scenarioId", "custom");
    params.set("scenarioText", trimmed);
    if (from) params.set("from", from);
    router.push(`/tank?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Describe the situation you're facing
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="e.g., We just lost our biggest enterprise customer mid-renewal. The CEO wants a 'win them back' plan by Monday — but I think the deal was actually unhealthy for us."
          className="card w-full p-4 text-base leading-relaxed resize-y focus:outline-none focus:ring-2"
          style={{
            color: "var(--color-text-primary)",
            // @ts-expect-error ring color custom property
            "--tw-ring-color": "var(--color-brand-orange)",
          }}
        />
      </label>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={disabled}
          className="btn-primary px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </form>
  );
}
