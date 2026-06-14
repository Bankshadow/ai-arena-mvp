import type { SavedTournamentRecord, TournamentListItem } from "@/lib/tournament/saved-tournament";
import { toTournamentListItem } from "@/lib/tournament/saved-tournament";

const STORAGE_KEY = "ai-arena-tournament-rounds";
const MAX_ROUNDS = 50;

function readAll(): SavedTournamentRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedTournamentRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(rounds: SavedTournamentRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rounds.slice(0, MAX_ROUNDS)));
}

export function upsertLocalTournamentRound(record: SavedTournamentRecord): void {
  const rest = readAll().filter((r) => r.id !== record.id);
  writeAll([record, ...rest]);
}

export function listLocalTournamentRounds(): SavedTournamentRecord[] {
  return readAll();
}

export function getLocalTournamentRound(id: string): SavedTournamentRecord | null {
  return readAll().find((r) => r.id === id) ?? null;
}

export function mergeTournamentLists(
  remote: TournamentListItem[],
  local: SavedTournamentRecord[],
): TournamentListItem[] {
  const byId = new Map<string, TournamentListItem>();
  for (const item of remote) byId.set(item.id, item);
  for (const record of local) {
    if (!byId.has(record.id)) {
      byId.set(record.id, toTournamentListItem(record));
    }
  }
  return [...byId.values()].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );
}
