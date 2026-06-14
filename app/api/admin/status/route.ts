import { NextResponse } from "next/server";

import { isSupabaseAdminConfigured } from "@/lib/supabase/admin-client";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  const supabaseConfigured = isSupabaseConfigured();
  const serviceRoleConfigured = isSupabaseAdminConfigured();

  return NextResponse.json({
    ready: supabaseConfigured && serviceRoleConfigured,
    supabaseConfigured,
    serviceRoleConfigured,
    hint: serviceRoleConfigured
      ? null
      : "Add SUPABASE_SERVICE_ROLE_KEY from Supabase → Settings → API → service_role",
  });
}
