import type { BacktestMetrics, StrategyRiskReview, TradingChallenge } from "@/lib/trading-arena/types";

export function runRiskReview(
  strategyId: string,
  backtestId: string,
  metrics: BacktestMetrics,
  challenge: TradingChallenge,
): StrategyRiskReview {
  const max_drawdown_ok =
    Math.abs(metrics.max_drawdown) <= challenge.constraints.max_drawdown_pct / 100;
  const leverage_ok = true;
  const tail_risk_score = max_drawdown_ok ? 7 + metrics.sharpe : 4;
  const exit_discipline_score = metrics.win_rate > 0.45 ? 8 : 5;

  const findings: string[] = [];
  if (!max_drawdown_ok) findings.push("Max drawdown exceeds challenge constraint.");
  if (metrics.volatility > 0.35) findings.push("Elevated volatility vs equity baseline.");
  if (metrics.turnover > challenge.constraints.max_turnover_annual) {
    findings.push("Turnover above annual cap — cost drag risk.");
  }

  return {
    id: `risk-${strategyId}`,
    strategy_id: strategyId,
    backtest_id: backtestId,
    max_drawdown_ok,
    leverage_ok,
    tail_risk_score,
    exit_discipline_score,
    summary: max_drawdown_ok
      ? "Risk profile within challenge constraints (simulated)."
      : "Drawdown breach flagged — penalty applied.",
    findings,
  };
}
