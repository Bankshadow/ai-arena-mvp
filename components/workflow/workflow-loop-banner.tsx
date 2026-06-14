"use client";

import { useTranslations } from "@/components/i18n/locale-provider";

export function WorkflowLoopBanner() {
  const w = useTranslations().workflow;

  const phases = [
    { label: "Challenge", color: "border-amber-500/40 bg-amber-500/10 text-amber-200" },
    { label: "Battle", color: "border-cyan-500/40 bg-cyan-500/10 text-cyan-200" },
    { label: "Score", color: "border-violet-500/40 bg-violet-500/10 text-violet-200" },
    { label: "Learn", color: "border-blue-500/40 bg-blue-500/10 text-blue-200" },
    { label: "Marketplace", color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" },
  ];

  return (
    <div className="glass-card rounded-2xl border border-violet-500/20 px-5 py-4">
      <p className="text-center font-mono text-xs text-zinc-500">{w.tagline}</p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {phases.map((phase, i) => (
          <span key={phase.label} className="flex items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${phase.color}`}
            >
              {phase.label}
            </span>
            {i < phases.length - 1 && <span className="text-zinc-700">→</span>}
          </span>
        ))}
      </div>
      <p className="mt-3 text-center font-mono text-[10px] text-zinc-600">{w.loopLong}</p>
    </div>
  );
}
