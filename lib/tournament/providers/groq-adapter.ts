import OpenAI from "openai";

import {
  getGroqBaseUrl,
  getGroqDefaultModel,
  hasGroqKey,
} from "@/lib/env";
import type { ProviderAdapter } from "@/lib/tournament/providers/types";
import { getDailyUsage } from "@/lib/tournament/providers/usage-tracker";
import type {
  EstimateCostParams,
  GenerateTextParams,
  GenerateTextResult,
  ProviderStatus,
  RateLimitInfo,
} from "@/lib/tournament/routing/types";

/** Groq free-tier reference limits — tune from Groq docs when deploying. */
const GROQ_MAX_RPM = 30;
const GROQ_MAX_RPD = 14_400;
const GROQ_MAX_TPD = 500_000;

/** USD per 1M tokens (approximate Groq pricing). */
const GROQ_PRICING: Record<string, { in: number; out: number }> = {
  "llama-3.1-8b-instant": { in: 0.05, out: 0.08 },
  "llama-3.3-70b-versatile": { in: 0.59, out: 0.79 },
};

function pricingFor(model: string) {
  return GROQ_PRICING[model] ?? { in: 0.1, out: 0.1 };
}

export class GroqProviderAdapter implements ProviderAdapter {
  readonly id = "groq" as const;

  private client(): OpenAI {
    return new OpenAI({
      apiKey: process.env.GROQ_API_KEY!.trim(),
      baseURL: getGroqBaseUrl(),
    });
  }

  async generateText(params: GenerateTextParams): Promise<GenerateTextResult> {
    if (!hasGroqKey()) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const model = params.model ?? getGroqDefaultModel();
    const t0 = Date.now();

    const completion = await this.client().chat.completions.create({
      model,
      max_tokens: params.maxTokens ?? 1024,
      temperature: params.temperature ?? 0.4,
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
      provider: "groq",
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
    if (!hasGroqKey()) {
      return {
        id: "groq",
        available: false,
        label: "Groq",
        message: "Set GROQ_API_KEY in .env.local",
      };
    }
    return {
      id: "groq",
      available: true,
      label: "Groq",
      message: `Connected · default model ${getGroqDefaultModel()}`,
    };
  }

  getRateLimitInfo(): RateLimitInfo {
    const usage = getDailyUsage();
    return {
      requestsPerMinuteLimit: GROQ_MAX_RPM,
      requestsPerDayLimit: GROQ_MAX_RPD,
      tokensPerDayLimit: GROQ_MAX_TPD,
      requestsToday: usage.requests,
      tokensToday: usage.tokens,
    };
  }
}

export const groqProviderAdapter = new GroqProviderAdapter();
