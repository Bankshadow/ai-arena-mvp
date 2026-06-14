import type { ComponentProofStatus, MarketplaceComponent } from "@/lib/marketplace/types";

/** Derive public proof badge from component metrics (mock-first). */
export function deriveProofStatus(component: MarketplaceComponent): ComponentProofStatus {
  if (component.proof_status) return component.proof_status;

  const p = component.proof;
  if (p.tournament_runs < 3) return "draft";
  if (component.arena_score.enterprise_readiness >= 85 && p.avg_score >= 85) {
    return "enterprise_ready";
  }
  if (p.win_rate >= 0.6 && p.avg_score >= 80) return "winner";
  if (component.tournament_tested && p.tournament_runs >= 10) return "battle_tested";
  if (p.tournament_runs >= 5) return "tested";
  return "draft";
}

export function battleScore(component: MarketplaceComponent): number {
  return component.proof.avg_score;
}
