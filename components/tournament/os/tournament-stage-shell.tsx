"use client";

import type { ReactNode } from "react";

import { useTranslations } from "@/components/i18n/locale-provider";

import { PHASE_ACCENTS, phaseAnchorId, type TournamentPhase } from "./types";

type Props = {
  phase: TournamentPhase;
  children: ReactNode;
  action?: ReactNode;
};

export function TournamentStageShell({ phase, children, action }: Props) {
  const os = useTranslations().tournament.os;
  const stage = os.stages[phase];
  const accent = PHASE_ACCENTS[phase];

  return (
    <section
      id={phaseAnchorId(phase)}
      className={`scroll-mt-44 rounded-2xl border ${accent.border} bg-gradient-to-b ${accent.bg} to-transparent`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div>
          <p className={`font-mono text-[10px] uppercase tracking-[0.2em] ${accent.text}`}>
            {stage.eyebrow}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">{stage.title}</h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-400 sm:text-sm">{stage.subtitle}</p>
        </div>
        {action}
      </header>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}
