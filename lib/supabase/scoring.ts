const QUALITY_WEIGHT = 0.8;
const COST_WEIGHT = 0.2;

/** MVP cost score tiers (Challenge #1). */
export function computeCostScore(estimatedCost: number): number {
  if (estimatedCost > 1.0) return 0;
  if (estimatedCost <= 0.1) return 100;
  if (estimatedCost <= 0.25) return 90;
  if (estimatedCost <= 0.5) return 80;
  return 70;
}

export function computeFinalScore(qualityScore: number, costScore: number): number {
  const raw = qualityScore * QUALITY_WEIGHT + costScore * COST_WEIGHT;
  return Math.round(raw * 10) / 10;
}
