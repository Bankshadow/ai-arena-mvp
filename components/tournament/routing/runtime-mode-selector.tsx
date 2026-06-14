"use client";

import { useTranslations } from "@/components/i18n/locale-provider";
import { translateRuntimeMode, translateRuntimeModeHint } from "@/lib/i18n/helpers";
import type { TournamentRuntimeMode } from "@/lib/tournament/routing/types";

const MODES: TournamentRuntimeMode[] = ["mock", "groq_free", "hybrid_quality"];

type Props = {
  value: TournamentRuntimeMode;
  groqAvailable: boolean;
  premiumAvailable?: boolean;
  disabled?: boolean;
  onChange: (mode: TournamentRuntimeMode) => void;
};

export function RuntimeModeSelector({
  value,
  groqAvailable,
  premiumAvailable = false,
  disabled,
  onChange,
}: Props) {
  const t = useTranslations();
  const rm = t.tournament.runtimeMode;

  function isBlocked(mode: TournamentRuntimeMode): boolean {
    if (mode === "mock") return false;
    if (mode === "groq_free") return !groqAvailable;
    return !groqAvailable && !premiumAvailable;
  }

  return (
    <section className="glass-card rounded-2xl p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
        {rm.selectorTitle}
      </h3>
      <p className="mt-1 text-xs text-zinc-500">{rm.selectorHint}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {MODES.map((mode) => {
          const blocked = isBlocked(mode);
          const active = value === mode;
          return (
            <button
              key={mode}
              type="button"
              disabled={disabled || blocked}
              onClick={() => onChange(mode)}
              title={blocked ? rm.groqKeyRequired : translateRuntimeModeHint(mode, t)}
              className={`rounded-xl border px-4 py-2 text-sm transition ${
                active
                  ? "border-violet-500/50 bg-violet-500/15 text-violet-100"
                  : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
              } ${blocked ? "cursor-not-allowed opacity-40" : ""}`}
            >
              {translateRuntimeMode(mode, t)}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-zinc-500">{translateRuntimeModeHint(value, t)}</p>
    </section>
  );
}
