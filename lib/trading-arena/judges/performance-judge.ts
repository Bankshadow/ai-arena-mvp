import type { BacktestMetrics } from "@/lib/trading-arena/types";

export function scorePerformance(metrics: BacktestMetrics): {
  score: number;
  notes: string;
} {
  const cagrPts = Math.min(10, Math.max(0, metrics.cagr * 25));
  const sharpePts = Math.min(10, Math.max(0, metrics.sharpe * 5));
  const benchPts = Math.min(8, Math.max(0, (metrics.alpha + 0.05) * 20));
  const consistencyPts = Math.min(7, Math.max(0, metrics.win_rate * 10));
  const score = cagrPts + sharpePts + benchPts + consistencyPts;
  return {
    score: Math.round(score * 10) / 10,
    notes: `CAGR ${(metrics.cagr * 100).toFixed(1)}%, Sharpe ${metrics.sharpe.toFixed(2)}, alpha ${(metrics.alpha * 100).toFixed(1)}%`,
  };
}
