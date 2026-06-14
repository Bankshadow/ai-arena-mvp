import { NextResponse } from "next/server";

import { parseUserEmailFromCookieHeader } from "@/lib/auth/user-cookie";
import { listLocalBattles } from "@/lib/battle/local-storage";
import { fetchBattles } from "@/lib/supabase/battles";
import { fetchSavedTournamentRounds } from "@/lib/supabase/tournaments";
import { fetchSubmissionsByEmailForAccount } from "@/lib/supabase/submissions";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const emailFromQuery = searchParams.get("email")?.trim().toLowerCase();
  const email =
    emailFromQuery ??
    parseUserEmailFromCookieHeader(request.headers.get("cookie"));

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      email,
      submissions: [],
      battles: listLocalBattles().slice(0, 10),
      tournamentRounds: [],
      source: "local" as const,
    });
  }

  const [submissions, battles, tournamentRounds] = await Promise.all([
    fetchSubmissionsByEmailForAccount(email),
    fetchBattles(),
    fetchSavedTournamentRounds(20),
  ]);

  return NextResponse.json({
    email,
    submissions,
    battles: battles.slice(0, 20),
    tournamentRounds,
    source: "supabase" as const,
  });
}
