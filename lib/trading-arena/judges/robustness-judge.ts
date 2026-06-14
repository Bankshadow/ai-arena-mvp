import type { BacktestMetrics, StrategyRiskReview } from "@/lib/trading-arena/types";

export function scoreRisk(
  metrics: BacktestMetrics,
  review: StrategyRiskReview,
): number {
  const ddPts = review.max_drawdown_ok ? 10 : 3;
  const volPts = Math.min(6, Math.max(0, 6 - metrics.volatility * 10));
  const levPts = review.leverage_ok ? 6 : 2;
  const tailPts = Math.min(4, review.tail_risk_score / 2.5);
  const exitPts = Math.min(4, review.exit_discipline_score / 2.5);
  return Math.round((ddPts + volPts + levPts + tailPts + exitPts) * 10) / 10;
}

export function scoreRobustness(
  metrics: BacktestMetrics,
  penaltyHints: string[],
): number {
  const walkForward = penaltyHints.includes("overfitting_risk") ? 2 : 6;
  const paramSens = penaltyHints.includes("overfitting_risk") ? 2 : 5;
  const costSens = metrics.fees + metrics.slippage < 0.03 ? 4 : 2;
  const regime = metrics.beta < 1.2 ? 3 : 1;
  const simplicity = 2;
  return Math.round((walkForward + paramSens + costSens + regime + simplicity) * 10) / 10;
}

export function scoreImplementation(leanValid: boolean, hasArtifacts: boolean): number {
  const validity = leanValid ? 4 : 0;
  const repro = 3;
  const artifacts = hasArtifacts ? 2 : 1;
  const leakage = leanValid ? 1 : 0;
  return validity + repro + artifacts + leakage;
}

export function scoreCost(llmTokens: number): number {
  if (llmTokens < 3000) return 5;
  if (llmTokens < 6000) return 3;
  return 2;
}
