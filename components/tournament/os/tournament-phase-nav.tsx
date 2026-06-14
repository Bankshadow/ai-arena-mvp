"use client";

import { Check } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

import { phaseAnchorId, TOURNAMENT_PHASES, type TournamentPhase } from "./types";

type Props = {
  activePhase: TournamentPhase;
  completedPhases?: Partial<Record<TournamentPhase, boolean>>;
  onPhaseClick: (phase: TournamentPhase) => void;
};

export function TournamentPhaseNav({ activePhase, completedPhases, onPhaseClick }: Props) {
  const phases = useTranslations().tournament.os.phases;

  return (
    <nav
      className="sticky top-[7.25rem] z-30 -mx-4 border-b border-white/10 bg-[#030303]/90 px-4 backdrop-blur-lg sm:-mx-6 sm:px-6"
      aria-label="Tournament phases"
    >
      <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
        {TOURNAMENT_PHASES.map((phase, i) => {
          const label = phases[phase];
          const active = activePhase === phase;
          const done = completedPhases?.[phase];
          return (
            <button
              key={phase}
              type="button"
              onClick={() => {
                onPhaseClick(phase);
                document.getElementById(phaseAnchorId(phase))?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition",
                active
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
              )}
            >
              <span className="font-mono text-[10px] text-zinc-600">{String(i + 1).padStart(2, "0")}</span>
              {done && !active && <Check className="size-3 text-emerald-500" />}
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
