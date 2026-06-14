import { getAllProviderStatuses } from "@/lib/tournament/providers";
import { groqProviderAdapter } from "@/lib/tournament/providers/groq-adapter";
import { rateLimitGuard } from "@/lib/tournament/guard/rate-limit-guard";
import type { TournamentRuntimeMode } from "@/lib/tournament/routing/types";

export function getTournamentProviderStatus(runtimeMode: TournamentRuntimeMode = "mock") {
  const providers = getAllProviderStatuses();
  const groqLimits = groqProviderAdapter.getRateLimitInfo();
  const guard = rateLimitGuard.assess({
    runtimeMode,
    competitorCount: 5,
    includeFinalJudge: runtimeMode === "hybrid_quality",
  });

  return {
    providers,
    groqAvailable: providers.find((p) => p.id === "groq")?.available ?? false,
    groqRateLimit: {
      requestsToday: groqLimits.requestsToday,
      tokensToday: groqLimits.tokensToday,
      requestsPerDayLimit: groqLimits.requestsPerDayLimit,
      requestsPerMinuteLimit: groqLimits.requestsPerMinuteLimit,
    },
    guardPreview: guard,
  };
}
