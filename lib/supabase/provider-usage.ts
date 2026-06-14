import { getSupabase } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase/admin-client";
import type { ProviderUsageEntry, TournamentRuntimeMode } from "@/lib/tournament/routing/types";

export type ProviderUsageLogContext = {
  tournamentId?: string;
  round?: number;
  agentId?: string;
  runtimeMode?: TournamentRuntimeMode;
  status?: "success" | "cached" | "skipped" | "error";
  rateLimitHit?: boolean;
};

/** Best-effort insert — never throws; returns false if table missing or unconfigured. */
export async function insertProviderUsageLog(
  entry: ProviderUsageEntry,
  ctx: ProviderUsageLogContext = {},
): Promise<boolean> {
  const client = getSupabaseAdmin() ?? getSupabase();
  if (!client) return false;

  const providerId = entry.provider === "mock" ? "mock" : entry.provider;

  const { error } = await client.from("provider_usage_logs").insert({
    provider_id: providerId,
    model_id: entry.model,
    task_type: entry.taskType,
    tournament_id: ctx.tournamentId ?? null,
    round: ctx.round ?? null,
    agent_id: ctx.agentId ?? null,
    requests: 1,
    input_tokens: entry.inputTokens,
    output_tokens: entry.outputTokens,
    total_tokens: entry.inputTokens + entry.outputTokens,
    estimated_cost_usd: entry.estimatedCostUsd,
    latency_ms: entry.latencyMs,
    error_rate: ctx.status === "error" ? 1 : 0,
    rate_limit_hit: ctx.rateLimitHit ?? false,
    runtime_mode: ctx.runtimeMode ?? null,
    meta: { usage_entry_id: entry.id, status: ctx.status ?? "success" },
  });

  if (error) {
    const lower = error.message.toLowerCase();
    if (
      lower.includes("provider_usage_logs") &&
      (lower.includes("does not exist") || lower.includes("could not find"))
    ) {
      return false;
    }
    console.warn("[provider-usage] insert failed:", error.message);
    return false;
  }

  return true;
}
