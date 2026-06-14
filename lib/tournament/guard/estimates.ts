import { groqProviderAdapter } from "@/lib/tournament/providers/groq-adapter";
import type { GuardAssessment } from "@/lib/tournament/routing/types";

export const ROUND_ESTIMATES = {
  challengeCalls: 4,
  challengeIn: 3200,
  challengeOut: 2400,
  competitorCallsPerAgent: 1,
  competitorIn: 2200,
  competitorOut: 1100,
  judgeCallsPerAgent: 1,
  judgeIn: 1800,
  judgeOut: 450,
  /** Groq llama-3.1-8b blended $/1M tokens (rough). */
  groqBlendedPerMillion: 0.07,
} as const;

export type RoundEstimateInput = {
  competitorCount?: number;
  includeFinalJudge?: boolean;
};

export function estimateRoundUsage(input: RoundEstimateInput = {}) {
  const competitors = input.competitorCount ?? 5;
  const includeFinal = input.includeFinalJudge ?? false;

  const apiCallCount =
    ROUND_ESTIMATES.challengeCalls +
    competitors * ROUND_ESTIMATES.competitorCallsPerAgent +
    competitors * ROUND_ESTIMATES.judgeCallsPerAgent +
    (includeFinal ? competitors : 0);

  const estimatedInputTokens =
    ROUND_ESTIMATES.challengeIn +
    competitors * (ROUND_ESTIMATES.competitorIn + ROUND_ESTIMATES.judgeIn) +
    (includeFinal ? competitors * 2000 : 0);

  const estimatedOutputTokens =
    ROUND_ESTIMATES.challengeOut +
    competitors * (ROUND_ESTIMATES.competitorOut + ROUND_ESTIMATES.judgeOut) +
    (includeFinal ? competitors * 800 : 0);

  const totalTokens = estimatedInputTokens + estimatedOutputTokens;
  const estimatedCostUsd =
    Math.round((totalTokens / 1_000_000) * ROUND_ESTIMATES.groqBlendedPerMillion * 10000) / 10000;

  return {
    apiCallCount,
    estimatedInputTokens,
    estimatedOutputTokens,
    estimatedCostUsd,
    requestsPerMinute: apiCallCount,
  };
}

/** Mock-mode guard snapshot. */
export function mockGuardAssessment(): GuardAssessment {
  return {
    canRun: true,
    riskLevel: "low",
    recommendedAction: "proceed",
    apiCallCount: 0,
    estimatedInputTokens: 0,
    estimatedOutputTokens: 0,
    estimatedCostUsd: 0,
    requestsPerMinute: 0,
    requestsPerDay: 0,
    tokensPerDay: 0,
    message: "Mock mode — no external API usage",
  };
}

export function groqLimits() {
  return groqProviderAdapter.getRateLimitInfo();
}
