import { getMockComponentCatalog } from "@/lib/marketplace/mock-catalog";
import type { MarketplaceComponent } from "@/lib/marketplace/types";

/** Six hero marketplace components with stable IDs for Phase 1 proof demo. */
export const FEATURED_PROOF_COMPONENT_IDS = [
  "comp-low-cost-exec-workflow",
  "comp-lean-operator-v12",
  "comp-groq-first-cost-router",
  "comp-business-quality-judge-rubric",
  "comp-exec-summary-3step-prompt",
  "comp-supabase-tournament-storage-hook",
] as const;

export function getFeaturedProofComponents(): MarketplaceComponent[] {
  const catalog = getMockComponentCatalog();
  return FEATURED_PROOF_COMPONENT_IDS.map(
    (id) => catalog.find((c) => c.id === id)!,
  ).filter(Boolean);
}

export function getTopBattleTestedWorkflows(limit = 4): MarketplaceComponent[] {
  return [...getMockComponentCatalog()]
    .filter((c) => c.type === "workflow_template" && c.tournament_tested)
    .sort((a, b) => b.proof.avg_score - a.proof.avg_score)
    .slice(0, limit);
}

export function getLowestCostWinners(limit = 4): MarketplaceComponent[] {
  return [...getMockComponentCatalog()]
    .filter((c) => c.proof.win_rate >= 0.5)
    .sort((a, b) => a.proof.avg_cost_usd - b.proof.avg_cost_usd)
    .slice(0, limit);
}

export function getHighestQualityAgents(limit = 4): MarketplaceComponent[] {
  return [...getMockComponentCatalog()]
    .filter((c) => c.type === "agent_constitution")
    .sort((a, b) => b.proof.avg_score - a.proof.avg_score)
    .slice(0, limit);
}

export function getBestJudgeRubrics(limit = 4): MarketplaceComponent[] {
  return [...getMockComponentCatalog()]
    .filter((c) => c.type === "judge_rubric")
    .sort((a, b) => b.proof.avg_score - a.proof.avg_score)
    .slice(0, limit);
}

export function getModelRoutingPolicies(limit = 4): MarketplaceComponent[] {
  return [...getMockComponentCatalog()]
    .filter((c) => c.type === "model_router")
    .sort((a, b) => b.arena_score.total - a.arena_score.total)
    .slice(0, limit);
}

export function getRecentlyTestedComponents(limit = 6): MarketplaceComponent[] {
  return [...getMockComponentCatalog()]
    .filter((c) => c.tournament_tested)
    .sort(
      (a, b) =>
        new Date(b.proof.last_tournament_at).getTime() -
        new Date(a.proof.last_tournament_at).getTime(),
    )
    .slice(0, limit);
}
