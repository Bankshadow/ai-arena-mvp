/**
 * Cost efficiency: 100 at $0 spend, 0 at or above cost limit.
 */
export function computeCostEfficiencyScore(
  estimatedCostUsd: number,
  costLimitUsd: number
): number {
  if (costLimitUsd <= 0) return 0;
  const ratio = estimatedCostUsd / costLimitUsd;
  return Math.max(0, Math.round(100 * (1 - ratio)));
}

export function computeFinalScore(
  qualityScore: number,
  costEfficiencyScore: number,
  qualityWeight: number,
  costWeight: number
): number {
  const final =
    qualityScore * qualityWeight + costEfficiencyScore * costWeight;
  return Math.round(final * 100) / 100;
}

export function parseWeight(value: string): number {
  return parseFloat(value);
}
