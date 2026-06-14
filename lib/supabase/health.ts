import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export type SupabaseHealth = {
  configured: boolean;
  tableReady: boolean;
  canInsert: boolean;
  error: string | null;
  hint: string | null;
};

function tableMissingMessage(error: string): boolean {
  const lower = error.toLowerCase();
  return (
    lower.includes("tournament_rounds") &&
    (lower.includes("does not exist") ||
      lower.includes("could not find") ||
      lower.includes("schema cache") ||
      lower.includes("relation"))
  );
}

/** Verify Supabase env + tournament_rounds table access. */
export async function checkTournamentSupabaseHealth(): Promise<SupabaseHealth> {
  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      tableReady: false,
      canInsert: false,
      error: "Supabase env missing or still using REPLACE_ME placeholders in .env.local",
      hint: "Run npm run setup:env, add real keys, restart npm run dev",
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return {
      configured: false,
      tableReady: false,
      canInsert: false,
      error: "Could not create Supabase client",
      hint: "Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
    };
  }

  const { error: readError } = await supabase.from("tournament_rounds").select("id").limit(1);
  if (readError) {
    if (tableMissingMessage(readError.message)) {
      return {
        configured: true,
        tableReady: false,
        canInsert: false,
        error: readError.message,
        hint: "Open Supabase SQL Editor and run supabase/tournament_rounds.sql",
      };
    }
    return {
      configured: true,
      tableReady: false,
      canInsert: false,
      error: readError.message,
      hint: "Check Supabase RLS policies for tournament_rounds",
    };
  }

  return {
    configured: true,
    tableReady: true,
    canInsert: true,
    error: null,
    hint: null,
  };
}
