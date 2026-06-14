import type { BattleListItemWithId } from "@/lib/battle/local-storage-types";

export type BattleHistoryRow = BattleListItemWithId & {
  battleType: string;
  variants: number;
  winnerScore: number;
  costUsd: number;
  totalTokens: number;
  isDemo?: boolean;
};

export const MOCK_BATTLE_HISTORY: BattleHistoryRow[] = [
  {
    id: "mock-battle-esb-1",
    title: "Executive Summary Battle #1",
    topic: "board strategy",
    difficulty: "medium",
    mode: "demo",
    battleType: "5-agent token battle",
    variants: 5,
    winnerAgentId: "laureate",
    winnerTokens: 8420,
    winnerScore: 91.2,
    costUsd: 0.042,
    totalTokens: 28400,
    passedCount: 4,
    savedAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
    isDemo: true,
  },
  {
    id: "mock-battle-esb-2",
    title: "Executive Summary Battle #1",
    topic: "incident response",
    difficulty: "hard",
    mode: "live",
    battleType: "5-agent token battle",
    variants: 5,
    winnerAgentId: "frugal",
    winnerTokens: 3100,
    winnerScore: 84.6,
    costUsd: 0.008,
    totalTokens: 15200,
    passedCount: 3,
    savedAt: new Date(Date.now() - 5 * 86400_000).toISOString(),
    isDemo: true,
  },
  {
    id: "mock-battle-esb-3",
    title: "Q4 Board Risk Brief",
    topic: "competitive response",
    difficulty: "medium",
    mode: "demo",
    battleType: "Variant shootout",
    variants: 3,
    winnerAgentId: "scholar",
    winnerTokens: 5200,
    winnerScore: 88.1,
    costUsd: 0.019,
    totalTokens: 19800,
    passedCount: 5,
    savedAt: new Date(Date.now() - 9 * 86400_000).toISOString(),
    isDemo: true,
  },
];

export function mergeWithMockBattles(
  items: BattleListItemWithId[],
): BattleHistoryRow[] {
  const byId = new Map<string, BattleHistoryRow>();
  for (const m of MOCK_BATTLE_HISTORY) byId.set(m.id, m);
  for (const item of items) {
    byId.set(item.id, { ...item, battleType: "5-agent token battle", variants: 5, winnerScore: 0, costUsd: 0, totalTokens: item.winnerTokens ?? 0 });
  }
  return [...byId.values()].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );
}
