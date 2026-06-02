import type { LeaderboardRow } from "@/components/LeaderboardTable";
import type { LeaderboardEntry } from "@/lib/data/leaderboard";
import { MOCK_LEADERBOARD } from "@/lib/data/mock-mvp";

export function entryToRow(entry: LeaderboardEntry, highlight = false): LeaderboardRow {
  return {
    rank: entry.rank,
    player: entry.player,
    qualityScore: entry.qualityScore,
    cost: entry.cost,
    costScore: entry.costScore,
    finalScore: entry.finalScore,
    modelUsed: entry.modelUsed,
    highlight,
  };
}

export function mockToRows(): LeaderboardRow[] {
  return MOCK_LEADERBOARD.map((m, i) => ({
    rank: i + 1,
    player: m.name,
    qualityScore: m.qualityScore,
    cost: m.estimatedCost,
    costScore: m.costScore,
    finalScore: m.finalScore,
    modelUsed: m.modelUsed,
    submittedAt: new Date().toISOString(),
    highlight: i < 3,
  }));
}

/** Merge base rows with optional local browser submissions (client-only). */
export function mergeLeaderboardRows(
  base: LeaderboardRow[],
  local: LeaderboardRow[]
): LeaderboardRow[] {
  const merged = [...base];

  for (const row of local) {
    const idx = merged.findIndex(
      (m) => m.player.toLowerCase() === row.player.toLowerCase()
    );
    if (idx >= 0) {
      if (row.finalScore > merged[idx].finalScore) {
        merged[idx] = { ...row, highlight: true };
      }
    } else {
      merged.push({ ...row, highlight: true });
    }
  }

  merged.sort((a, b) => b.finalScore - a.finalScore || a.cost - b.cost);
  return merged.map((row, i) => ({ ...row, rank: i + 1 }));
}
