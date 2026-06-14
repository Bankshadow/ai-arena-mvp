import type { ProviderId, TaskType } from "@/lib/tournament/routing/types";

/** Preferred provider per task — overridden by runtime mode in runtime-modes.ts */
export const TASK_PROVIDER: Record<TaskType, ProviderId> = {
  challenge_generation: "groq",
  competitor_run: "groq",
  preliminary_judge: "groq",
  final_judge: "anthropic",
  benchmark_report: "anthropic",
  marketplace_polish: "mock",
  marketplace_summary: "mock",
};

/** Canonical task type for logging (marketplace_polish → marketplace_summary). */
export function normalizeTaskType(taskType: TaskType): TaskType {
  if (taskType === "marketplace_polish") return "marketplace_summary";
  return taskType;
}

export function maxTokensForTask(taskType: TaskType): number {
  if (taskType === "challenge_generation") return 2048;
  if (taskType === "competitor_run") return 1200;
  if (taskType === "final_judge") return 768;
  return 800;
}

export function temperatureForTask(taskType: TaskType): number {
  return taskType === "competitor_run" ? 0.35 : 0.5;
}
