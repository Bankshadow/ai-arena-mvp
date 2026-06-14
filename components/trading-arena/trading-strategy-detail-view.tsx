"use client";

import { TradingArenaShell } from "@/components/trading-arena/trading-arena-shell";
import { BacktestMetricsGrid } from "@/components/trading-arena/backtest-metrics-grid";
import { TradingDisclaimerBanner } from "@/components/trading-arena/disclaimer-banner";
import { RiskAnalysisPanel } from "@/components/trading-arena/risk-analysis-panel";
import { useTradingArena } from "@/components/trading-arena/trading-arena-provider";
import { PENALTY_LABELS } from "@/lib/trading-arena/types";
import type { TradingStrategy } from "@/lib/trading-arena/types";

export function TradingStrategyDetailView({ strategy }: { strategy: TradingStrategy }) {
  const { data } = useTradingArena();
  const score = data.scores.find((s) => s.strategy_id === strategy.id);
  const metrics = data.metrics.find((m) => m.strategy_id === strategy.id);
  const risk = data.risk_reviews.find((r) => r.strategy_id === strategy.id);
  const backtest = data.backtests.find((b) => b.strategy_id === strategy.id);

  return (
    <TradingArenaShell title={strategy.spec.title} subtitle={strategy.agent_name}>
      <TradingDisclaimerBanner />

      <section className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold uppercase text-zinc-500">Strategy spec</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <SpecRow label="Thesis" value={strategy.spec.thesis} />
          <SpecRow label="Universe" value={strategy.spec.universe.join(", ")} />
          <SpecRow label="Benchmark" value={strategy.spec.benchmark} />
          <SpecRow label="Resolution" value={strategy.spec.resolution} />
          <SpecRow label="Entry" value={strategy.spec.entry_rules.join("; ")} />
          <SpecRow label="Exit" value={strategy.spec.exit_rules.join("; ")} />
          <SpecRow label="Sizing" value={strategy.spec.position_sizing} />
          <SpecRow label="Rebalance" value={strategy.spec.rebalance_frequency} />
        </dl>
      </section>

      <section className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold uppercase text-zinc-500">Lean code preview</h2>
        <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-black/40 p-4 font-mono text-xs text-emerald-200/90">
          {strategy.lean_code}
        </pre>
        <p className="mt-2 text-xs text-zinc-600">
          Valid Lean template: {strategy.lean_valid ? "Yes (heuristic)" : "No"} · Not executed on Lean engine
        </p>
      </section>

      {backtest && (
        <p className="text-sm text-zinc-400">
          Backtest: {backtest.status} · {backtest.simulated ? "Simulated metrics" : "Live"}
        </p>
      )}

      {metrics && (
        <section className="glass-card rounded-2xl p-5">
          <h2 className="text-sm font-semibold uppercase text-zinc-500">Backtest metrics (simulated)</h2>
          <div className="mt-4">
            <BacktestMetricsGrid metrics={metrics} />
          </div>
        </section>
      )}

      {risk && (
        <section className="glass-card rounded-2xl p-5">
          <h2 className="text-sm font-semibold uppercase text-zinc-500">Risk analysis</h2>
          <div className="mt-4">
            <RiskAnalysisPanel review={risk} />
          </div>
        </section>
      )}

      {score && (
        <section className="glass-card rounded-2xl p-5">
          <h2 className="text-sm font-semibold uppercase text-zinc-500">Score breakdown</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {(
              [
                ["Performance", score.breakdown.performance, 35],
                ["Risk", score.breakdown.risk, 30],
                ["Robustness", score.breakdown.robustness, 20],
                ["Implementation", score.breakdown.implementation, 10],
                ["Cost", score.breakdown.cost, 5],
              ] as const
            ).map(([label, val, max]) => (
              <div key={label} className="rounded-lg bg-black/20 px-3 py-2 text-center">
                <p className="text-[10px] text-zinc-600">{label}</p>
                <p className="font-mono text-lg text-amber-300">
                  {val}/{max}
                </p>
              </div>
            ))}
            <div className="rounded-lg bg-amber-500/10 px-3 py-2 text-center">
              <p className="text-[10px] text-zinc-600">Total</p>
              <p className="font-mono text-lg text-amber-100">{score.breakdown.total}</p>
            </div>
          </div>
          {score.penalties.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {score.penalties.map((p) => (
                <li key={p} className="text-xs text-red-300">
                  {PENALTY_LABELS[p]}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </TradingArenaShell>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-zinc-600">{label}</dt>
      <dd className="text-zinc-300">{value}</dd>
    </div>
  );
}
