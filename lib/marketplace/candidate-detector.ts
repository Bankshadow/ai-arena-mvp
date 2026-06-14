import { detectMarketplaceCandidates } from "@/lib/marketplace/candidate-pipeline";
import { listMarketplaceCandidates } from "@/lib/marketplace/candidate-store";
import { getPublishedComponents } from "@/lib/marketplace/published-catalog";
import { computeArenaScore } from "@/lib/marketplace/arena-score";
import { getComponentById, getMockComponentCatalog } from "@/lib/marketplace/mock-catalog";
import type { MarketplaceCandidateV2, MarketplaceCandidateRecord } from "@/lib/marketplace/types";
import type { TournamentState } from "@/lib/tournament/types";

function mapStatusToLegacy(
  status: MarketplaceCandidateRecord["status"],
): MarketplaceCandidateV2["status"] {
  if (status === "published") return "listed";
  if (status === "approved" || status === "review_needed") return "review";
  return "seed";
}

function recordToV2(record: MarketplaceCandidateRecord): MarketplaceCandidateV2 {
  return {
    id: record.id,
    component_id: record.component_id ?? `cand-${record.component_type}-${record.source_round}`,
    slug: record.dedup_key,
    type: record.component_type,
    title: record.title,
    tournament_id: record.tournament_id,
    round: record.source_round,
    agent_id: record.agent_id,
    agent_name: record.agent_name,
    challenge_title: record.challenge_title,
    total_score: record.total_score,
    marketplace_score: record.marketplace_score,
    proof: record.proof,
    arena_score: record.arena_score,
    status: mapStatusToLegacy(record.status),
    candidate_status: record.status,
    tested_runs: record.tested_runs,
    evidence: record.evidence,
    created_at: record.created_at,
  };
}

function mapAgentToConstitutionComponent(agentId: string) {
  const match = getMockComponentCatalog().find(
    (c) =>
      c.type === "agent_constitution" &&
      (c.tags.includes(agentId) || c.title.toLowerCase().includes(agentId)),
  );
  return match ?? getComponentById("comp-lean-operator-v12");
}

/** Detect typed marketplace candidates from a completed tournament state (sync UI helper). */
export function detectCandidatesFromTournamentState(
  state: TournamentState,
): MarketplaceCandidateV2[] {
  const drafts = detectMarketplaceCandidates(state);
  if (drafts.length === 0) return [];

  const winner = [...state.tournament.evaluations].sort((a, b) => b.totalScore - a.totalScore)[0];
  const winRate = winner && winner.passed ? 0.55 + winner.totalScore / 200 : 0.35;

  return drafts.map((draft) => {
    const proof = {
      win_rate: winRate,
      avg_score: draft.avg_score,
      avg_cost_usd: draft.avg_cost,
      avg_tokens: draft.avg_tokens,
      avg_latency_ms: draft.avg_latency,
      best_category: draft.avg_score >= 80 ? "quality" : "cost efficiency",
      worst_category: "latency",
      tournament_runs: 1,
      benchmark_history: [{ round: draft.source_round, score: draft.avg_score, cost: draft.avg_cost }],
      recommended_use_cases: ["Executive summary workflows"],
      last_tournament_at: new Date().toISOString(),
    };

    const component =
      draft.component_type === "agent_constitution" && draft.agent_id
        ? mapAgentToConstitutionComponent(draft.agent_id)
        : getMockComponentCatalog().find((c) => c.type === draft.component_type);

    return {
      id: `cand-${draft.dedup_key}`,
      component_id: component?.id ?? `comp-${draft.component_type}`,
      slug: draft.dedup_key,
      type: draft.component_type,
      title: draft.title,
      tournament_id: draft.tournament_id,
      round: draft.source_round,
      agent_id: draft.agent_id,
      agent_name: draft.agent_name,
      challenge_title: draft.challenge_title,
      total_score: draft.total_score,
      marketplace_score: draft.marketplace_score,
      proof,
      arena_score: computeArenaScore(proof),
      status: mapStatusToLegacy(draft.initial_status),
      candidate_status: draft.initial_status,
      tested_runs: 1,
      created_at: new Date().toISOString(),
    };
  });
}

/** Map legacy MarketplaceCandidate rows to V2 for display. */
export function enrichLegacyCandidates(state: TournamentState): MarketplaceCandidateV2[] {
  const mapLegacy = () =>
    state.marketplace.map((m) => {
      const p = {
        win_rate: m.totalScore >= 70 ? 0.55 : 0.35,
        avg_score: m.totalScore,
        avg_cost_usd: 0.003,
        avg_tokens: 2000,
        avg_latency_ms: 800,
        best_category: "quality",
        worst_category: "latency",
        tournament_runs: m.round + 5,
        benchmark_history: [{ round: m.round, score: m.totalScore, cost: 0.003 }],
        recommended_use_cases: ["Executive summary workflows"],
        last_tournament_at: m.createdAt,
      };
      return {
        id: m.id,
        component_id:
          mapAgentToConstitutionComponent(m.agentId)?.id ?? "comp-low-cost-exec-workflow",
        slug: m.id,
        type: "workflow_template" as const,
        title: `${m.agentName} Workflow`,
        tournament_id: m.tournamentId,
        round: m.round,
        agent_id: m.agentId,
        agent_name: m.agentName,
        challenge_title: m.challengeTitle,
        total_score: m.totalScore,
        marketplace_score: m.marketplaceScore,
        proof: p,
        arena_score: computeArenaScore(p),
        status: m.status,
        created_at: m.createdAt,
      };
    });

  const legacy = mapLegacy();
  if (legacy.length >= 4) return legacy;

  const detected = detectCandidatesFromTournamentState(state);
  if (detected.length > legacy.length) return detected;
  return legacy.length > 0 ? legacy : detected;
}

/** Async — includes persisted candidates from store (admin / post-round). */
export async function loadCandidateProofCards(
  state: TournamentState,
): Promise<MarketplaceCandidateV2[]> {
  const fromState = detectCandidatesFromTournamentState(state);
  const pending = await listMarketplaceCandidates({
    status: ["detected", "review_needed", "approved", "draft"],
    limit: 12,
  });
  const published = getPublishedComponents();

  if (pending.length === 0 && fromState.length > 0) return fromState.slice(0, 6);
  if (pending.length > 0) return pending.map(recordToV2).slice(0, 6);

  if (published.length > 0) {
    return published.slice(0, 4).map((c) => ({
      id: c.id,
      component_id: c.id,
      slug: c.slug,
      type: c.type,
      title: c.title,
      tournament_id: c.source_tournament_id ?? state.tournament.id,
      round: c.source_round ?? state.tournament.round,
      total_score: c.proof.avg_score,
      marketplace_score: c.suggested_price_usd,
      proof: c.proof,
      arena_score: c.arena_score,
      status: "listed" as const,
      candidate_status: "published" as const,
      tested_runs: c.proof.tournament_runs,
      evidence: c.evidence,
      created_at: c.created_at,
    }));
  }

  return fromState.slice(0, 6);
}

// Back-compat alias
export { detectMarketplaceCandidates as detectMarketplaceCandidatesFromState };
