"use client";

import Link from "next/link";
import { Play, TrendingUp } from "lucide-react";

import { BacktestMetricsGrid } from "@/components/trading-arena/backtest-metrics-grid";
import { TradingDisclaimerBanner } from "@/components/trading-arena/disclaimer-banner";
import { RiskAnalysisPanel } from "@/components/trading-arena/risk-analysis-panel";
import { TradingArenaShell } from "@/components/trading-arena/trading-arena-shell";
import { useTradingArena } from "@/components/trading-arena/trading-arena-provider";
import { getTradingChallenge } from "@/lib/trading-arena/registry/mock-challenges";
import { PENALTY_LABELS, STRATEGY_AGENT_ROLE_LABELS } from "@/lib/trading-arena/types";

export function TradingArenaView() {
  const { data, runRound, selectChallenge, busy } = useTradingArena();
  const challenge =
    getTradingChallenge(data.state.current_challenge_id) ?? data.challenges[0];
  const latestStrategies = data.strategies.slice(0, 3);
  const topScore = data.scores[0];
  const topMetrics = topScore
    ? data.metrics.find((m) => m.strategy_id === topScore.strategy_id)
    : null;
  const topRisk = topScore
    ? data.risk_reviews.find((r) => r.strategy_id === topScore.strategy_id)
    : null;
  const topStrategy = topScore
    ? data.strategies.find((s) => s.id === topScore.strategy_id)
    : null;

  return (
    <TradingArenaShell
      title="Trading desk control room"
      subtitle="AI agents design, code, and evaluate strategies with simulated Lean backtests — research only."
    >
      <TradingDisclaimerBanner />

      {/* 1. Status */}
      <section className="glass-card rounded-2xl border border-amber-500/20 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase text-zinc-500">Trading Arena status</p>
            <p className="mt-1 text-lg">
              Round {data.state.round} · Phase{" "}
              <span className="text-emerald-300">{data.state.phase}</span>
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              Backtest runner: mock (simulated) · Lean CLI not connected
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={runRound}
            className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/15 px-4 py-2 text-sm font-medium text-amber-100 disabled:opacity-50"
          >
            <Play className="size-4" />
            {busy ? "Running…" : "Run Trading Arena round"}
          </button>
        </div>
      </section>

      {/* 2. Challenge */}
      {challenge && (
        <section className="glass-card rounded-2xl p-5">
          <p className="text-xs uppercase text-zinc-500">Current trading challenge</p>
          <h2 className="mt-2 text-lg font-semibold">{challenge.title}</h2>
          <p className="mt-2 text-sm text-zinc-400">{challenge.brief}</p>
          <p className="mt-2 text-xs text-zinc-600">
            {challenge.universe.join(", ")} · {challenge.resolution} · max DD{" "}
            {challenge.constraints.max_drawdown_pct}%
          </p>
          <select
            className="mt-4 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            value={data.state.current_challenge_id}
            onChange={(e) => selectChallenge(e.target.value)}
          >
            {data.challenges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </section>
      )}

      {/* 3. Agent pipeline */}
      <section className="glass-card rounded-2xl p-5">
        <p className="text-xs uppercase text-zinc-500">Strategy agent pipeline</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {data.agents.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-sm"
            >
              <p className="font-medium text-zinc-200">{a.name}</p>
              <p className="text-[10px] uppercase text-amber-400/80">
                {STRATEGY_AGENT_ROLE_LABELS[a.role]}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 4. Specs */}
        <section className="glass-card rounded-2xl p-5">
          <p className="text-xs uppercase text-zinc-500">Generated strategy specs</p>
          {latestStrategies.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-600">Run a round to generate specs.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {latestStrategies.map((s) => (
                <li key={s.id} className="rounded-lg border border-white/5 p-3">
                  <Link href={`/trading-arena/strategies/${s.id}`} className="font-medium text-zinc-200 hover:text-amber-300">
                    {s.spec.title}
                  </Link>
                  <p className="mt-1 text-xs text-zinc-500">{s.agent_name}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 5. Lean code preview */}
        <section className="glass-card rounded-2xl p-5">
          <p className="text-xs uppercase text-zinc-500">Lean code preview</p>
          {topStrategy ? (
            <pre className="mt-4 max-h-48 overflow-auto rounded-lg bg-black/40 p-3 font-mono text-[11px] text-emerald-200/90">
              {topStrategy.lean_code.slice(0, 600)}…
            </pre>
          ) : (
            <p className="mt-4 text-sm text-zinc-600">No code yet.</p>
          )}
        </section>
      </div>

      {/* 6. Backtest status */}
      <section className="glass-card rounded-2xl p-5">
        <p className="text-xs uppercase text-zinc-500">Mock backtest status</p>
        {data.backtests[0] ? (
          <p className="mt-2 text-sm text-zinc-300">
            Latest: <span className="text-amber-300">{data.backtests[0].status}</span>
            {data.backtests[0].simulated && (
              <span className="ml-2 rounded bg-amber-500/15 px-2 py-0.5 text-xs text-amber-200">
                Simulated
              </span>
            )}
          </p>
        ) : (
          <p className="mt-2 text-sm text-zinc-600">No backtests yet.</p>
        )}
      </section>

      {/* 7. Metrics */}
      {topMetrics && (
        <section className="glass-card rounded-2xl p-5">
          <p className="flex items-center gap-2 text-xs uppercase text-zinc-500">
            <TrendingUp className="size-4 text-emerald-400" /> Backtest metrics (simulated)
          </p>
          <div className="mt-4">
            <BacktestMetricsGrid metrics={topMetrics} />
          </div>
        </section>
      )}

      {/* 8. Risk */}
      {topRisk && (
        <section className="glass-card rounded-2xl border border-red-500/10 p-5">
          <p className="text-xs uppercase text-zinc-500">Risk analysis</p>
          <div className="mt-4">
            <RiskAnalysisPanel review={topRisk} />
          </div>
        </section>
      )}

      {/* 9. Leaderboard snippet */}
      <section className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase text-zinc-500">Strategy leaderboard</p>
          <Link href="/trading-arena/leaderboard" className="text-xs text-amber-400 hover:underline">
            Full leaderboard →
          </Link>
        </div>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-zinc-600">
              <th className="pb-2">#</th>
              <th className="pb-2">Agent</th>
              <th className="pb-2">Score</th>
              <th className="pb-2">Sharpe</th>
            </tr>
          </thead>
          <tbody>
            {data.scores.slice(0, 5).map((s) => {
              const m = data.metrics.find((x) => x.strategy_id === s.strategy_id);
              return (
                <tr key={s.id} className="border-t border-white/5">
                  <td className="py-2 font-mono text-zinc-500">{s.rank}</td>
                  <td className="py-2">{s.agent_name}</td>
                  <td className="py-2 font-mono text-amber-300">{s.breakdown.total.toFixed(1)}</td>
                  <td className="py-2 font-mono">{m?.sharpe.toFixed(2) ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* 10. Marketplace candidates */}
      <section className="glass-card rounded-2xl border border-emerald-500/15 p-5">
        <p className="text-xs uppercase text-zinc-500">Strategy marketplace candidates</p>
        {data.marketplace_candidates.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600">Run a round to seed candidates.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {data.marketplace_candidates.slice(0, 3).map((c) => (
              <li key={c.id} className="flex flex-wrap justify-between gap-2 rounded-lg border border-white/5 p-3">
                <div>
                  <Link href={`/marketplace/strategies#${c.listing_slug}`} className="font-medium text-zinc-200 hover:text-emerald-300">
                    {c.title}
                  </Link>
                  <p className="text-xs text-zinc-500">{c.backtest_evidence_summary}</p>
                </div>
                <span className="font-mono text-emerald-300">{c.arena_score.toFixed(1)}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/marketplace/strategies" className="mt-4 inline-block text-sm text-emerald-400 hover:underline">
          Browse strategy marketplace →
        </Link>
      </section>

      {topScore && topScore.penalties.length > 0 && (
        <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-xs uppercase text-red-300/80">Penalties applied</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {topScore.penalties.map((p) => (
              <li key={p} className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-200">
                {PENALTY_LABELS[p]}
              </li>
            ))}
          </ul>
        </section>
      )}
    </TradingArenaShell>
  );
}
