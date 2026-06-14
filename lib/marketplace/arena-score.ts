import type { ArenaScoreBreakdown, ComponentPerformanceProof } from "@/lib/marketplace/types";

function clamp(n: number, min = 0, max = 100): number {
  return Math.round(Math.min(max, Math.max(min, n)));
}

/** Public Arena Score model (0–100 composite). */
export function computeArenaScore(
  proof: ComponentPerformanceProof,
  extras?: { popularity?: number; compatibility?: number },
): ArenaScoreBreakdown {
  const battle = clamp(proof.avg_score);
  const cost_efficiency = clamp(100 - proof.avg_cost_usd * 8000);
  const reliability = clamp(proof.win_rate * 100 * 0.7 + (proof.tournament_runs >= 5 ? 25 : proof.tournament_runs * 5));
  const reusability = clamp(60 + proof.tournament_runs * 2);
  const enterprise_readiness = clamp(proof.avg_score * 0.85 + (proof.best_category.includes("enterprise") ? 15 : 8));
  const popularity = clamp(extras?.popularity ?? 40 + proof.tournament_runs);
  const daysSince = proof.last_tournament_at
    ? (Date.now() - new Date(proof.last_tournament_at).getTime()) / 86400000
    : 30;
  const freshness = clamp(100 - daysSince * 3);
  const compatibility = clamp(extras?.compatibility ?? 75);

  const total = clamp(
    battle * 0.3 +
      cost_efficiency * 0.15 +
      reliability * 0.15 +
      reusability * 0.1 +
      enterprise_readiness * 0.1 +
      popularity * 0.1 +
      freshness * 0.05 +
      compatibility * 0.05,
  );

  return {
    total,
    battle,
    cost_efficiency,
    reliability,
    reusability,
    enterprise_readiness,
    popularity,
    freshness,
    compatibility,
  };
}

export function isTournamentTested(proof: ComponentPerformanceProof): boolean {
  return proof.tournament_runs >= 5;
}
