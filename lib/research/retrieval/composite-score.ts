/** Weighted evidence ranking — same formula for mock and future vector backends. */
export function computeCompositeScore(
  relevance: number,
  confidence: number,
  freshness: number,
  reliability: number,
): number {
  const score = 0.35 * relevance + 0.25 * confidence + 0.2 * freshness + 0.2 * reliability;
  return Math.round(score * 1000) / 1000;
}
