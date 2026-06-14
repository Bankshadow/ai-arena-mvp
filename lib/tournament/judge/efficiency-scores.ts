import type { AgentRun, Challenge } from "@/lib/tournament/types";

export function efficiencyScoresForRun(run: AgentRun, runs: AgentRun[], challenge: Challenge) {
  const minTokens = Math.min(...runs.map((r) => r.tokensIn + r.tokensOut));
  const minCost = Math.min(...runs.map((r) => r.costUsd));
  const minLatency = Math.min(...runs.map((r) => r.latencyMs));

  return {
    costEfficiency: Math.round(10 * Math.min(1, minCost / Math.max(run.costUsd, 0.0001))),
    tokenEfficiency: Math.round(
      10 * Math.min(1, minTokens / Math.max(run.tokensIn + run.tokensOut, 1)),
    ),
    latency: Math.round(10 * Math.min(1, minLatency / Math.max(run.latencyMs, 1))),
    workflowSimplicity: Math.round(5 * (1 / run.workflowSteps) * Math.min(run.workflowSteps, 2)),
    costLimitPenalty: run.costUsd > challenge.costLimitUsd ? -10 : 0,
    efficiencyJudgeNotes:
      run.tokensIn + run.tokensOut === minTokens
        ? "Lowest token footprint in field."
        : `Tokens: ${(run.tokensIn + run.tokensOut).toLocaleString()} in field of ${runs.length}.`,
  };
}
