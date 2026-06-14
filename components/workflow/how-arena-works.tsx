"use client";

import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Package,
  Scale,
  Sparkles,
  Swords,
  type LucideIcon,
} from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";

const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  swords: Swords,
  scale: Scale,
  brain: Brain,
  package: Package,
};

type Props = {
  compact?: boolean;
  showTitle?: boolean;
};

export function HowArenaWorksSection({ compact, showTitle = true }: Props) {
  const w = useTranslations().workflow;

  return (
    <section className={compact ? "" : "border-t border-white/[0.06] px-6 py-20"}>
      <div className={compact ? "" : "mx-auto max-w-6xl"}>
        {showTitle && (
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400/90">
              {w.howItWorks.label}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              {w.howItWorks.title}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400">{w.howItWorks.subtitle}</p>
            <p className="mt-4 font-mono text-[11px] text-cyan-400/80">{w.loopShort}</p>
          </div>
        )}

        <div
          className={`grid gap-4 ${showTitle ? "mt-12" : ""} sm:grid-cols-2 lg:grid-cols-5`}
        >
          {w.steps.map((step, i) => {
            const Icon = ICONS[step.icon] ?? Sparkles;
            return (
              <div
                key={step.id}
                className="group relative flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition hover:border-violet-500/30 hover:bg-violet-500/5"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10">
                    <Icon className="size-4 text-violet-300" />
                  </span>
                  <span className="font-mono text-xs text-zinc-600">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-4 text-sm font-semibold leading-snug text-zinc-100">{step.title}</h3>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-zinc-500">{step.description}</p>
                <p className="mt-3 font-mono text-[10px] text-emerald-400/90">{step.metric}</p>
                <Link
                  href={step.href}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300"
                >
                  {step.cta}
                  <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
