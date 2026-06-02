import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { computeCostScore, computeFinalScore } from "@/lib/supabase/scoring";
import type { SubmissionInsert, SubmissionRow, SubmissionStatus } from "@/lib/supabase/types";

export function sortApprovedSubmissions(rows: SubmissionRow[]): SubmissionRow[] {
  return [...rows].sort((a, b) => {
    const scoreA = a.final_score ?? 0;
    const scoreB = b.final_score ?? 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.estimated_cost - b.estimated_cost;
  });
}

export async function insertSubmission(
  input: SubmissionInsert
): Promise<{ data: SubmissionRow | null; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { data: null, error: "Supabase is not configured." };
  }

  const { data, error } = await supabase
    .from("submissions")
    .insert({
      challenge_id: input.challenge_id ?? DEFAULT_CHALLENGE_SLUG,
      name: input.name,
      email: input.email.toLowerCase(),
      role: input.role ?? null,
      prompt_used: input.prompt_used,
      model_used: input.model_used,
      estimated_cost: input.estimated_cost,
      output_result: input.output_result,
      workflow_notes: input.workflow_notes?.trim() || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as SubmissionRow, error: null };
}

export async function fetchApprovedSubmissions(
  challengeId = DEFAULT_CHALLENGE_SLUG
): Promise<SubmissionRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("challenge_id", challengeId)
    .eq("status", "approved")
    .not("final_score", "is", null);

  if (error || !data) return [];
  return sortApprovedSubmissions(data as SubmissionRow[]);
}

export async function fetchSubmissionsByStatus(
  status: SubmissionStatus | "all",
  challengeId = DEFAULT_CHALLENGE_SLUG
): Promise<SubmissionRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase
    .from("submissions")
    .select("*")
    .eq("challenge_id", challengeId)
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as SubmissionRow[];
}

export async function approveSubmission(
  id: string,
  qualityScore: number,
  adminNotes: string | null,
  estimatedCost: number
): Promise<{ error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Supabase is not configured." };

  const costScore = computeCostScore(estimatedCost);
  const finalScore = computeFinalScore(qualityScore, costScore);

  const { error } = await supabase
    .from("submissions")
    .update({
      status: "approved",
      quality_score: qualityScore,
      cost_score: costScore,
      final_score: finalScore,
      admin_notes: adminNotes?.trim() || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  return { error: error?.message ?? null };
}

export async function rejectSubmission(
  id: string,
  adminNotes: string | null
): Promise<{ error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Supabase is not configured." };

  const { error } = await supabase
    .from("submissions")
    .update({
      status: "rejected",
      admin_notes: adminNotes?.trim() || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  return { error: error?.message ?? null };
}

export { isSupabaseConfigured };
