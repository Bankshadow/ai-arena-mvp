import { getGroqDefaultModel, hasAnthropicKey, hasGroqKey, hasOpenAiKey } from "@/lib/env";
import type { ProviderId, TaskType, TournamentRuntimeMode } from "@/lib/tournament/routing/types";

import { normalizeTaskType, TASK_PROVIDER } from "@/lib/tournament/router/task-routes";

const PREMIUM_TASKS = new Set<TaskType>(["final_judge", "benchmark_report"]);

export function usesRealApi(runtimeMode: TournamentRuntimeMode, provider: ProviderId): boolean {
  if (runtimeMode === "mock") return false;
  if (provider === "mock") return false;
  if (provider === "groq") {
    return hasGroqKey() && (runtimeMode === "groq_free" || runtimeMode === "hybrid_quality");
  }
  if (provider === "anthropic") {
    return hasAnthropicKey() && runtimeMode === "hybrid_quality";
  }
  if (provider === "openai") {
    return hasOpenAiKey() && runtimeMode === "hybrid_quality";
  }
  return false;
}

function resolvePremiumProvider(): ProviderId {
  if (hasAnthropicKey()) return "anthropic";
  if (hasOpenAiKey()) return "openai";
  return "mock";
}

export function resolveProvider(taskType: TaskType, runtimeMode: TournamentRuntimeMode): ProviderId {
  const normalized = normalizeTaskType(taskType);
  const preferred = TASK_PROVIDER[normalized];

  if (runtimeMode === "mock") return "mock";

  if (PREMIUM_TASKS.has(normalized)) {
    if (runtimeMode !== "hybrid_quality") return "mock";
    return resolvePremiumProvider();
  }

  if (preferred === "groq") {
    if (!hasGroqKey()) return "mock";
    return "groq";
  }

  if (preferred === "anthropic" || preferred === "openai") {
    if (runtimeMode !== "hybrid_quality") return "mock";
    return resolvePremiumProvider();
  }

  return "mock";
}

export function modelForTask(
  taskType: TaskType,
  provider: ProviderId,
  agentId?: string,
): string {
  const normalized = normalizeTaskType(taskType);

  if (provider === "mock") return "mock-v1";

  if (provider === "anthropic") {
    if (normalized === "final_judge") {
      return process.env.TOURNAMENT_ANTHROPIC_JUDGE_MODEL?.trim() || "claude-sonnet-4-6";
    }
    return process.env.TOURNAMENT_ANTHROPIC_JUDGE_MODEL?.trim() || "claude-sonnet-4-6";
  }

  if (provider === "openai") {
    return process.env.TOURNAMENT_OPENAI_JUDGE_MODEL?.trim() || "gpt-4o-mini";
  }

  if (provider === "groq") {
    if (agentId === "lean" || agentId === "fast") {
      return process.env.TOURNAMENT_GROQ_MODEL_FAST?.trim() || "llama-3.1-8b-instant";
    }
    if (normalized === "challenge_generation") {
      return process.env.TOURNAMENT_GROQ_MODEL_QUALITY?.trim() || getGroqDefaultModel();
    }
    return getGroqDefaultModel();
  }

  return "mock-v1";
}
