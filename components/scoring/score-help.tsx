"use client";

import { HelpCircle } from "lucide-react";

import {
  getScoringSystem,
  type ScoringSystemId,
} from "@/lib/coherence/scoring-labels";
import { cn } from "@/lib/utils";

type Props = {
  system: ScoringSystemId;
  className?: string;
  showLabel?: boolean;
};

export function ScoreHelp({ system, className, showLabel = true }: Props) {
  const s = getScoringSystem(system);
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-xs text-zinc-500", className)}
      title={s.help}
    >
      {showLabel && <span className="text-zinc-400">{s.label}:</span>}
      <span className="font-mono text-cyan-300/90">{s.formula}</span>
      <HelpCircle className="size-3.5 shrink-0 text-zinc-600" aria-hidden />
    </span>
  );
}

export function ScoreHelpBadge({ system }: { system: ScoringSystemId }) {
  const s = getScoringSystem(system);
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-2 py-0.5 text-[10px] text-cyan-200/90"
      title={s.help}
    >
      {s.formula}
      <HelpCircle className="size-3" aria-hidden />
    </span>
  );
}
