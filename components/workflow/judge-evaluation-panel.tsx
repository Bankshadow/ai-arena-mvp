"use client";

import { useTranslations } from "@/components/i18n/locale-provider";
import type { Evaluation } from "@/lib/tournament/types";

type Props = {
  evaluations: Evaluation[];
  embedded?: boolean;
};

function outcomeBucket(ev: Evaluation): "pass" | "below_gate" | "fail" {
  if (ev.passed) return "pass";
  if (ev.gateOutcome === "fail") return "fail";
  if (ev.gateOutcome === "below_gate") return "below_gate";
  return ev.totalScore > 0 ? "below_gate" : "fail";
}

export function JudgeEvaluationPanel({ evaluations, embedded }: Props) {
  const j = useTranslations().workflow.judgeEval;

  const passed = evaluations.filter((e) => e.passed).length;
  const below = evaluations.filter((e) => outcomeBucket(e) === "below_gate").length;
  const fail = evaluations.filter((e) => outcomeBucket(e) === "fail").length;
  const avg =
    evaluations.length > 0
      ? evaluations.reduce((s, e) => s + e.totalScore, 0) / evaluations.length
      : 0;

  return (
    <section
      className={
        embedded
          ? "rounded-xl border border-white/10 bg-black/20"
          : "glass-card overflow-hidden rounded-2xl border border-violet-500/20"
      }
    >
      {!embedded && (
        <div className="border-b border-white/10 bg-gradient-to-r from-violet-500/10 to-transparent px-5 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            7 · {j.title}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">{j.subtitle}</p>
        </div>
      )}
      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label={j.passed} value={String(passed)} accent="text-emerald-400" />
        <Stat label={j.belowGate} value={String(below)} accent="text-amber-300" />
        <Stat label={j.disqualified} value={String(fail)} accent="text-red-400" />
        <Stat label={j.avgScore} value={avg.toFixed(1)} accent="text-white" />
        <Stat label="Runs scored" value={String(evaluations.length)} accent="text-cyan-300" />
      </div>
      <div className="border-t border-white/10 px-5 py-3">
        <p className="font-mono text-[10px] text-zinc-500">
          {j.quality} + {j.efficiency} · Agent score = Quality 60 + Efficiency 30 + Marketplace 10 − Penalties
        </p>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
      <p className="text-[10px] uppercase text-zinc-600">{label}</p>
      <p className={`mt-1 font-mono text-xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
