import { NextResponse } from "next/server";

import { hasAnthropicKey, hasGroqKey } from "@/lib/env";
import { checkTournamentSupabaseHealth } from "@/lib/supabase/health";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getTournamentProviderStatus } from "@/lib/tournament/routing/status";

export async function GET() {
  const supabase = await checkTournamentSupabaseHealth();
  const providerStatus = getTournamentProviderStatus("mock");

  return NextResponse.json({
    llmAvailable: hasAnthropicKey(),
    groqAvailable: hasGroqKey(),
    supabaseConfigured: isSupabaseConfigured(),
    supabaseTableReady: supabase.tableReady,
    supabaseCanSave: supabase.canInsert,
    supabaseError: supabase.error,
    supabaseHint: supabase.hint,
    providers: providerStatus.providers,
    groqRateLimit: providerStatus.groqRateLimit,
    guardPreview: providerStatus.guardPreview,
  });
}
