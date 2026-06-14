import { NextResponse } from "next/server";

import {
  fetchSavedTournamentRounds,
  isSupabaseConfigured,
  tournamentRowsToListItems,
} from "@/lib/supabase/tournaments";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ rounds: [], source: "local" as const });
  }

  try {
    const records = await fetchSavedTournamentRounds();
    return NextResponse.json({
      rounds: tournamentRowsToListItems(records),
      source: "supabase" as const,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: message, rounds: [], source: "demo" as const },
      { status: 200 },
    );
  }
}
