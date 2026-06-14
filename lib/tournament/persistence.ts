import type { TournamentState } from "@/lib/tournament/types";
import {
  ensureTournamentTableReady,
  fetchTournamentRounds,
  isSupabaseConfigured,
  saveTournamentRound,
} from "@/lib/supabase/tournaments";

export type PersistResult = {
  ok: boolean;
  message: string;
  savedAt: string;
  roundId?: string | null;
};

/** Save tournament state to Supabase (falls back gracefully when not configured). */
export async function saveTournamentState(
  state: TournamentState,
  mode: "live" | "mock" = "mock",
): Promise<PersistResult> {
  const savedAt = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: "Supabase not configured — add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then run tournament_rounds SQL in schema.sql.",
      savedAt,
    };
  }

  if (state.tournament.round < 1) {
    return {
      ok: false,
      message: "Run at least one tournament round before saving.",
      savedAt,
    };
  }

  const tableError = await ensureTournamentTableReady();
  if (tableError) {
    return { ok: false, message: tableError, savedAt };
  }

  const { id, error } = await saveTournamentRound(state, mode);

  if (error) {
    return { ok: false, message: error, savedAt };
  }

  return {
    ok: true,
    message: `Round ${state.tournament.round} saved to Supabase (${mode} mode).`,
    savedAt,
    roundId: id,
  };
}

/** @deprecated Use saveTournamentState */
export async function saveTournamentStateMock(state: TournamentState): Promise<PersistResult> {
  return saveTournamentState(state, "mock");
}

export { fetchTournamentRounds, isSupabaseConfigured };
