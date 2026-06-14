import { computeArenaScore } from "@/lib/marketplace/arena-score";
import { getComponentById, getMockComponentCatalog } from "@/lib/marketplace/mock-catalog";
import type {
  ComponentPerformanceProof,
  ComponentType,
  MarketplaceCandidateV2,
  MarketplaceComponent,
} from "@/lib/marketplace/types";
import type { TournamentState } from "@/lib/tournament/types";

function proofFromEval(
  totalScore: number,
  costUsd: number,
  tokens: number,
  round: number,
): ComponentPerformanceProof {
  return {
    win_rate: totalScore >= 70 ? 0.55 + (totalScore - 70) * 0.015 : 0.35,
    avg_score: totalScore,
    avg_cost_usd: costUsd,
    avg_tokens: tokens,
    best_category: totalScore >= 80 ? "quality" : "cost efficiency",
    worst_category: "latency",
    tournament_runs: round + 5,
    benchmark_history: [
      { round: Math.max(1, round - 1), score: totalScore - 3, cost: costUsd * 1.05 },
      { round, score: totalScore, cost: costUsd },
    ],
    recommended_use_cases: ["Executive summary workflows", "Tournament automation"],
    last_tournament_at: new Date().toISOString(),
  };
}

function candidateFromComponent(
  component: MarketplaceComponent,
  state: TournamentState,
  totalScore: number,
  status: MarketplaceCandidateV2["status"] = "seed",
): MarketplaceCandidateV2 {
  return {
    id: `cand-${component.id}-r${state.tournament.round}`,
    component_id: component.id,
    slug: component.slug,
    type: component.type,
    title: component.title,
    tournament_id: state.tournament.id,
    round: state.tournament.round,
    total_score: totalScore,
    marketplace_score: Math.round((totalScore / 100) * 10 * 10) / 10,
    proof: component.proof,
    arena_score: component.arena_score,
    status,
    created_at: new Date().toISOString(),
  };
}

function mapAgentToConstitutionComponent(agentId: string): MarketplaceComponent | undefined {
  const match = getMockComponentCatalog().find(
    (c) =>
      c.type === "agent_constitution" &&
      (c.tags.includes(agentId) || c.title.toLowerCase().includes(agentId)),
  );
  return match ?? getComponentById(`comp-const-lean-operator-v1.2`);
}

/** Detect typed marketplace candidates from a completed tournament state. */
export function detectCandidatesFromTournamentState(
  state: TournamentState,
): MarketplaceCandidateV2[] {
  const candidates: MarketplaceCandidateV2[] = [];
  const round = state.tournament.round;
  if (round === 0 && state.tournament.evaluations.length === 0) return candidates;

  const evaluations = [...state.tournament.evaluations].sort((a, b) => b.totalScore - a.totalScore);
  const winner = evaluations[0];
  const challenge = state.tournament.selectedChallenge;

  if (winner) {
    const run = state.tournament.activeRuns.find((r) => r.agentId === winner.agentId);
    const agentComponent = mapAgentToConstitutionComponent(winner.agentId);
    if (agentComponent) {
      candidates.push({
        ...candidateFromComponent(agentComponent, state, winner.totalScore),
        agent_id: winner.agentId,
        agent_name: winner.agentName,
        challenge_title: challenge?.title,
      });
    }
  }

  if (challenge) {
    const challengeComp =
      getMockComponentCatalog().find((c) => c.type === "challenge_template") ??
      getComponentById("comp-q4-board-challenge");
    if (challengeComp) {
      candidates.push({
        ...candidateFromComponent(challengeComp, state, winner?.totalScore ?? 72),
        challenge_title: challenge.title,
        status: "review",
      });
    }
  }

  if (state.routing && state.routing.costSavedEstimateUsd > 0) {
    const router = getComponentById("comp-groq-tournament-router");
    if (router) {
      candidates.push(candidateFromComponent(router, state, 81, "seed"));
    }
  }

  const passed = evaluations.filter((e) => e.passed).slice(0, 2);
  for (const ev of passed) {
    const wf = getComponentById("comp-exec-summary-workflow");
    if (wf && !candidates.some((c) => c.component_id === wf.id)) {
      const run = state.tournament.activeRuns.find((r) => r.agentId === ev.agentId);
      candidates.push({
        ...candidateFromComponent(wf, state, ev.totalScore),
        agent_id: ev.agentId,
        agent_name: ev.agentName,
        challenge_title: challenge?.title,
      });
    }
  }

  if (state.constitution?.marketplaceCandidateIds.length) {
    for (const mktId of state.constitution.marketplaceCandidateIds) {
      const versionId = mktId.replace("mkt-const-", "");
      const comp = getMockComponentCatalog().find((c) => c.id.includes(versionId.split("-").pop() ?? ""));
      if (comp && !candidates.some((c) => c.component_id === comp.id)) {
        candidates.push(candidateFromComponent(comp, state, winner?.totalScore ?? 75, "review"));
      }
    }
  }

  return candidates.slice(0, 6);
}

/** Map legacy MarketplaceCandidate rows to V2 for display. */
export function enrichLegacyCandidates(
  state: TournamentState,
): MarketplaceCandidateV2[] {
  const detected = detectCandidatesFromTournamentState(state);
  if (detected.length > 0) return detected;

  return state.marketplace.map((m) => {
    const p = proofFromEval(m.totalScore, 0.003, 2000, m.round);
    return {
      id: m.id,
      component_id: mapAgentToConstitutionComponent(m.agentId)?.id ?? "comp-exec-summary-workflow",
      slug: m.id,
      type: "workflow_template" as ComponentType,
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
}
