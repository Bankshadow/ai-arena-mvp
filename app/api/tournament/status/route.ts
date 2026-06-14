import { NextResponse } from "next/server";

import { hasAnthropicKey } from "@/lib/env";
import { checkTournamentSupabaseHealth } from "@/lib/supabase/health";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  const supabase = await checkTournamentSupabaseHealth();

  return NextResponse.json({
    llmAvailable: hasAnthropicKey(),
    supabaseConfigured: isSupabaseConfigured(),
    supabaseTableReady: supabase.tableReady,
    supabaseCanSave: supabase.canInsert,
    supabaseError: supabase.error,
    supabaseHint: supabase.hint,
  });
}
