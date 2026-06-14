import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { isPlaceholderEnvValue } from "@/lib/env";

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key || isPlaceholderEnvValue(url) || isPlaceholderEnvValue(key)) {
    return false;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();
  return createClient(url, key);
}

/** Client components — same anon client. */
export function createBrowserSupabase(): SupabaseClient | null {
  return getSupabase();
}
