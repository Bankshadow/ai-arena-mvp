import type { AgentRun, AgentScore, RubricScores } from "@/lib/agents/types";

/**
 * Composite weighting. Quality dominates; efficiency is the rest.
 * Easy to explain: 55% how good it is, 40% how efficiently it was produced,
 * 5% how consistent it is — minus penalties.
 */
export const COMPOSITE_WEIGHTS = {
  quality: 0.55,
  costEff: 0.2,
  tokenEff: 0.1,
  speedEff: 0.1,
  robustness: 0.05,
} as const;

/** Max points per rubric dimension (cost efficiency is computed separately). */
export const RUBRIC_MAX = {
  accuracy: 25,
  completeness: 20,
  structure: 15,
  riskId: 10,
  recommendation: 10,
} as const;

/** Sum of the qualitative rubric (everything except cost efficiency) = 80. */
export const QUALITY_MAX = 80;

export function sumRubric(r: RubricScores): number {
  return r.accuracy + r.completeness + r.structure + r.riskId + r.recommendation;
}

/** quality on a 0..100 scale after subtracting hallucination + format penalties. */
function qualityAdjusted(run: AgentRun): number {
  const raw = (sumRubric(run.rubric) / QUALITY_MAX) * 100;
  return Math.max(0, raw - run.hallucinationPenalty - run.formatPenalty);
}

/** Lower-is-better metric → 0..100 where the field minimum scores 100. */
function efficiency(value: number, min: number): number {
  if (value <= 0) return 100;
  return Math.round(100 * (min / value));
}

/**
 * Score a full field of runs together — cost/token/speed are normalized
 * relative to the best (lowest) competitor in the same challenge.
 */
export function scoreField(runs: AgentRun[]): AgentScore[] {
  const minCost = Math.min(...runs.map((r) => r.costUsd));
  const minTokens = Math.min(...runs.map((r) => r.tokensIn + r.tokensOut));
  const minLatency = Math.min(...runs.map((r) => r.latencyMs));

  return runs.map((run) => {
    const qualityRaw = Math.round((sumRubric(run.rubric) / QUALITY_MAX) * 100);
    const qualityAdj = Math.round(qualityAdjusted(run));
    const costEff = efficiency(run.costUsd, minCost);
    const tokenEff = efficiency(run.tokensIn + run.tokensOut, minTokens);
    const speedEff = efficiency(run.latencyMs, minLatency);
    const robustness = run.robustness;

    const finalScore =
      Math.round(
        (COMPOSITE_WEIGHTS.quality * qualityAdj +
          COMPOSITE_WEIGHTS.costEff * costEff +
          COMPOSITE_WEIGHTS.tokenEff * tokenEff +
          COMPOSITE_WEIGHTS.speedEff * speedEff +
          COMPOSITE_WEIGHTS.robustness * robustness) *
          10,
      ) / 10;

    const valueScore = Math.round((qualityAdj / run.costUsd) * 10) / 10;

    return {
      agentId: run.agentId,
      qualityRaw,
      qualityAdj,
      costEff,
      tokenEff,
      speedEff,
      robustness,
      finalScore,
      valueScore,
    };
  });
}
