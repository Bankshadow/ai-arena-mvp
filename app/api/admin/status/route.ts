import { NextResponse } from "next/server";

import { isAdminCredentialsConfigured } from "@/lib/admin/auth";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin-client";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  const supabaseConfigured = isSupabaseConfigured();
  const serviceRoleConfigured = isSupabaseAdminConfigured();
  const adminAuthConfigured = isAdminCredentialsConfigured();
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";

  return NextResponse.json({
    ready: supabaseConfigured && serviceRoleConfigured,
    supabaseConfigured,
    serviceRoleConfigured,
    adminAuthConfigured,
    /** In production, /api/admin/* expects Basic Auth when credentials are set. */
    adminAuthRequired: isProduction,
    hint: !serviceRoleConfigured
      ? "Add SUPABASE_SERVICE_ROLE_KEY from Supabase → Settings → API → service_role"
      : !adminAuthConfigured && isProduction
        ? "Set ADMIN_USERNAME and ADMIN_PASSWORD for production admin API access"
        : null,
  });
}
