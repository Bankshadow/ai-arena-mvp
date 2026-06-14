import { NextResponse } from "next/server";

import { hasAnthropicKey } from "@/lib/env";
import { checkTournamentSupabaseHealth } from "@/lib/supabase/health";
import { isSupabaseConfigured } from "@/lib/supabase";

export type HealthCheck = {
  ok: boolean;
  timestamp: string;
  env: {
    nodeEnv: string;
    vercelEnv: string | null;
    supabaseConfigured: boolean;
    supabaseTableReady: boolean;
    llmAvailable: boolean;
    adminProtected: boolean;
  };
  supabaseError: string | null;
  supabaseHint: string | null;
  routes: string[];
};

function hasAdminPassword(): boolean {
  const password = process.env.ADMIN_PASSWORD?.trim();
  return Boolean(password && !password.includes("REPLACE_ME"));
}

/** Production readiness + dependency checks. */
export async function GET() {
  const supabase = await checkTournamentSupabaseHealth();
  const supabaseConfigured = isSupabaseConfigured();

  const health: HealthCheck = {
    ok: supabaseConfigured && supabase.tableReady,
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV ?? "development",
      vercelEnv: process.env.VERCEL_ENV ?? null,
      supabaseConfigured,
      supabaseTableReady: supabase.tableReady,
      llmAvailable: hasAnthropicKey(),
      adminProtected: hasAdminPassword(),
    },
    supabaseError: supabase.error,
    supabaseHint: supabase.hint,
    routes: [
      "/submit",
      "/admin",
      "/leaderboard",
      "/battle",
      "/tournament",
      "/tournaments",
      "/arena",
    ],
  };

  return NextResponse.json(health, { status: health.ok ? 200 : 503 });
}
