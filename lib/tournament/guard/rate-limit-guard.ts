import { groqProviderAdapter } from "@/lib/tournament/providers/groq-adapter";
import { getDailyUsage } from "@/lib/tournament/providers/usage-tracker";
import type {
  GuardAssessment,
  RecommendedAction,
  RiskLevel,
  TournamentRuntimeMode,
} from "@/lib/tournament/routing/types";

const ESTIMATES = {
  challengeCalls: 4,
  challengeIn: 3200,
  challengeOut: 2400,
  competitorCallsPerAgent: 1,
  competitorIn: 2200,
  competitorOut: 1100,
  judgeCallsPerAgent: 1,
  judgeIn: 1800,
  judgeOut: 450,
};

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
      return {
        canRun: true,
        riskLevel: "low",
        recommendedAction: "proceed",
        apiCallCount: 0,
        estimatedInputTokens: 0,
        estimatedOutputTokens: 0,
        requestsPerMinute: 0,
        requestsPerDay: 0,
        tokensPerDay: 0,
        message: "Mock mode — no external API usage",
      };
    }

    const apiCallCount =
      ESTIMATES.challengeCalls +
      competitors * ESTIMATES.competitorCallsPerAgent +
      competitors * ESTIMATES.judgeCallsPerAgent +
      (includeFinal ? competitors : 0);

    const estimatedInputTokens =
      ESTIMATES.challengeIn +
      competitors * (ESTIMATES.competitorIn + ESTIMATES.judgeIn) +
      (includeFinal ? competitors * 2000 : 0);

    const estimatedOutputTokens =
      ESTIMATES.challengeOut +
      competitors * (ESTIMATES.competitorOut + ESTIMATES.judgeOut) +
      (includeFinal ? competitors * 800 : 0);

    const requestsPerMinute = apiCallCount;
    const requestsPerDay = getDailyUsage().requests + apiCallCount;
    const tokensPerDay = getDailyUsage().tokens + estimatedInputTokens + estimatedOutputTokens;

    const groqLimits = groqProviderAdapter.getRateLimitInfo();
    let riskLevel: RiskLevel = "low";
    let recommendedAction: RecommendedAction = "proceed";
    let canRun = true;
    let message = "Within Groq free-tier estimates";

    const rpmLimit = groqLimits.requestsPerMinuteLimit ?? 30;
    const rpdLimit = groqLimits.requestsPerDayLimit ?? 14_400;
    const tpdLimit = groqLimits.tokensPerDayLimit ?? 500_000;

    if (requestsPerMinute > rpmLimit * 0.9 || requestsPerDay > rpdLimit * 0.95) {
      riskLevel = "high";
      recommendedAction = "switch_to_mock";
      canRun = false;
      message = "Daily or per-minute Groq limits likely exceeded — switch to mock or delay";
    } else if (tokensPerDay > tpdLimit * 0.85 || requestsPerDay > rpdLimit * 0.8) {
      riskLevel = "medium";
      recommendedAction = "reduce_competitors";
      message = "Approaching Groq daily token budget — reduce competitor count";
    } else if (requestsPerMinute > rpmLimit * 0.7) {
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
      apiCallCount,
      estimatedInputTokens,
      estimatedOutputTokens,
      requestsPerMinute,
      requestsPerDay,
      tokensPerDay,
      message,
    };
  }
}

export const rateLimitGuard = new RateLimitGuard();
