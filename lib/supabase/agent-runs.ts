import { getAgentById } from "@/lib/agents/personas";
import type { AgentPersonaId, AgentRun, AgentScore } from "@/lib/agents/types";
import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";
import { buildPrompt } from "@/lib/runner/prompt-builder";
import { getSupabaseAdmin } from "@/lib/supabase/admin-client";
import { computeCostScore } from "@/lib/supabase/scoring";

export async function persistAgentRunAsSubmission(
  agentId: AgentPersonaId,
  run: AgentRun,
  score: AgentScore,
  fullOutput: string,
  challengeSlug = DEFAULT_CHALLENGE_SLUG,
): Promise<{ id: string | null; error: string | null }> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { id: null, error: "SUPABASE_SERVICE_ROLE_KEY not configured" };
  }

  const persona = getAgentById(agentId);
  const { systemPrompt, userPrompt } = buildPrompt(agentId);
  const qualityScore = Math.min(100, Math.round((score.qualityAdj / 80) * 100));
  const costScore = computeCostScore(run.costUsd);
  const finalScore = score.finalScore;

  const { data, error } = await admin
    .from("submissions")
    .insert({
      challenge_id: challengeSlug,
      name: `${persona?.name ?? agentId} (AI Agent)`,
      email: `${agentId}@agents.ai-arena.local`,
      role: "AI Agent",
      prompt_used: `[system]\n${systemPrompt}\n\n[user]\n${userPrompt}`.slice(0, 8000),
      model_used: run.modelUsed,
      estimated_cost: run.costUsd,
      output_result: fullOutput.slice(0, 12000),
      workflow_notes: `Auto-saved from /api/run-agent · tokens ${run.tokensIn + run.tokensOut} · latency ${run.latencyMs}ms`,
      status: "approved",
      quality_score: qualityScore,
      cost_score: costScore,
      final_score: finalScore,
      reviewed_at: new Date().toISOString(),
      admin_notes: "Auto-approved agent run",
    })
    .select("id")
    .single();

  if (error) return { id: null, error: error.message };
  return { id: (data as { id: string }).id, error: null };
}
