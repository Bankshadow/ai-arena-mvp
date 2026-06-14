import { NextResponse } from "next/server";

import { fetchSavedTournamentRoundById, isSupabaseConfigured } from "@/lib/supabase/tournaments";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const record = await fetchSavedTournamentRoundById(id);
    if (!record) {
      return NextResponse.json({ error: "Tournament round not found" }, { status: 404 });
    }
    return NextResponse.json(record);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
