import { NextResponse } from "next/server";
import { z } from "zod";

import { computeCostScore, computeFinalScore } from "@/lib/supabase/scoring";
import { getSupabaseAdmin } from "@/lib/supabase/admin-client";

const BodySchema = z.object({
  qualityScore: z.number().min(0).max(100),
  adminNotes: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not configured" },
      { status: 503 },
    );
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { data: row, error: fetchError } = await admin
    .from("submissions")
    .select("estimated_cost")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !row) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const cost = Number(row.estimated_cost);
  const costScore = computeCostScore(cost);
  const finalScore = computeFinalScore(parsed.data.qualityScore, costScore);

  const { error } = await admin
    .from("submissions")
    .update({
      status: "approved",
      quality_score: parsed.data.qualityScore,
      cost_score: costScore,
      final_score: finalScore,
      admin_notes: parsed.data.adminNotes?.trim() || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
