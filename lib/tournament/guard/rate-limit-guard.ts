import { getDailyUsage } from "@/lib/tournament/providers/usage-tracker";
import {
  estimateRoundUsage,
  groqLimits,
  mockGuardAssessment,
} from "@/lib/tournament/guard/estimates";
import type {
  GuardAssessment,
  RecommendedAction,
  RiskLevel,
  TournamentRuntimeMode,
} from "@/lib/tournament/routing/types";

export type GuardInput = {
  runtimeMode: TournamentRuntimeMode;
  competitorCount?: number;
  includeFinalJudge?: boolean;
};

export class RateLimitGuard {
  assess(input: GuardInput): GuardAssessment {
    const competitors = input.competitorCount ?? 5;
    const includeFinal = input.includeFinalJudge ?? false;

    if (input.runtimeMode === "mock") {
      return mockGuardAssessment();
    }

    const estimate = estimateRoundUsage({ competitorCount: competitors, includeFinalJudge: includeFinal });
    const daily = getDailyUsage();
    const requestsPerDay = daily.requests + estimate.apiCallCount;
    const tokensPerDay =
      daily.tokens + estimate.estimatedInputTokens + estimate.estimatedOutputTokens;

    const groqLimitsInfo = groqLimits();
    let riskLevel: RiskLevel = "low";
    let recommendedAction: RecommendedAction = "proceed";
    let canRun = true;
    let message = "Within Groq free-tier estimates";

    const rpmLimit = groqLimitsInfo.requestsPerMinuteLimit ?? 30;
    const rpdLimit = groqLimitsInfo.requestsPerDayLimit ?? 14_400;
    const tpdLimit = groqLimitsInfo.tokensPerDayLimit ?? 500_000;

    if (estimate.requestsPerMinute > rpmLimit * 0.9 || requestsPerDay > rpdLimit * 0.95) {
      riskLevel = "high";
      recommendedAction = "switch_to_mock";
      canRun = false;
      message = "Daily or per-minute Groq limits likely exceeded — switch to mock or delay";
    } else if (tokensPerDay > tpdLimit * 0.85 || requestsPerDay > rpdLimit * 0.8) {
      riskLevel = "medium";
      recommendedAction = "reduce_competitors";
      message = "Approaching Groq daily token budget — reduce competitor count";
    } else if (estimate.requestsPerMinute > rpmLimit * 0.7) {
      riskLevel = "medium";
      recommendedAction = "delay_loop";
      message = "Burst RPM high — consider delaying next loop";
    }

    if (input.runtimeMode === "hybrid_quality" && riskLevel === "medium") {
      recommendedAction = "skip_final_judge";
    }

    return {
      canRun,
      riskLevel,
      recommendedAction,
      apiCallCount: estimate.apiCallCount,
      estimatedInputTokens: estimate.estimatedInputTokens,
      estimatedOutputTokens: estimate.estimatedOutputTokens,
      estimatedCostUsd: estimate.estimatedCostUsd,
      requestsPerMinute: estimate.requestsPerMinute,
      requestsPerDay,
      tokensPerDay,
      message,
    };
  }
}

export const rateLimitGuard = new RateLimitGuard();
