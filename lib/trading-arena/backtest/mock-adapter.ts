import { seeded } from "@/lib/tournament/engine-mock";
import type { BacktestMetrics, TradingChallenge, TradingStrategy } from "@/lib/trading-arena/types";

export type MockBacktestResult = {
  metrics: Omit<BacktestMetrics, "id" | "backtest_id" | "strategy_id">;
  penalties_hint: string[];
};

/** Deterministic mock metrics from strategy + challenge — no Lean, no market data. */
export function runMockBacktest(
  strategy: TradingStrategy,
  challenge: TradingChallenge,
): MockBacktestResult {
  const seed = strategy.id.length + challenge.id.length;
  const s = (n: number) => seeded(seed + n);

  const sharpe = 0.4 + s(1) * 1.8;
  const max_drawdown = -(0.08 + s(2) * 0.22);
  const total_return = 0.15 + s(3) * 0.9;
  const benchmark_return = 0.2 + s(4) * 0.4;
  const turnover = 2 + s(5) * 10;
  const win_rate = 0.42 + s(6) * 0.18;

  const penalties_hint: string[] = [];
  if (Math.abs(max_drawdown) > challenge.constraints.max_drawdown_pct / 100) {
    penalties_hint.push("excessive_drawdown");
  }
  if (turnover > challenge.constraints.max_turnover_annual) {
    penalties_hint.push("excessive_turnover");
  }
  if (s(7) > 0.85) penalties_hint.push("overfitting_risk");
  if (!strategy.lean_valid) penalties_hint.push("invalid_lean_code");

  return {
    metrics: {
      total_return,
      cagr: total_return / 4.5,
      sharpe,
      sortino: sharpe * 1.15,
      max_drawdown,
      volatility: 0.12 + s(8) * 0.2,
      win_rate,
      profit_factor: 1 + s(9) * 1.2,
      turnover,
      fees: 0.005 + s(10) * 0.02,
      slippage: 0.003 + s(11) * 0.015,
      alpha: total_return - benchmark_return * 0.7,
      beta: 0.5 + s(12) * 0.6,
      benchmark_return,
      trade_count: Math.floor(20 + s(13) * 180),
    },
    penalties_hint,
  };
}
