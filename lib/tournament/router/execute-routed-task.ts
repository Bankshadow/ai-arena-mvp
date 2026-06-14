import { getProviderAdapter } from "@/lib/tournament/providers";
import { recordProviderUsage } from "@/lib/tournament/providers/usage-tracker";
import { modelRouter } from "@/lib/tournament/router/model-router";
import { normalizeTaskType } from "@/lib/tournament/router/task-routes";
import type {
  GenerateTextResult,
  ProviderId,
  ProviderUsageEntry,
  RoutingTimelineEntry,
  TaskType,
  TournamentRuntimeMode,
} from "@/lib/tournament/routing/types";
import type { ProviderUsageLogger } from "@/lib/tournament/usage/usage-logger";

export type ExecuteRoutedTaskParams = {
  taskType: TaskType;
  runtimeMode: TournamentRuntimeMode;
  system: string;
  user: string;
  step: string;
  agentId?: string;
  jsonMode?: boolean;
  usage: ProviderUsageEntry[];
  timeline: RoutingTimelineEntry[];
  logger?: ProviderUsageLogger;
  tournamentId?: string;
  round?: number;
};

export type ExecuteRoutedTaskResult = {
  text: string;
  result: GenerateTextResult;
  usedMockFallback: boolean;
};

function pushTimeline(
  timeline: RoutingTimelineEntry[],
  step: string,
  taskType: TaskType,
  provider: ProviderId,
  model: string,
) {
  timeline.push({
    step,
    taskType: normalizeTaskType(taskType),
    provider,
    model,
    timestamp: new Date().toISOString(),
  });
}

async function runOnce(
  params: ExecuteRoutedTaskParams,
  runtimeMode: TournamentRuntimeMode,
): Promise<ExecuteRoutedTaskResult> {
  const taskType = normalizeTaskType(params.taskType);
  const decision = modelRouter.route(taskType, runtimeMode, params.agentId);
  pushTimeline(params.timeline, params.step, taskType, decision.provider, decision.model);

  const adapter = getProviderAdapter(decision.provider);
  const result = await adapter.generateText({
    taskType,
    system: params.system,
    user: params.user,
    model: decision.model,
    maxTokens: decision.maxTokens,
    temperature: decision.temperature,
    jsonMode: params.jsonMode,
  });

  const entry = recordProviderUsage(result, taskType);
  params.usage.push(entry);

  return { text: result.text, result, usedMockFallback: runtimeMode === "mock" && params.runtimeMode !== "mock" };
}

/**
 * Unified routed task execution with per-task mock fallback on provider errors.
 */
export async function executeRoutedTask(
  params: ExecuteRoutedTaskParams,
): Promise<ExecuteRoutedTaskResult> {
  try {
    return await runOnce(params, params.runtimeMode);
  } catch (err) {
    if (params.runtimeMode === "mock") throw err;
    return runOnce(params, "mock");
  }
}

/** Record marketplace_summary step in routing timeline (mock-first Phase 1). */
export function recordMarketplaceSummaryStep(
  runtimeMode: TournamentRuntimeMode,
  timeline: RoutingTimelineEntry[],
  round: number,
  candidateCount: number,
): void {
  const decision = modelRouter.route("marketplace_summary", runtimeMode);
  pushTimeline(
    timeline,
    `Marketplace summary · R${round} · ${candidateCount} candidates`,
    "marketplace_summary",
    decision.provider,
    decision.model,
  );
}
