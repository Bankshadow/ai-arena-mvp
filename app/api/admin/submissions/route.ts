import { NextResponse } from "next/server";

import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";
import { getSupabaseAdmin } from "@/lib/supabase/admin-client";
import type { SubmissionRow, SubmissionStatus } from "@/lib/supabase/types";

export async function GET(request: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not configured" },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const status = (searchParams.get("status") ?? "pending") as SubmissionStatus | "all";
  const challengeId = searchParams.get("challengeId") ?? DEFAULT_CHALLENGE_SLUG;

  let query = admin
    .from("submissions")
    .select("*")
    .eq("challenge_id", challengeId)
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submissions: (data ?? []) as SubmissionRow[] });
}
