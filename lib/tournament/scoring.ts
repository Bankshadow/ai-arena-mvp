import type { EvaluationScores } from "@/lib/tournament/types";

export const SCORE_WEIGHTS = {
  qualityMax: 60,
  efficiencyMax: 30,
  marketplaceMax: 10,
  totalMax: 100,
} as const;

export function sumQuality(scores: EvaluationScores): number {
  return (
    scores.accuracy +
    scores.completeness +
    scores.structure +
    scores.usefulness +
    scores.formatCompliance
  );
}

export function sumEfficiency(scores: EvaluationScores): number {
  return (
    scores.costEfficiency +
    scores.tokenEfficiency +
    scores.latency +
    scores.workflowSimplicity
  );
}

export function sumMarketplace(scores: EvaluationScores): number {
  return scores.reusability + scores.enterpriseValue + scores.repeatability;
}

export function sumPenalties(scores: EvaluationScores): number {
  return (
    scores.hallucinationPenalty +
    scores.costLimitPenalty +
    scores.missingOutputPenalty +
    scores.badFormattingPenalty
  );
}

export function computeTotalScore(scores: EvaluationScores): number {
  const raw =
    sumQuality(scores) + sumEfficiency(scores) + sumMarketplace(scores) + sumPenalties(scores);
  return Math.max(0, Math.min(SCORE_WEIGHTS.totalMax, Math.round(raw * 10) / 10));
}

export function breakdownEvaluation(scores: EvaluationScores) {
  return {
    qualityScore: sumQuality(scores),
    efficiencyScore: sumEfficiency(scores),
    marketplaceScore: sumMarketplace(scores),
    penaltyTotal: sumPenalties(scores),
    totalScore: computeTotalScore(scores),
  };
}
