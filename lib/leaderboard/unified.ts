import type { LeaderboardRow } from "@/components/LeaderboardTable";
import { getAgentById } from "@/lib/agents/personas";
import { getAgentLeaderboard } from "@/lib/agents/simulate";
import type { AgentPersonaId } from "@/lib/agents/types";
import { mapApprovedToLeaderboardRows } from "@/lib/leaderboard/map-rows";
import { fetchBattles } from "@/lib/supabase/battles";
import { fetchApprovedSubmissions } from "@/lib/supabase/submissions";
import { fetchSavedTournamentRounds } from "@/lib/supabase/tournaments";
import { computeCostScore } from "@/lib/supabase/scoring";

export type UnifiedLeaderboardSource =
  | "human"
  | "agent"
  | "agent-live"
  | "battle"
  | "tournament";

export type UnifiedLeaderboardMeta = {
  sources: Record<UnifiedLeaderboardSource, number>;
  total: number;
};

function agentRows(includeSimulated = true): LeaderboardRow[] {
  if (!includeSimulated) return [];
  return getAgentLeaderboard().map((entry) => ({
    rank: entry.rank,
    player: entry.agent.name,
    qualityScore: Math.round(entry.score.qualityAdj),
    cost: entry.run.costUsd,
    costScore: Math.round(entry.score.costEff),
    finalScore: entry.score.finalScore,
    modelUsed: entry.run.modelUsed,
    submittedAt: undefined,
    source: "agent" as const,
    sourceLabel: "AI Agent",
    highlight: entry.rank <= 3,
  }));
}

async function battleRowsAsync(): Promise<LeaderboardRow[]> {
  const battles = await fetchBattles();
  const rows: LeaderboardRow[] = [];

  for (const battle of battles.slice(0, 10)) {
    const winner = battle.winner;
    if (!winner) continue;
    const agent = getAgentById(winner.agentId as AgentPersonaId);
    rows.push({
      rank: 0,
      player: `${agent?.name ?? winner.agentId} · Battle`,
      qualityScore: Math.round(winner.qualityAdj),
      cost: winner.run.costUsd,
      costScore: computeCostScore(winner.run.costUsd),
      finalScore: Math.min(100, Math.round(winner.qualityAdj * 0.85 + computeCostScore(winner.run.costUsd) * 0.15)),
      modelUsed: winner.run.modelUsed,
      submittedAt: battle.savedAt,
      source: "battle",
      sourceLabel: "Battle",
    });
  }

  return rows;
}

async function tournamentRowsAsync(): Promise<LeaderboardRow[]> {
  const rounds = await fetchSavedTournamentRounds(10);
  const rows: LeaderboardRow[] = [];

  for (const record of rounds) {
    if (!record.winnerAgentId || record.winnerScore == null) continue;
    const agent = getAgentById(record.winnerAgentId as AgentPersonaId);
    const evalEntry = record.state.tournament.evaluations.find(
      (e) => e.agentId === record.winnerAgentId,
    );
    rows.push({
      rank: 0,
      player: `${agent?.name ?? record.winnerAgentId} · T-R${record.round}`,
      qualityScore: evalEntry?.qualityScore ?? Math.round(record.winnerScore * 0.6),
      cost: evalEntry
        ? record.state.tournament.activeRuns.find((r) => r.agentId === record.winnerAgentId)?.costUsd ?? 0
        : 0,
      costScore: evalEntry?.scores.costEfficiency ?? 0,
      finalScore: record.winnerScore,
      modelUsed:
        record.state.tournament.activeRuns.find((r) => r.agentId === record.winnerAgentId)?.modelUsed ??
        "mixed",
      submittedAt: record.savedAt,
      source: "tournament",
      sourceLabel: "Tournament",
    });
  }

  return rows;
}

function dedupeBest(rows: LeaderboardRow[]): LeaderboardRow[] {
  const best = new Map<string, LeaderboardRow>();

  for (const row of rows) {
    const key = `${row.source ?? "human"}:${row.player.toLowerCase()}`;
    const existing = best.get(key);
    if (!existing || row.finalScore > existing.finalScore) {
      best.set(key, row);
    }
  }

  return [...best.values()].sort(
    (a, b) => b.finalScore - a.finalScore || a.cost - b.cost,
  );
}

export async function buildUnifiedLeaderboard(options?: {
  includeSimulatedAgents?: boolean;
}): Promise<{ rows: LeaderboardRow[]; meta: UnifiedLeaderboardMeta }> {
  const includeSimulated = options?.includeSimulatedAgents ?? true;

  const approved = await fetchApprovedSubmissions();
  const humanRows = mapApprovedToLeaderboardRows(approved).map((row) => ({
    ...row,
    source: "human" as const,
    sourceLabel: "Human",
  }));

  const agentLiveRows = humanRows.filter((r) => r.player.includes("(AI Agent)")).map((r) => ({
    ...r,
    source: "agent-live" as const,
    sourceLabel: "Agent Run",
  }));

  const pureHumanRows = humanRows.filter((r) => !r.player.includes("(AI Agent)"));

  const merged = dedupeBest([
    ...pureHumanRows,
    ...agentLiveRows,
    ...agentRows(includeSimulated),
    ...(await battleRowsAsync()),
    ...(await tournamentRowsAsync()),
  ]);

  const rows = merged.map((row, index) => ({
    ...row,
    rank: index + 1,
    highlight: index < 3,
  }));

  const sources: UnifiedLeaderboardMeta["sources"] = {
    human: rows.filter((r) => r.source === "human").length,
    agent: rows.filter((r) => r.source === "agent").length,
    "agent-live": rows.filter((r) => r.source === "agent-live").length,
    battle: rows.filter((r) => r.source === "battle").length,
    tournament: rows.filter((r) => r.source === "tournament").length,
  };

  return { rows, meta: { sources, total: rows.length } };
}

/** Fallback when Supabase is off — simulated agents only. */
export function buildMockUnifiedLeaderboard(): LeaderboardRow[] {
  return agentRows(true).map((row, index) => ({
    ...row,
    rank: index + 1,
    highlight: index < 3,
  }));
}
