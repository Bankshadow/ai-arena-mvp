import {
  PENALTY_POINTS,
  type StrategyPenaltyCode,
  type StrategyScoreBreakdown,
} from "@/lib/trading-arena/types";

export function applyPenalties(codes: StrategyPenaltyCode[]): number {
  return codes.reduce((sum, c) => sum + PENALTY_POINTS[c], 0);
}

export function finalizeScore(breakdown: Omit<StrategyScoreBreakdown, "total">): StrategyScoreBreakdown {
  const raw =
    breakdown.performance +
    breakdown.risk +
    breakdown.robustness +
    breakdown.implementation +
    breakdown.cost;
  const total = Math.max(0, Math.min(100, Math.round((raw - breakdown.penalties) * 10) / 10));
  return { ...breakdown, total };
}

export function rankScores<T extends { breakdown: StrategyScoreBreakdown }>(items: T[]): T[] {
  return [...items]
    .sort((a, b) => b.breakdown.total - a.breakdown.total)
    .map((item, i) => ({
      ...item,
      rank: i + 1,
    })) as T[];
}
