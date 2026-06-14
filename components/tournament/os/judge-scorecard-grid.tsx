"use client";

import type { AgentRun, Evaluation } from "@/lib/tournament/types";

type Props = {
  evaluations: Evaluation[];
  runs: AgentRun[];
};

function outcome(ev: Evaluation): "pass" | "below_gate" | "fail" {
  if (ev.passed) return "pass";
  if (ev.gateOutcome === "fail") return "fail";
  if (ev.gateOutcome === "below_gate") return "below_gate";
  return ev.totalScore > 0 ? "below_gate" : "fail";
}

const OUTCOME_LABEL = {
  pass: { label: "Passed gate", className: "text-emerald-400 border-emerald-500/30" },
  below_gate: { label: "Below threshold", className: "text-amber-300 border-amber-500/30" },
  fail: { label: "Disqualified", className: "text-red-400 border-red-500/30" },
};

export function JudgeScorecardGrid({ evaluations, runs }: Props) {
  const runById = new Map(runs.map((r) => [r.id, r]));

  if (evaluations.length === 0) {
    return (
      <p className="rounded-xl border border-white/10 bg-black/20 p-8 text-center text-sm text-zinc-600">
        No Judge Evaluations yet — run a tournament loop.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {evaluations.map((ev) => {
        const run = runById.get(ev.runId);
        const bucket = outcome(ev);
        const style = OUTCOME_LABEL[bucket];
        return (
          <article
            key={ev.id}
            className="rounded-xl border border-white/10 bg-black/25 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-zinc-100">{ev.agentName}</p>
                {run && (
                  <p className="mt-0.5 font-mono text-[10px] text-zinc-500">
                    ${run.costUsd.toFixed(3)} · {(run.tokensIn + run.tokensOut).toLocaleString()} tok
                  </p>
                )}
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] ${style.className}`}>
                {style.label}
              </span>
            </div>

            <p className="mt-3 font-mono text-2xl font-semibold text-white">{ev.totalScore.toFixed(1)}</p>

            <div className="mt-3 space-y-2">
              <MiniBar label="Quality" value={ev.qualityScore} max={60} />
              <MiniBar label="Efficiency" value={ev.efficiencyScore} max={30} />
              <MiniBar label="Marketplace" value={ev.marketplaceScore} max={10} />
            </div>

            {(ev.gateFailNote || ev.qualityJudgeNotes) && (
              <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
                {ev.gateFailNote ?? ev.qualityJudgeNotes}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}

function MiniBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-[10px] text-zinc-600">
        <span>{label}</span>
        <span className="font-mono">
          {value.toFixed(0)}/{max}
        </span>
      </div>
      <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-violet-500/80" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
