"use client";

import type { TournamentRuntimeMode } from "@/lib/tournament/routing/types";
import { RUNTIME_MODE_LABELS } from "@/lib/tournament/routing/types";

const MODES: TournamentRuntimeMode[] = ["mock", "groq_free", "hybrid_quality"];

const MODE_HINTS: Record<TournamentRuntimeMode, string> = {
  mock: "No external APIs — deterministic offline loop",
  groq_free: "Groq for challenge + agents + prelim judge (requires GROQ_API_KEY)",
  hybrid_quality: "Groq agent loop + mock final judge (Claude/GPT later)",
};

type Props = {
  value: TournamentRuntimeMode;
  groqAvailable: boolean;
  disabled?: boolean;
  onChange: (mode: TournamentRuntimeMode) => void;
};

export function RuntimeModeSelector({ value, groqAvailable, disabled, onChange }: Props) {
  return (
    <section className="glass-card rounded-2xl p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
        Runtime mode
      </h3>
      <p className="mt-1 text-xs text-zinc-500">
        Configure in Admin → Tournament engine settings. Default is Groq Free.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {MODES.map((mode) => {
          const needsGroq = mode !== "mock";
          const blocked = needsGroq && !groqAvailable;
          const active = value === mode;
          return (
            <button
              key={mode}
              type="button"
              disabled={disabled || blocked}
              onClick={() => onChange(mode)}
              title={blocked ? "Set GROQ_API_KEY in .env.local" : MODE_HINTS[mode]}
              className={`rounded-xl border px-4 py-2 text-sm transition ${
                active
                  ? "border-violet-500/50 bg-violet-500/15 text-violet-100"
                  : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
              } ${blocked ? "cursor-not-allowed opacity-40" : ""}`}
            >
              {RUNTIME_MODE_LABELS[mode]}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-zinc-500">{MODE_HINTS[value]}</p>
    </section>
  );
}
