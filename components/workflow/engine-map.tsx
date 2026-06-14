"use client";

import { ArrowRight } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";

type Props = {
  sectionNumber?: number;
};

export function EngineMap({ sectionNumber = 13 }: Props) {
  const e = useTranslations().workflow.engineMap;
  const engines = e.engines;

  return (
    <section className="glass-card overflow-hidden rounded-2xl border border-violet-500/20">
      <div className="border-b border-white/10 bg-gradient-to-r from-violet-500/10 to-cyan-500/5 px-5 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          {sectionNumber} · {e.title}
        </h3>
        <p className="mt-1 text-xs text-zinc-500">{e.subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 p-6 sm:gap-3">
        {engines.map((engine, i) => (
          <div key={engine.id} className="flex items-center gap-2">
            <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-center">
              <p className="font-mono text-[10px] uppercase text-violet-400/80">{engine.id.replace("_", " ")}</p>
              <p className="mt-1 text-xs font-medium text-zinc-200">{engine.label}</p>
            </div>
            {i < engines.length - 1 && (
              <ArrowRight className="size-4 shrink-0 text-zinc-600" aria-hidden />
            )}
          </div>
        ))}
      </div>
      <p className="border-t border-white/10 px-5 py-3 text-center font-mono text-[10px] text-zinc-600">
        Tournament → Battle → Evaluation → Memory → Marketplace → Stack Builder
      </p>
    </section>
  );
}

export default EngineMap;
