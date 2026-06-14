import { getAgentLeaderboard } from "@/lib/agents/simulate";
import type { LeaderboardEntry } from "@/lib/agents/types";
import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";

export type BenchmarkReport = {
  challengeSlug: string;
  generatedAt: string;
  fieldSize: number;
  winner: LeaderboardEntry;
  bestQuality: LeaderboardEntry;
  bestValue: LeaderboardEntry;
  cheapest: LeaderboardEntry;
  fastest: LeaderboardEntry;
  headline: string;
  findings: string[];
};

/**
 * Derive a publishable case study from the simulated battle. Pure derivation —
 * swap the leaderboard source for real runs and the narrative regenerates.
 */
export function getBenchmarkReport(
  challengeSlug: string = DEFAULT_CHALLENGE_SLUG,
): BenchmarkReport {
  const board = getAgentLeaderboard(challengeSlug);

  const winner = board[0];
  const bestQuality = [...board].sort((a, b) => b.score.qualityAdj - a.score.qualityAdj)[0];
  const bestValue = [...board].sort((a, b) => b.score.valueScore - a.score.valueScore)[0];
  const cheapest = [...board].sort((a, b) => a.run.costUsd - b.run.costUsd)[0];
  const fastest = [...board].sort((a, b) => a.run.latencyMs - b.run.latencyMs)[0];

  const costMultiple = (bestQuality.run.costUsd / bestValue.run.costUsd).toFixed(1);
  const qualityGap = bestQuality.score.qualityAdj - bestValue.score.qualityAdj;

  const headline = `${winner.agent.name} wins overall, but ${bestValue.agent.name} delivers the best quality per dollar`;

  const findings = [
    `${bestQuality.agent.name} scored the highest raw quality (${bestQuality.score.qualityAdj}/100) but cost $${bestQuality.run.costUsd.toFixed(2)} per run.`,
    `${bestValue.agent.name} reached ${bestValue.score.qualityAdj}/100 quality for only $${bestValue.run.costUsd.toFixed(2)} — about ${costMultiple}× cheaper than ${bestQuality.agent.name} for just ${qualityGap} fewer quality points.`,
    `${cheapest.agent.name} was the cheapest run at $${cheapest.run.costUsd.toFixed(2)}, and ${fastest.agent.name} the fastest at ${(fastest.run.latencyMs / 1000).toFixed(1)}s.`,
    `Across ${board.length} workflow strategies on the same input, final scores ranged from ${board[board.length - 1].score.finalScore} to ${board[0].score.finalScore} — strategy, not just model, drives the result.`,
  ];

  return {
    challengeSlug,
    generatedAt: new Date().toISOString(),
    fieldSize: board.length,
    winner,
    bestQuality,
    bestValue,
    cheapest,
    fastest,
    headline,
    findings,
  };
}
