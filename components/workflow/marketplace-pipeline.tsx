"use client";

import { ArrowRight } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";

type Props = {
  /** 0–5 active stage index for demo highlight */
  activeStage?: number;
  compact?: boolean;
};

export function MarketplacePipeline({ activeStage = 4, compact }: Props) {
  const p = useTranslations().workflow.pipeline;

  return (
    <section
      className={`rounded-xl border border-emerald-500/15 bg-black/20 ${compact ? "p-3" : "glass-card rounded-2xl p-5"}`}
    >
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/90">
        {p.title}
      </h3>
      <ol
        className={`mt-3 ${
          compact
            ? "flex flex-col gap-1.5"
            : "flex flex-wrap items-center gap-x-1 gap-y-2"
        }`}
      >
        {p.stages.map((stage, i) => {
          const active = i <= activeStage;
          const current = i === activeStage;
          return (
            <li
              key={stage.id}
              className={compact ? "flex min-w-0 items-center gap-1.5" : "flex items-center gap-1"}
            >
              <span
                className={`block min-w-0 rounded-md border px-2 py-1 text-[9px] font-medium uppercase leading-tight tracking-wide sm:text-[10px] ${
                  current
                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
                    : active
                      ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-300/80"
                      : "border-white/10 bg-black/20 text-zinc-600"
                }`}
              >
                {stage.label}
              </span>
              {i < p.stages.length - 1 && (
                <ArrowRight
                  className={`size-3 shrink-0 text-zinc-700 ${compact ? "rotate-90 sm:rotate-0" : ""}`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
