import { NextResponse } from "next/server";

import { hasAnthropicKey, hasGroqKey, hasOpenAiKey } from "@/lib/env";
import { checkTournamentSupabaseHealth } from "@/lib/supabase/health";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getTournamentProviderStatus } from "@/lib/tournament/routing/status";
import { DEFAULT_RUNTIME_MODE } from "@/lib/tournament/routing/types";

export async function GET() {
  const supabase = await checkTournamentSupabaseHealth();
  const providerStatus = getTournamentProviderStatus(DEFAULT_RUNTIME_MODE);

  return NextResponse.json({
    llmAvailable: hasAnthropicKey(),
    groqAvailable: hasGroqKey(),
    premiumAvailable: hasAnthropicKey() || hasOpenAiKey(),
    defaultRuntimeMode: DEFAULT_RUNTIME_MODE,
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
