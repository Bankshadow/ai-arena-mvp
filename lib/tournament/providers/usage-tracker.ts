import { newId } from "@/lib/tournament/engine-mock";
import type { GenerateTextResult, ProviderUsageEntry, TaskType } from "@/lib/tournament/routing/types";

const daily = {
  date: new Date().toISOString().slice(0, 10),
  requests: 0,
  tokens: 0,
};

function rollDaily() {
  const today = new Date().toISOString().slice(0, 10);
  if (daily.date !== today) {
    daily.date = today;
    daily.requests = 0;
    daily.tokens = 0;
  }
}

export function recordProviderUsage(
  result: GenerateTextResult,
  taskType: TaskType,
): ProviderUsageEntry {
  rollDaily();
  daily.requests += 1;
  daily.tokens += result.inputTokens + result.outputTokens;

  return {
    id: newId(),
    provider: result.provider,
    model: result.model,
    taskType,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    estimatedCostUsd: result.estimatedCostUsd,
    latencyMs: result.latencyMs,
    timestamp: new Date().toISOString(),
  };
}

export function getDailyUsage() {
  rollDaily();
  return { requests: daily.requests, tokens: daily.tokens };
}

export function resetDailyUsageForTests() {
  daily.date = new Date().toISOString().slice(0, 10);
  daily.requests = 0;
  daily.tokens = 0;
}
