import type { TournamentState } from "@/lib/tournament/types";

/** Supabase persistence stub — wire real inserts in a future MVP. */
export type PersistResult = {
  ok: boolean;
  message: string;
  savedAt: string;
};

export async function saveTournamentStateMock(_state: TournamentState): Promise<PersistResult> {
  await new Promise((r) => setTimeout(r, 600));
  return {
    ok: true,
    message: "Mock save complete — Supabase integration pending (tournaments, runs, evaluations tables).",
    savedAt: new Date().toISOString(),
  };
}
