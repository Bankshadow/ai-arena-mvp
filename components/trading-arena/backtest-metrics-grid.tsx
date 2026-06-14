import type { BacktestMetrics } from "@/lib/trading-arena/types";

const METRIC_ROWS: { key: keyof BacktestMetrics; label: string; format: (v: number) => string }[] = [
  { key: "total_return", label: "Total return", format: (v) => `${(v * 100).toFixed(1)}%` },
  { key: "cagr", label: "CAGR", format: (v) => `${(v * 100).toFixed(1)}%` },
  { key: "sharpe", label: "Sharpe", format: (v) => v.toFixed(2) },
  { key: "sortino", label: "Sortino", format: (v) => v.toFixed(2) },
  { key: "max_drawdown", label: "Max drawdown", format: (v) => `${(v * 100).toFixed(1)}%` },
  { key: "volatility", label: "Volatility", format: (v) => `${(v * 100).toFixed(1)}%` },
  { key: "win_rate", label: "Win rate", format: (v) => `${(v * 100).toFixed(0)}%` },
  { key: "profit_factor", label: "Profit factor", format: (v) => v.toFixed(2) },
  { key: "turnover", label: "Turnover", format: (v) => v.toFixed(1) },
  { key: "alpha", label: "Alpha", format: (v) => `${(v * 100).toFixed(1)}%` },
  { key: "beta", label: "Beta", format: (v) => v.toFixed(2) },
  { key: "benchmark_return", label: "Benchmark", format: (v) => `${(v * 100).toFixed(1)}%` },
];

export function BacktestMetricsGrid({ metrics }: { metrics: BacktestMetrics }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {METRIC_ROWS.map(({ key, label, format }) => (
        <div key={key} className="rounded-xl border border-white/5 bg-black/20 px-3 py-2">
          <p className="text-[10px] uppercase text-zinc-600">{label}</p>
          <p className="font-mono text-lg text-emerald-300">{format(metrics[key] as number)}</p>
        </div>
      ))}
      <div className="rounded-xl border border-white/5 bg-black/20 px-3 py-2">
        <p className="text-[10px] uppercase text-zinc-600">Fees + slippage</p>
        <p className="font-mono text-lg text-zinc-300">
          {((metrics.fees + metrics.slippage) * 100).toFixed(2)}%
        </p>
      </div>
    </div>
  );
}
