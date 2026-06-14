import type { SavedBattleRecord } from "@/lib/battle/saved-battle";
import type { BattleListItemWithId } from "@/lib/battle/local-storage-types";

export type { BattleListItemWithId };

const STORAGE_KEY = "ai-arena-battles";
const MAX_BATTLES = 50;

function readAll(): SavedBattleRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedBattleRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(battles: SavedBattleRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(battles.slice(0, MAX_BATTLES)));
}

export function upsertLocalBattle(battle: SavedBattleRecord): void {
  const rest = readAll().filter((b) => b.id !== battle.id);
  writeAll([battle, ...rest]);
}

export function listLocalBattles(): SavedBattleRecord[] {
  return readAll();
}

export function getLocalBattle(id: string): SavedBattleRecord | null {
  return readAll().find((b) => b.id === id) ?? null;
}

export function mergeBattleLists(
  remote: BattleListItemWithId[],
  local: SavedBattleRecord[],
): BattleListItemWithId[] {
  const byId = new Map<string, BattleListItemWithId>();
  for (const item of remote) byId.set(item.id, item);
  for (const battle of local) {
    if (!byId.has(battle.id)) {
      byId.set(battle.id, {
        id: battle.id,
        title: battle.challenge.title,
        topic: battle.challenge.topic,
        difficulty: battle.challenge.difficulty,
        mode: battle.mode,
        winnerAgentId: battle.winner?.agentId ?? null,
        winnerTokens: battle.winner?.totalTokens ?? null,
        passedCount: battle.passedCount,
        savedAt: battle.savedAt,
      });
    }
  }
  return [...byId.values()].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );
}
