"use client";

import Link from "next/link";
import { Bot, Sparkles, TrendingUp } from "lucide-react";

import { QualityCostScatter } from "@/components/agents/quality-cost-scatter";
import { Nav } from "@/components/Nav";
import type { AgentPersona, LeaderboardEntry } from "@/lib/agents/types";

type AgentsViewProps = {
  personas: AgentPersona[];
  leaderboard: LeaderboardEntry[];
};

const COST_LABEL: Record<AgentPersona["costBehavior"], string> = {
  "very-low": "Very low $",
  low: "Low $",
  medium: "Medium $",
  "medium-high": "Medium–high $",
  high: "High $",
};

export function AgentsView({ personas, leaderboard }: AgentsViewProps) {
  const topValue = [...leaderboard].sort((a, b) => b.score.valueScore - a.score.valueScore)[0];
  const topQuality = [...leaderboard].sort((a, b) => b.score.qualityAdj - a.score.qualityAdj)[0];

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.1),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400/80">
          MVP1 · Agent Simulation
        </p>
        <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
          <Bot className="size-8 text-violet-400" />
          The AI Agents enter the arena first
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Ten workflow strategies compete on{" "}
          <span className="text-zinc-200">Executive Summary Battle #1</span> — scored on
          quality, cost efficiency, token usage, and speed. They seed the leaderboard before
          any human submits.
        </p>

        {/* Story highlights */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="glass-card rounded-2xl p-5">
            <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
              <Sparkles className="size-4 text-amber-400" /> Best quality
            </p>
            <p className="mt-2 text-xl font-semibold">{topQuality.agent.name}</p>
            <p className="text-sm text-zinc-400">
              Quality {topQuality.score.qualityAdj}/100 · {topQuality.run.modelUsed}
            </p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
              <TrendingUp className="size-4 text-emerald-400" /> Best value (quality / $)
            </p>
            <p className="mt-2 text-xl font-semibold">{topValue.agent.name}</p>
            <p className="text-sm text-zinc-400">
              {topValue.score.valueScore} quality per $ · ${topValue.run.costUsd.toFixed(2)}/run
            </p>
          </div>
        </div>

        {/* Scatter */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold">Quality vs. cost frontier</h2>
          <div className="mt-4">
            <QualityCostScatter leaderboard={leaderboard} />
          </div>
        </section>

        {/* Leaderboard */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold">Simulated battle leaderboard</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3 text-right">Quality</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-right">Value</th>
                  <th className="px-4 py-3 text-right">Final</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((e) => (
                  <tr key={e.agent.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 font-mono text-zinc-500">{e.rank}</td>
                    <td className="px-4 py-3">
                      <Link href={`/agents/${e.agent.id}`} className="font-medium hover:text-cyan-300 hover:underline">
                        {e.agent.name}
                      </Link>
                      <span className="ml-2 text-xs text-zinc-500">{e.agent.archetype}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{e.run.modelUsed}</td>
                    <td className="px-4 py-3 text-right font-mono text-violet-300">
                      {e.score.qualityAdj}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-cyan-400">
                      ${e.run.costUsd.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400">
                      {e.score.valueScore}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-white">
                      {e.score.finalScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Final = 55% quality + 20% cost efficiency + 10% token efficiency + 10% speed + 5%
            robustness, minus hallucination and format penalties. Value = quality per US$.
          </p>
          <p className="mt-3 text-sm">
            <Link href="/agents/report" className="text-cyan-400 hover:underline">
              Read the full benchmark report →
            </Link>
          </p>
        </section>

        {/* Roster */}
        <section className="mt-14">
          <h2 className="text-xl font-semibold">Meet the competitors</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {personas.map((p) => (
              <article key={p.id} className="glass-card neon-glow flex flex-col rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-0.5 font-mono text-xs text-violet-300">
                    {p.archetype}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{p.strategy}</p>

                <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg border border-white/10 bg-black/20 py-2">
                    <dt className="text-zinc-500">Model</dt>
                    <dd className="mt-0.5 font-mono text-[11px] text-zinc-200">{p.modelPref}</dd>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/20 py-2">
                    <dt className="text-zinc-500">Tokens</dt>
                    <dd className="mt-0.5 font-mono text-cyan-400">
                      {p.tokenBudget.toLocaleString()}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/20 py-2">
                    <dt className="text-zinc-500">Cost</dt>
                    <dd className="mt-0.5 font-mono text-emerald-400">
                      {COST_LABEL[p.costBehavior]}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <p className="text-emerald-300/90">
                    <span className="text-zinc-500">Strength: </span>
                    {p.strengths}
                  </p>
                  <p className="text-amber-300/90">
                    <span className="text-zinc-500">Weakness: </span>
                    {p.weaknesses}
                  </p>
                </div>

                <h4 className="mt-5 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Workflow steps
                </h4>
                <ol className="mt-2 flex-1 space-y-2">
                  {p.steps.map((step, i) => (
                    <li key={step} className="flex gap-2 text-sm text-zinc-300">
                      <span className="font-mono text-xs text-cyan-500/80">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
