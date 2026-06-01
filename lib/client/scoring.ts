const COST_LIMIT = 1.0;
const QUALITY_WEIGHT = 0.8;
const COST_WEIGHT = 0.2;

export function computeCostScore(estimatedCostUsd: number): number {
  if (estimatedCostUsd >= COST_LIMIT) return 0;
  return Math.max(0, Math.round(100 * (1 - estimatedCostUsd / COST_LIMIT)));
}

/** Demo quality heuristic until AI Judge / review (checks required sections). */
export function estimateQualityScore(output: string): number {
  const text = output.toLowerCase();
  let score = 55;
  if (text.includes("executive summary") || text.length > 200) score += 15;
  if (text.includes("risk")) score += 10;
  if (text.includes("recommend")) score += 10;
  if (output.length > 500) score += 5;
  if (output.length > 1000) score += 5;
  return Math.min(98, Math.max(60, score));
}

export function computeFinalScore(qualityScore: number, costScore: number): number {
  const final = qualityScore * QUALITY_WEIGHT + costScore * COST_WEIGHT;
  return Math.round(final * 10) / 10;
}

export { COST_LIMIT };
