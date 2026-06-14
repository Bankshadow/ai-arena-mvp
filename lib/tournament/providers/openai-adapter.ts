import OpenAI from "openai";

import { hasOpenAiKey } from "@/lib/env";
import type { ProviderAdapter } from "@/lib/tournament/providers/types";
import type {
  EstimateCostParams,
  GenerateTextParams,
  GenerateTextResult,
  ProviderStatus,
  RateLimitInfo,
} from "@/lib/tournament/routing/types";

const PRICING: Record<string, { in: number; out: number }> = {
  "gpt-4o": { in: 2.5, out: 10.0 },
  "gpt-4o-mini": { in: 0.15, out: 0.6 },
  "gpt-4.1-mini": { in: 0.4, out: 1.6 },
};

function pricingFor(model: string) {
  return PRICING[model] ?? { in: 2.5, out: 10.0 };
}

function defaultJudgeModel(): string {
  return process.env.TOURNAMENT_OPENAI_JUDGE_MODEL?.trim() || "gpt-4o-mini";
}

export class OpenAiProviderAdapter implements ProviderAdapter {
  readonly id = "openai" as const;

  private client(): OpenAI {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY!.trim() });
  }

  async generateText(params: GenerateTextParams): Promise<GenerateTextResult> {
    if (!hasOpenAiKey()) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const model = params.model ?? defaultJudgeModel();
    const t0 = Date.now();

    const completion = await this.client().chat.completions.create({
      model,
      max_tokens: params.maxTokens ?? 1024,
      temperature: params.temperature ?? 0.3,
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
      ...(params.jsonMode ? { response_format: { type: "json_object" as const } } : {}),
    });

    const text = completion.choices[0]?.message?.content ?? "";
    const inputTokens = completion.usage?.prompt_tokens ?? Math.ceil(params.user.length / 4);
    const outputTokens = completion.usage?.completion_tokens ?? Math.ceil(text.length / 4);
    const rates = pricingFor(model);
    const estimatedCostUsd =
      Math.round(((inputTokens * rates.in + outputTokens * rates.out) / 1_000_000) * 10000) / 10000;

    return {
      text,
      model,
      provider: "openai",
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
    if (!hasOpenAiKey()) {
      return {
        id: "openai",
        available: false,
        label: "OpenAI",
        message: "Set OPENAI_API_KEY for GPT final judge fallback",
      };
    }
    return {
      id: "openai",
      available: true,
      label: "OpenAI",
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

export const openAiProviderAdapter = new OpenAiProviderAdapter();
