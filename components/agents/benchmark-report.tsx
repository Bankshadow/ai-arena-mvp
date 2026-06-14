"use client";

import Link from "next/link";
import { FileText, Trophy } from "lucide-react";

import { QualityCostScatter } from "@/components/agents/quality-cost-scatter";
import { Nav } from "@/components/Nav";
import { getAgentLeaderboard } from "@/lib/agents/simulate";
import type { BenchmarkReport } from "@/lib/agents/report";

export function BenchmarkReportView({ report }: { report: BenchmarkReport }) {
  const board = getAgentLeaderboard(report.challengeSlug);

  const superlatives = [
    { label: "Overall winner", entry: report.winner, stat: `${report.winner.score.finalScore} final` },
    { label: "Best quality", entry: report.bestQuality, stat: `${report.bestQuality.score.qualityAdj}/100` },
    { label: "Best value", entry: report.bestValue, stat: `${report.bestValue.score.valueScore} / $` },
    { label: "Cheapest", entry: report.cheapest, stat: `$${report.cheapest.run.costUsd.toFixed(2)}` },
  ];

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.1),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400/80">
          Benchmark Report · Case Study
        </p>
        <h1 className="mt-2 flex items-start gap-3 text-3xl font-semibold sm:text-4xl">
          <FileText className="mt-1 size-8 shrink-0 text-violet-400" />
          {report.headline}
        </h1>
        <p className="mt-3 text-zinc-400">
          {report.fieldSize} AI workflow strategies received the identical 20-page board report
          for Executive Summary Battle #1. Each was scored on quality, cost, tokens, and speed.
        </p>

        {/* superlatives */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {superlatives.map((s) => (
            <Link
              key={s.label}
              href={`/agents/${s.entry.agent.id}`}
              className="glass-card rounded-2xl p-4 transition hover:border-cyan-400/30"
            >
              <p className="text-xs uppercase tracking-wider text-zinc-500">{s.label}</p>
              <p className="mt-1 flex items-center gap-1 text-lg font-semibold">
                {s.label === "Overall winner" && <Trophy className="size-4 text-amber-400" />}
                {s.entry.agent.name}
              </p>
              <p className="font-mono text-sm text-cyan-400">{s.stat}</p>
            </Link>
          ))}
        </div>

        {/* scatter */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold">The quality–cost frontier</h2>
          <div className="mt-4">
            <QualityCostScatter leaderboard={board} />
          </div>
        </section>

        {/* findings */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Key findings</h2>
          <ul className="mt-4 space-y-3">
            {report.findings.map((f, i) => (
              <li key={i} className="glass-card flex gap-3 rounded-xl p-4 text-sm text-zinc-300">
                <span className="font-mono text-cyan-500/80">{i + 1}.</span>
                {f}
              </li>
            ))}
          </ul>
        </section>

        {/* full ranking */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Full ranking</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3 text-right">Quality</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-right">Final</th>
                </tr>
              </thead>
              <tbody>
                {board.map((e) => (
                  <tr key={e.agent.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 font-mono text-zinc-500">{e.rank}</td>
                    <td className="px-4 py-3">
                      <Link href={`/agents/${e.agent.id}`} className="hover:text-cyan-300 hover:underline">
                        {e.agent.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-violet-300">{e.score.qualityAdj}</td>
                    <td className="px-4 py-3 text-right font-mono text-cyan-400">${e.run.costUsd.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-white">{e.score.finalScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/arena"
            className="rounded-xl border border-violet-500/40 bg-violet-500/10 px-5 py-2.5 text-sm font-medium text-violet-200 hover:bg-violet-500/20"
          >
            Think you can beat the AI? Enter the arena
          </Link>
          <Link
            href="/agents"
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
          >
            View the agents
          </Link>
        </div>
      </main>
    </div>
  );
}
