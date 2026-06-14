import Anthropic from "@anthropic-ai/sdk";
import type { AgentPersonaId, AgentRun } from "@/lib/agents/types";
import { buildPrompt } from "@/lib/runner/prompt-builder";

export type ChallengeRunContext = {
  slug: string;
  inputDoc: string;
  outputFormat: string;
  brief: string;
};

type ModelId = "claude-haiku-4-5" | "claude-sonnet-4-6" | "claude-opus-4-8";

const MODEL_MAP: Record<AgentPersonaId, ModelId> = {
  frugal: "claude-haiku-4-5",
  laureate: "claude-opus-4-8",
  sprinter: "claude-sonnet-4-6",
  hivemind: "claude-sonnet-4-6",
  scholar: "claude-sonnet-4-6",
  spartan: "claude-haiku-4-5",
  architect: "claude-opus-4-8",
  redliner: "claude-sonnet-4-6",
  sentinel: "claude-sonnet-4-6",
  atlas: "claude-opus-4-8",
};

/** Cost per token (in USD). */
const PRICING: Record<ModelId, { in: number; out: number }> = {
  "claude-haiku-4-5":  { in: 0.000001,  out: 0.000005  },
  "claude-sonnet-4-6": { in: 0.000003,  out: 0.000015  },
  "claude-opus-4-8":   { in: 0.000005,  out: 0.000025  },
};

/** Max output tokens per persona. */
const MAX_TOKENS: Record<AgentPersonaId, number> = {
  frugal:    800,
  laureate:  2500,
  sprinter:  800,
  hivemind:  2500,
  scholar:   1500,
  spartan:   600,
  architect: 2000,
  redliner:  2500,
  sentinel:  1500,
  atlas:     2000,
};

export type RunResult = {
  run: AgentRun;
  fullOutput: string;
};

export async function runAgent(
  agentId: AgentPersonaId,
  challengeSlug: string,
  context?: ChallengeRunContext,
): Promise<RunResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const modelId = MODEL_MAP[agentId];
  const promptOptions = context
    ? {
        report: context.inputDoc,
        outputFormat: context.outputFormat,
        brief: context.brief,
      }
    : undefined;
  const { systemPrompt, userPrompt } = buildPrompt(agentId, promptOptions);
  const maxTokens = MAX_TOKENS[agentId];

  const t0 = Date.now();
  const message = await client.messages.create({
    model: modelId,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });
  const latencyMs = Date.now() - t0;

  const fullOutput = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("\n");

  const tokensIn = message.usage.input_tokens;
  const tokensOut = message.usage.output_tokens;
  const pricing = PRICING[modelId];
  const costUsd = tokensIn * pricing.in + tokensOut * pricing.out;

  const outputPreview = fullOutput.slice(0, 200).replace(/\n+/g, " ").trim();

  const run: AgentRun = {
    agentId,
    challengeSlug,
    modelUsed: modelId,
    tokensIn,
    tokensOut,
    costUsd: Math.round(costUsd * 10000) / 10000,
    latencyMs,
    robustness: 85,
    rubric: { accuracy: 0, completeness: 0, structure: 0, riskId: 0, recommendation: 0 },
    hallucinationPenalty: 0,
    formatPenalty: 0,
    outputPreview,
  };

  return { run, fullOutput };
}
