import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { checkTournamentSupabaseHealth } from "@/lib/supabase/health";
import type { TournamentRoundRow } from "@/lib/supabase/types";
import type { TournamentMode } from "@/lib/tournament/engine";
import {
  buildSavedTournamentRecord,
  type SavedTournamentRecord,
  toTournamentListItem,
  type TournamentListItem,
  winnerFromState,
} from "@/lib/tournament/saved-tournament";
import type { TournamentState } from "@/lib/tournament/types";

export type SaveTournamentResult = {
  id: string | null;
  error: string | null;
};

function rowToRecord(row: TournamentRoundRow): SavedTournamentRecord {
  const payload = row.payload as {
    tournament: TournamentState["tournament"];
    leaderboard: TournamentState["leaderboard"];
    history: TournamentState["history"];
    marketplace: TournamentState["marketplace"];
    savedAt?: string;
    mode?: TournamentMode;
  };

  const state: TournamentState = {
    tournament: payload.tournament,
    leaderboard: payload.leaderboard,
    history: payload.history,
    marketplace: payload.marketplace,
  };

  return {
    ...buildSavedTournamentRecord(
      state,
      (row.mode as TournamentMode) ?? payload.mode ?? "mock",
      row.id,
    ),
    savedAt: payload.savedAt ?? row.created_at,
  };
}

/** Persist a tournament round snapshot to Supabase. */
export async function saveTournamentRound(
  state: TournamentState,
  mode: TournamentMode = "mock",
): Promise<SaveTournamentResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { id: null, error: "Supabase is not configured." };
  }

  const winner = winnerFromState(state);
  const payload = {
    tournament: state.tournament,
    leaderboard: state.leaderboard,
    history: state.history.slice(0, 50),
    marketplace: state.marketplace,
    savedAt: new Date().toISOString(),
    mode,
  };

  const { data, error } = await supabase
    .from("tournament_rounds")
    .insert({
      tournament_id: state.tournament.id,
      round: state.tournament.round,
      mode,
      phase: state.tournament.phase,
      winner_agent_id: winner.agentId,
      winner_score: winner.score,
      payload,
    })
    .select("id")
    .single();

  if (error) {
    const message = tableMissingHint(error.message) ?? error.message;
    return { id: null, error: message };
  }
  return { id: (data as { id: string }).id, error: null };
}

function tableMissingHint(message: string): string | null {
  const lower = message.toLowerCase();
  if (
    lower.includes("tournament_rounds") &&
    (lower.includes("does not exist") ||
      lower.includes("could not find") ||
      lower.includes("schema cache"))
  ) {
    return "Table tournament_rounds not found — run supabase/tournament_rounds.sql in Supabase SQL Editor.";
  }
  return null;
}

export async function ensureTournamentTableReady(): Promise<string | null> {
  const health = await checkTournamentSupabaseHealth();
  if (!health.tableReady) {
    return health.hint ?? health.error ?? "Supabase tournament table not ready.";
  }
  return null;
}

export async function fetchSavedTournamentRounds(limit = 50): Promise<SavedTournamentRecord[]> {
  const rows = await fetchTournamentRounds(undefined, limit);
  return rows.map(rowToRecord);
}

export async function fetchSavedTournamentRoundById(id: string): Promise<SavedTournamentRecord | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("tournament_rounds")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return rowToRecord(data as TournamentRoundRow);
}

export async function fetchTournamentRounds(
  tournamentId?: string,
  limit = 20,
): Promise<TournamentRoundRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase
    .from("tournament_rounds")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (tournamentId) {
    query = query.eq("tournament_id", tournamentId);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as TournamentRoundRow[];
}

/** @deprecated Use fetchSavedTournamentRoundById */
export async function fetchTournamentRoundById(id: string): Promise<TournamentState | null> {
  const record = await fetchSavedTournamentRoundById(id);
  return record?.state ?? null;
}

export function tournamentRowsToListItems(records: SavedTournamentRecord[]): TournamentListItem[] {
  return records.map(toTournamentListItem);
}

export { isSupabaseConfigured };
