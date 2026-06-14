import Anthropic from "@anthropic-ai/sdk";

import { hasAnthropicKey } from "@/lib/env";
import type { ProviderAdapter } from "@/lib/tournament/providers/types";
import type {
  EstimateCostParams,
  GenerateTextParams,
  GenerateTextResult,
  ProviderStatus,
  RateLimitInfo,
} from "@/lib/tournament/routing/types";

const PRICING: Record<string, { in: number; out: number }> = {
  "claude-haiku-4-5": { in: 1.0, out: 5.0 },
  "claude-sonnet-4-6": { in: 3.0, out: 15.0 },
  "claude-opus-4-8": { in: 5.0, out: 25.0 },
};

function pricingFor(model: string) {
  return PRICING[model] ?? { in: 3.0, out: 15.0 };
}

function defaultJudgeModel(): string {
  return process.env.TOURNAMENT_ANTHROPIC_JUDGE_MODEL?.trim() || "claude-sonnet-4-6";
}

export class AnthropicProviderAdapter implements ProviderAdapter {
  readonly id = "anthropic" as const;

  private client(): Anthropic {
    return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY!.trim() });
  }

  async generateText(params: GenerateTextParams): Promise<GenerateTextResult> {
    if (!hasAnthropicKey()) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const model = params.model ?? defaultJudgeModel();
    const t0 = Date.now();

    const message = await this.client().messages.create({
      model,
      max_tokens: params.maxTokens ?? 1024,
      temperature: params.temperature ?? 0.3,
      system: params.system,
      messages: [{ role: "user", content: params.user }],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");

    const inputTokens = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;
    const rates = pricingFor(model);
    const estimatedCostUsd =
      Math.round(((inputTokens * rates.in + outputTokens * rates.out) / 1_000_000) * 10000) / 10000;

    return {
      text,
      model,
      provider: "anthropic",
      inputTokens,
      outputTokens,
      latencyMs: Date.now() - t0,
      estimatedCostUsd,
    };
  }

  estimateCost(params: EstimateCostParams): number {
    const rates = pricingFor(params.model);
    return (
      Math.round(
        ((params.inputTokens * rates.in + params.outputTokens * rates.out) / 1_000_000) * 10000,
      ) / 10000
    );
  }

  getProviderStatus(): ProviderStatus {
    if (!hasAnthropicKey()) {
      return {
        id: "anthropic",
        available: false,
        label: "Anthropic",
        message: "Set ANTHROPIC_API_KEY for hybrid final judge",
      };
    }
    return {
      id: "anthropic",
      available: true,
      label: "Anthropic",
      message: `Connected · judge model ${defaultJudgeModel()}`,
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

export const anthropicProviderAdapter = new AnthropicProviderAdapter();
