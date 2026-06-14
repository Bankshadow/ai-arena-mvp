import {
  modelForTask,
  resolveProvider,
  usesRealApi,
} from "@/lib/tournament/router/runtime-modes";
import {
  maxTokensForTask,
  normalizeTaskType,
  temperatureForTask,
} from "@/lib/tournament/router/task-routes";
import type {
  RouteDecision,
  TaskType,
  TournamentRuntimeMode,
} from "@/lib/tournament/routing/types";

export class ModelRouter {
  route(
    taskType: TaskType,
    runtimeMode: TournamentRuntimeMode,
    agentId?: string,
  ): RouteDecision {
    const normalized = normalizeTaskType(taskType);
    const provider = resolveProvider(normalized, runtimeMode);
    const model = modelForTask(normalized, provider, agentId);

    return {
      taskType: normalized,
      provider,
      model,
      maxTokens: maxTokensForTask(normalized),
      temperature: temperatureForTask(normalized),
      usesRealApi: usesRealApi(runtimeMode, provider),
    };
  }

  /** Anthropic-equivalent cost counterfactual for savings estimate. */
  estimateClaudeEquivalentCost(inputTokens: number, outputTokens: number): number {
    const inRate = 3.0 / 1_000_000;
    const outRate = 15.0 / 1_000_000;
    return Math.round((inputTokens * inRate + outputTokens * outRate) * 10000) / 10000;
  }
}

export const modelRouter = new ModelRouter();

export { normalizeTaskType, TASK_PROVIDER } from "@/lib/tournament/router/task-routes";
export { resolveProvider, usesRealApi } from "@/lib/tournament/router/runtime-modes";
