/**
 * Mock vs live runtime modes for AI ARENA.
 *
 * See docs/MOCK-VS-LIVE.md for the full matrix.
 *
 * Summary:
 * - **Mock** — no external LLM calls; heuristic judges; demo/localStorage data.
 * - **Live** — real API keys + Supabase persistence where configured.
 * - Pages never hard-fail when env is missing; they fall back to mock/demo state.
 */

import { hasAnthropicKey, hasGroqKey } from "@/lib/env";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin-client";
import { isSupabaseConfigured } from "@/lib/supabase";

export type AppRuntimeLayer = "supabase" | "llm_tournament" | "llm_judge" | "admin_api";

export type LayerRuntimeStatus = {
  layer: AppRuntimeLayer;
  mode: "live" | "mock" | "partial";
  label: string;
  detail: string;
};

/** Human-readable status for env-dependent layers (UI banners, admin notices). */
export function getRuntimeLayerStatuses(): LayerRuntimeStatus[] {
  const supabaseLive = isSupabaseConfigured();
  const adminLive = supabaseLive && isSupabaseAdminConfigured();

  return [
    {
      layer: "supabase",
      mode: supabaseLive ? "live" : "mock",
      label: supabaseLive ? "Supabase connected" : "Supabase not configured",
      detail: supabaseLive
        ? "Submissions, battles, and tournament saves use the remote database."
        : "Public pages use demo data and localStorage. Set NEXT_PUBLIC_SUPABASE_* to enable persistence.",
    },
    {
      layer: "admin_api",
      mode: adminLive ? "live" : "mock",
      label: adminLive ? "Admin API ready" : "Admin API in demo mode",
      detail: adminLive
        ? "Approve/reject uses SUPABASE_SERVICE_ROLE_KEY on /api/admin/* (Basic Auth in production)."
        : "Add SUPABASE_SERVICE_ROLE_KEY for live submission review. Demo queues remain visible.",
    },
    {
      layer: "llm_tournament",
      mode: hasGroqKey() ? "live" : "mock",
      label: hasGroqKey() ? "Groq tournament routing" : "Tournament mock loop",
      detail: hasGroqKey()
        ? "Groq adapter active when runtime mode is groq_free or hybrid_quality."
        : "Tournament runs use lib/tournament/engine-mock.ts (no GROQ_API_KEY).",
    },
    {
      layer: "llm_judge",
      mode: hasAnthropicKey() ? "live" : "mock",
      label: hasAnthropicKey() ? "Anthropic judge available" : "Heuristic judge (mock)",
      detail: hasAnthropicKey()
        ? "Arena, Enterprise, and legacy paths can call Anthropic."
        : "Battle/Arena scoring uses heuristics when ANTHROPIC_API_KEY is omitted.",
    },
  ];
}

/** True when tournament API should label a run as live (Groq or hybrid with keys). */
export function isTournamentLiveCapable(): boolean {
  return hasGroqKey() || hasAnthropicKey();
}
