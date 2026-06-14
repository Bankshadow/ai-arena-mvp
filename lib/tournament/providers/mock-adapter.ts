import type { ProviderAdapter } from "@/lib/tournament/providers/types";
import type {
  EstimateCostParams,
  GenerateTextParams,
  GenerateTextResult,
  ProviderStatus,
  RateLimitInfo,
} from "@/lib/tournament/routing/types";

export class MockProviderAdapter implements ProviderAdapter {
  readonly id = "mock" as const;

  async generateText(params: GenerateTextParams): Promise<GenerateTextResult> {
    const inputTokens = Math.ceil((params.system.length + params.user.length) / 4);
    const text = params.jsonMode
      ? JSON.stringify({
          summary: "Mock tournament output for development.",
          executiveSummary: "## Executive Summary\nMock analysis.",
          keyRisks: "## Key Risks\n1. Mock risk",
          recommendations: "## Recommendations\n1. Mock action",
        })
      : `## Executive Summary\nMock ${params.taskType} output.\n\n## Key Risks\n- Deterministic mock risk\n\n## Recommendations\n- Proceed with mock pipeline`;

    const outputTokens = Math.ceil(text.length / 4);

    return {
      text,
      model: "mock-v1",
      provider: "mock",
      inputTokens,
      outputTokens,
      latencyMs: 12,
      estimatedCostUsd: 0,
    };
  }

  estimateCost(params: EstimateCostParams): number {
    void params;
    return 0;
  }

  getProviderStatus(): ProviderStatus {
    return {
      id: "mock",
      available: true,
      label: "Mock",
      message: "Deterministic offline responses — no API cost",
    };
  }

  getRateLimitInfo(): RateLimitInfo {
    return {
      requestsPerMinuteLimit: null,
      requestsPerDayLimit: null,
      tokensPerDayLimit: null,
      requestsToday: 0,
      tokensToday: 0,
    };
  }
}

export const mockProviderAdapter = new MockProviderAdapter();
