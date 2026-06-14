import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { isPlaceholderEnvValue } from "@/lib/env";

/** Server-only Supabase client with service role (bypasses RLS). */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    process.env.SUPABASE_SERVICE_KEY?.trim();

  if (!url || !serviceKey || isPlaceholderEnvValue(url) || isPlaceholderEnvValue(serviceKey)) {
    return null;
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isSupabaseAdminConfigured(): boolean {
  return getSupabaseAdmin() !== null;
}
