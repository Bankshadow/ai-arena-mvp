"use client";

import Link from "next/link";
import { ArrowLeft, Swords } from "lucide-react";

import { Nav } from "@/components/Nav";
import { RUBRIC_MAX } from "@/lib/agents/scoring";
import type { LeaderboardEntry } from "@/lib/agents/types";

const RUBRIC_ROWS: { key: keyof typeof RUBRIC_MAX; label: string }[] = [
  { key: "accuracy", label: "Accuracy" },
  { key: "completeness", label: "Completeness" },
  { key: "structure", label: "Structure" },
  { key: "riskId", label: "Risk identification" },
  { key: "recommendation", label: "Recommendation usefulness" },
];

function Bar({ value, max }: { value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function AgentDetail({ entry }: { entry: LeaderboardEntry }) {
  const { agent, run, score } = entry;
  const totalTokens = run.tokensIn + run.tokensOut;

  const metrics = [
    { label: "Final score", value: score.finalScore, accent: "text-white" },
    { label: "Quality (adj)", value: score.qualityAdj, accent: "text-violet-300" },
    { label: "Value (quality/$)", value: score.valueScore, accent: "text-emerald-400" },
    { label: "Rank", value: `#${entry.rank}`, accent: "text-cyan-300" },
  ];

  const efficiency = [
    { label: "Cost efficiency", value: score.costEff },
    { label: "Token efficiency", value: score.tokenEff },
    { label: "Speed efficiency", value: score.speedEff },
    { label: "Robustness", value: score.robustness },
  ];

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.1),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6">
        <Link href="/agents" className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="size-4" /> All agents
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold sm:text-4xl">{agent.name}</h1>
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-0.5 font-mono text-xs text-violet-300">
            {agent.archetype}
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-zinc-400">{agent.strategy}</p>
        <p className="mt-1 font-mono text-xs text-zinc-500">
          Executive Summary Battle #1 · {run.modelUsed}
        </p>

        {/* headline metrics */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className="glass-card rounded-2xl p-5 text-center">
              <p className="text-xs uppercase tracking-wider text-zinc-500">{m.label}</p>
              <p className={`mt-2 font-mono text-2xl font-semibold ${m.accent}`}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {/* rubric breakdown */}
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Quality rubric (/80)</h2>
            <div className="mt-4 space-y-4">
              {RUBRIC_ROWS.map((row) => (
                <div key={row.key}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-zinc-300">{row.label}</span>
                    <span className="font-mono text-zinc-400">
                      {run.rubric[row.key]} / {RUBRIC_MAX[row.key]}
                    </span>
                  </div>
                  <Bar value={run.rubric[row.key]} max={RUBRIC_MAX[row.key]} />
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1 border-t border-white/10 pt-4 text-sm">
              <p className="flex justify-between text-amber-300/90">
                <span>Hallucination penalty</span>
                <span className="font-mono">−{run.hallucinationPenalty}</span>
              </p>
              <p className="flex justify-between text-amber-300/90">
                <span>Format penalty</span>
                <span className="font-mono">−{run.formatPenalty}</span>
              </p>
              <p className="flex justify-between font-medium text-violet-300">
                <span>Quality (adjusted)</span>
                <span className="font-mono">{score.qualityAdj} / 100</span>
              </p>
            </div>
          </section>

          {/* efficiency + usage */}
          <section className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold">Efficiency (normalized)</h2>
              <div className="mt-4 space-y-4">
                {efficiency.map((m) => (
                  <div key={m.label}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-zinc-300">{m.label}</span>
                      <span className="font-mono text-zinc-400">{m.value} / 100</span>
                    </div>
                    <Bar value={m.value} max={100} />
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold">Run usage</h2>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <dt className="text-zinc-500">Cost</dt>
                  <dd className="mt-0.5 font-mono text-cyan-400">${run.costUsd.toFixed(2)}</dd>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <dt className="text-zinc-500">Latency</dt>
                  <dd className="mt-0.5 font-mono text-zinc-200">{(run.latencyMs / 1000).toFixed(1)}s</dd>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <dt className="text-zinc-500">Tokens in / out</dt>
                  <dd className="mt-0.5 font-mono text-zinc-200">
                    {run.tokensIn.toLocaleString()} / {run.tokensOut.toLocaleString()}
                  </dd>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <dt className="text-zinc-500">Total tokens</dt>
                  <dd className="mt-0.5 font-mono text-zinc-200">{totalTokens.toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </section>
        </div>

        {/* output preview + steps */}
        <section className="mt-8 glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Output preview</h2>
          <p className="mt-2 text-sm italic text-zinc-400">“{run.outputPreview}”</p>
          <h3 className="mt-5 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Workflow steps
          </h3>
          <ol className="mt-2 space-y-2">
            {agent.steps.map((step, i) => (
              <li key={step} className="flex gap-2 text-sm text-zinc-300">
                <span className="font-mono text-xs text-cyan-500/80">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/arena"
            className="inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-5 py-2.5 text-sm font-medium text-violet-200 hover:bg-violet-500/20"
          >
            <Swords className="size-4" /> Beat this Agent
          </Link>
          <Link
            href="/agents"
            className="inline-flex items-center rounded-xl border border-white/10 px-5 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
          >
            Back to leaderboard
          </Link>
        </div>
      </main>
    </div>
  );
}
