import { randomUUID } from "crypto";

import type { BattleResult } from "@/lib/battle/types";

export type BattleMode = "live" | "demo";

/** Full battle payload stored in Supabase / localStorage. */
export type SavedBattle = BattleResult & {
  mode: BattleMode;
  savedAt: string;
};

export type SavedBattleRecord = SavedBattle & { id: string };

export type BattleListItem = {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  mode: BattleMode;
  winnerAgentId: string | null;
  winnerTokens: number | null;
  passedCount: number;
  savedAt: string;
};

export function toBattleListItem(record: SavedBattleRecord): BattleListItem {
  return {
    id: record.id,
    title: record.challenge.title,
    topic: record.challenge.topic,
    difficulty: record.challenge.difficulty,
    mode: record.mode,
    winnerAgentId: record.winner?.agentId ?? null,
    winnerTokens: record.winner?.totalTokens ?? null,
    passedCount: record.passedCount,
    savedAt: record.savedAt,
  };
}

export function buildSavedBattleRecord(
  result: BattleResult,
  mode: BattleMode,
  id?: string,
): SavedBattleRecord {
  return {
    ...result,
    mode,
    savedAt: new Date().toISOString(),
    id: id ?? randomUUID(),
  };
}
