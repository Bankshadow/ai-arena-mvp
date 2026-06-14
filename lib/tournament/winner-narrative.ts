import {
  DEMO_WINNER_AGENT,
  DEMO_WINNER_SCORE,
} from "@/lib/tournament/mission-control-demo";
import type { AgentRun, Evaluation, LeaderboardEntry } from "@/lib/tournament/types";

export type RoundWinner = {
  agentName: string;
  agentId: string;
  totalScore: number;
  qualityScore: number;
  efficiencyScore: number;
  marketplaceScore: number;
  penaltyTotal: number;
  passed: boolean;
  gateOutcome?: Evaluation["gateOutcome"];
  avgCost?: number;
  evaluation?: Evaluation;
  run?: AgentRun;
};

export function getRoundWinner(
  evaluations: Evaluation[],
  runs: AgentRun[],
  leaderboard: LeaderboardEntry[],
): RoundWinner | null {
  const topLb = leaderboard.find((e) => e.rank === 1);
  const topEval =
    evaluations.length > 0
      ? [...evaluations].sort((a, b) => b.totalScore - a.totalScore)[0]
      : null;

  if (!topEval && !topLb) return null;

  const agentId = topEval?.agentId ?? topLb!.agentId;
  const run = runs.find((r) => r.agentId === agentId);

  return {
    agentName: topEval?.agentName ?? topLb!.agentName ?? DEMO_WINNER_AGENT,
    agentId,
    totalScore: topEval?.totalScore ?? topLb?.totalScore ?? DEMO_WINNER_SCORE,
    qualityScore: topEval?.qualityScore ?? topLb?.qualityScore ?? 0,
    efficiencyScore: topEval?.efficiencyScore ?? topLb?.efficiencyScore ?? 0,
    marketplaceScore: topEval?.marketplaceScore ?? topLb?.marketplaceScore ?? 0,
    penaltyTotal: topEval?.penaltyTotal ?? topLb?.penaltyTotal ?? 0,
    passed: topEval?.passed ?? true,
    gateOutcome: topEval?.gateOutcome,
    avgCost: topLb?.avgCost ?? run?.costUsd,
    evaluation: topEval ?? undefined,
    run,
  };
}

export function buildWinnerNarrative(winner: RoundWinner, round: number): string {
  const gateText = winner.passed
    ? "passed all judge gates"
    : winner.gateOutcome === "below_gate"
      ? "scored highest despite a below-threshold gate"
      : "ranked first on composite score";

  const costText =
    winner.avgCost != null
      ? ` at $${winner.avgCost.toFixed(3)}/run`
      : "";

  return `${winner.agentName} wins Tournament Round ${round || 12} with ${winner.totalScore.toFixed(1)} — ${gateText}${costText}. Quality ${winner.qualityScore.toFixed(0)}/60 · Efficiency ${winner.efficiencyScore.toFixed(0)}/30 · Marketplace ${winner.marketplaceScore.toFixed(1)}/10.`;
}
