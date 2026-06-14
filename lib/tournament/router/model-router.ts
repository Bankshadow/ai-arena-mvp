import { getGroqDefaultModel, hasGroqKey } from "@/lib/env";
import { getProviderAdapter } from "@/lib/tournament/providers";
import type { ProviderAdapter } from "@/lib/tournament/providers/types";
import type {
  ProviderId,
  RouteDecision,
  TaskType,
  TournamentRuntimeMode,
} from "@/lib/tournament/routing/types";

const TASK_PROVIDER: Record<TaskType, ProviderId> = {
  challenge_generation: "groq",
  competitor_run: "groq",
  preliminary_judge: "groq",
  final_judge: "mock",
  benchmark_report: "mock",
  marketplace_polish: "mock",
};

function usesRealApi(
  runtimeMode: TournamentRuntimeMode,
  provider: ProviderId,
): boolean {
  if (runtimeMode === "mock") return false;
  if (provider === "mock") return false;
  if (provider === "groq") {
    return hasGroqKey() && (runtimeMode === "groq_free" || runtimeMode === "hybrid_quality");
  }
  return false;
}

function resolveProvider(
  taskType: TaskType,
  runtimeMode: TournamentRuntimeMode,
): ProviderId {
  const preferred = TASK_PROVIDER[taskType];
  if (runtimeMode === "mock") return "mock";
  if (preferred === "groq" && !hasGroqKey()) return "mock";
  if (preferred === "mock") return "mock";
  return preferred;
}

function modelFor(taskType: TaskType, provider: ProviderId, agentId?: string): string {
  if (provider === "mock") return "mock-v1";
  if (provider === "groq") {
    if (agentId === "lean" || agentId === "fast") {
      return process.env.TOURNAMENT_GROQ_MODEL_FAST?.trim() || "llama-3.1-8b-instant";
    }
    if (taskType === "challenge_generation") {
      return process.env.TOURNAMENT_GROQ_MODEL_QUALITY?.trim() || getGroqDefaultModel();
    }
    return getGroqDefaultModel();
  }
  return "mock-v1";
}

export class ModelRouter {
  route(
    taskType: TaskType,
    runtimeMode: TournamentRuntimeMode,
    agentId?: string,
  ): RouteDecision {
    const provider = resolveProvider(taskType, runtimeMode);
    const model = modelFor(taskType, provider, agentId);
    const maxTokens =
      taskType === "challenge_generation" ? 2048 : taskType === "competitor_run" ? 1200 : 800;
    const temperature = taskType === "competitor_run" ? 0.35 : 0.5;

    return {
      taskType,
      provider,
      model,
      maxTokens,
      temperature,
      usesRealApi: usesRealApi(runtimeMode, provider),
    };
  }

  getAdapter(decision: RouteDecision): ProviderAdapter {
    return getProviderAdapter(decision.provider);
  }

  /** Anthropic-equivalent cost counterfactual for savings estimate. */
  estimateClaudeEquivalentCost(inputTokens: number, outputTokens: number): number {
    const inRate = 3.0 / 1_000_000;
    const outRate = 15.0 / 1_000_000;
    return Math.round((inputTokens * inRate + outputTokens * outRate) * 10000) / 10000;
  }
}

export const modelRouter = new ModelRouter();
