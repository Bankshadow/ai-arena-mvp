import { computeArenaScore } from "@/lib/marketplace/arena-score";
import { buildStrategyHash, normalizeDedupSegment } from "@/lib/marketplace/strategy-hash";
import type {
  CandidateStatus,
  ComponentPerformanceProof,
  ComponentType,
  JudgeNote,
  MarketplaceCandidateRecord,
  TournamentEvidence,
} from "@/lib/marketplace/types";
import { newId } from "@/lib/tournament/engine-mock";
import { winnerFromState } from "@/lib/tournament/saved-tournament";
import type {
  AgentRun,
  Challenge,
  Evaluation,
  TournamentState,
} from "@/lib/tournament/types";

const REVIEW_SCORE_THRESHOLD = 75;

export type RoundRunMetrics = {
  score: number;
  cost: number;
  tokens: number;
  latency: number;
  marketplace_score: number;
};

export type CandidateDraft = {
  dedup_key: string;
  component_type: ComponentType;
  challenge_category: string;
  winning_agent: string;
  strategy_hash: string;
  title: string;
  description: string;
  tournament_id: string;
  source_round: number;
  agent_id?: string;
  agent_name?: string;
  challenge_title?: string;
  total_score: number;
  marketplace_score: number;
  initial_status: CandidateStatus;
  avg_score: number;
  avg_cost: number;
  avg_tokens: number;
  avg_latency: number;
  component_id?: string;
  payload: Record<string, unknown>;
};

/** Dedup key: component_type + challenge_category + winning_agent + strategy_hash */
export function buildCandidateDedupKey(
  componentType: ComponentType,
  challengeCategory: string,
  winningAgent: string,
  strategyHash: string,
): string {
  return [
    normalizeDedupSegment(componentType),
    normalizeDedupSegment(challengeCategory),
    normalizeDedupSegment(winningAgent),
    strategyHash.slice(0, 16),
  ].join(":");
}

function challengeCategory(challenge: Challenge): string {
  return challenge.category ?? "executive-summary";
}

function runMetrics(winner: Evaluation, run?: AgentRun): RoundRunMetrics {
  const tokens = run ? run.tokensIn + run.tokensOut : 2200;
  return {
    score: winner.totalScore,
    cost: run?.costUsd ?? 0.003,
    tokens,
    latency: run?.latencyMs ?? 800,
    marketplace_score: winner.marketplaceScore,
  };
}

function buildEvidence(
  state: TournamentState,
  winner: Evaluation,
  run: AgentRun | undefined,
  metrics: RoundRunMetrics,
): TournamentEvidence {
  const challenge = state.tournament.selectedChallenge!;
  return {
    id: `ev-${state.tournament.id}-r${state.tournament.round}-${winner.agentId}`,
    tournament_id: state.tournament.id,
    round: state.tournament.round,
    challenge_title: challenge.title,
    agent_name: winner.agentName,
    score: metrics.score,
    cost_usd: metrics.cost,
    tokens: metrics.tokens,
    latency_ms: metrics.latency,
    passed: winner.passed,
    recorded_at: new Date().toISOString(),
  };
}

function buildJudgeNotes(winner: Evaluation, componentType: ComponentType): JudgeNote[] {
  return [
    {
      id: `jn-${componentType}-quality`,
      dimension: "Quality",
      note: winner.qualityJudgeNotes.slice(0, 200) || `Quality score ${winner.qualityScore}/100.`,
      score_delta: winner.qualityScore >= 80 ? 2 : undefined,
    },
    {
      id: `jn-${componentType}-efficiency`,
      dimension: "Efficiency",
      note: winner.efficiencyJudgeNotes.slice(0, 200) || `Efficiency ${winner.efficiencyScore}/100.`,
    },
  ];
}

function proofFromMetrics(
  metrics: RoundRunMetrics,
  round: number,
  winRate: number,
): ComponentPerformanceProof {
  return {
    win_rate: winRate,
    avg_score: metrics.score,
    avg_cost_usd: metrics.cost,
    avg_tokens: metrics.tokens,
    avg_latency_ms: metrics.latency,
    best_category: metrics.score >= 80 ? "quality" : "cost efficiency",
    worst_category: "latency",
    tournament_runs: 1,
    benchmark_history: [{ round, score: metrics.score, cost: metrics.cost }],
    recommended_use_cases: ["Executive summary workflows", "Tournament automation"],
    last_tournament_at: new Date().toISOString(),
  };
}

function initialStatus(score: number): CandidateStatus {
  return score < REVIEW_SCORE_THRESHOLD ? "review_needed" : "detected";
}

type AssetSpec = {
  type: ComponentType;
  title: string;
  description: string;
  include?: (state: TournamentState) => boolean;
};

function assetSpecs(
  state: TournamentState,
  winner: Evaluation,
  run: AgentRun | undefined,
): AssetSpec[] {
  const challenge = state.tournament.selectedChallenge!;
  const agentLabel = winner.agentName;

  return [
    {
      type: "workflow_template",
      title: `${agentLabel} · ${challenge.title} Workflow`,
      description: `Tournament-winning workflow for ${challenge.title} (${winner.totalScore.toFixed(0)}/100).`,
      include: () => winner.passed,
    },
    {
      type: "agent_constitution",
      title: `${agentLabel} Constitution`,
      description: `Operating spec used by ${agentLabel} in round ${state.tournament.round}.`,
    },
    {
      type: "prompt_template",
      title: `${challenge.title} Prompt Pack`,
      description: `Output-format prompt chain for ${challenge.outputFormat.slice(0, 80)}…`,
    },
    {
      type: "judge_rubric",
      title: `${challenge.title} Judge Rubric`,
      description: challenge.scoringRubric ?? "Quality + efficiency dimensions from tournament judges.",
    },
    {
      type: "model_router",
      title: `${state.routing?.runtimeMode ?? "mock"} Routing Policy`,
      description: "Provider routing used during this tournament round.",
      include: (s) => Boolean(s.routing && (s.routing.providerUsage?.length ?? 0) > 0),
    },
    {
      type: "cost_policy",
      title: `Cost cap · $${challenge.costLimitUsd.toFixed(3)}`,
      description: `Cost policy aligned to challenge limit and guard recommendations.`,
      include: (s) =>
        Boolean(
          s.routing?.guard ||
            (s.routing?.costSavedEstimateUsd ?? 0) > 0 ||
            challenge.costLimitUsd < 0.02,
        ),
    },
  ];
}

/** Detect reusable marketplace assets from a completed tournament round. */
export function detectMarketplaceCandidates(state: TournamentState): CandidateDraft[] {
  const round = state.tournament.round;
  if (round < 1 || state.tournament.evaluations.length === 0) return [];

  const winnerEval = [...state.tournament.evaluations].sort(
    (a, b) => b.totalScore - a.totalScore,
  )[0];
  if (!winnerEval) return [];

  const challenge = state.tournament.selectedChallenge;
  if (!challenge) return [];

  const winnerRun = state.tournament.activeRuns.find((r) => r.agentId === winnerEval.agentId);
  const strategyHash = buildStrategyHash(state, winnerEval, winnerRun);
  const category = challengeCategory(challenge);
  const metrics = runMetrics(winnerEval, winnerRun);
  const status = initialStatus(metrics.score);
  const winRate = winnerEval.passed ? 0.55 + metrics.score / 200 : 0.35;

  const drafts: CandidateDraft[] = [];

  for (const spec of assetSpecs(state, winnerEval, winnerRun)) {
    if (spec.include && !spec.include(state)) continue;

    const dedup_key = buildCandidateDedupKey(
      spec.type,
      category,
      winnerEval.agentId,
      strategyHash,
    );

    drafts.push({
      dedup_key,
      component_type: spec.type,
      challenge_category: category,
      winning_agent: winnerEval.agentId,
      strategy_hash: strategyHash,
      title: spec.title,
      description: spec.description,
      tournament_id: state.tournament.id,
      source_round: round,
      agent_id: winnerEval.agentId,
      agent_name: winnerEval.agentName,
      challenge_title: challenge.title,
      total_score: metrics.score,
      marketplace_score: metrics.marketplace_score,
      initial_status: status,
      avg_score: metrics.score,
      avg_cost: metrics.cost,
      avg_tokens: metrics.tokens,
      avg_latency: metrics.latency,
      component_id: undefined,
      payload: {
        challenge_id: challenge.id,
        output_format: challenge.outputFormat,
        runtime_mode: state.routing?.runtimeMode,
      },
    });
  }

  return drafts;
}

/** Append tournament evidence; skip duplicate round rows. */
export function attachTournamentEvidence(
  candidate: MarketplaceCandidateRecord,
  evidence: TournamentEvidence,
): MarketplaceCandidateRecord {
  const exists = candidate.evidence.some(
    (e) => e.tournament_id === evidence.tournament_id && e.round === evidence.round,
  );
  if (exists) return candidate;

  return {
    ...candidate,
    evidence: [evidence, ...candidate.evidence].slice(0, 50),
    updated_at: new Date().toISOString(),
  };
}

/** Rolling average metrics when the same candidate is seen again. */
export function updateComponentMetrics(
  existing: MarketplaceCandidateRecord,
  run: RoundRunMetrics,
  round: number,
): MarketplaceCandidateRecord {
  const n = existing.tested_runs;
  const newN = n + 1;
  const now = new Date().toISOString();

  const proof: ComponentPerformanceProof = {
    ...existing.proof,
    avg_score: (existing.avg_score * n + run.score) / newN,
    avg_cost_usd: (existing.avg_cost * n + run.cost) / newN,
    avg_tokens: Math.round((existing.avg_tokens * n + run.tokens) / newN),
    avg_latency_ms: Math.round((existing.avg_latency * n + run.latency) / newN),
    tournament_runs: newN,
    win_rate: run.score >= 70 ? Math.min(0.95, existing.proof.win_rate + 0.02) : existing.proof.win_rate,
    benchmark_history: [{ round, score: run.score, cost: run.cost }, ...existing.proof.benchmark_history].slice(
      0,
      20,
    ),
    last_tournament_at: now,
  };

  return {
    ...existing,
    tested_runs: newN,
    avg_score: proof.avg_score,
    avg_cost: proof.avg_cost_usd,
    avg_tokens: proof.avg_tokens,
    avg_latency: proof.avg_latency_ms,
    total_score: run.score,
    marketplace_score: run.marketplace_score,
    proof,
    arena_score: computeArenaScore(proof),
    last_seen_at: now,
    updated_at: now,
  };
}

export function draftToRecord(
  draft: CandidateDraft,
  evidence: TournamentEvidence,
  judgeNotes: JudgeNote[],
): MarketplaceCandidateRecord {
  const now = new Date().toISOString();
  const proof = proofFromMetrics(
    {
      score: draft.avg_score,
      cost: draft.avg_cost,
      tokens: draft.avg_tokens,
      latency: draft.avg_latency,
      marketplace_score: draft.marketplace_score,
    },
    draft.source_round,
    draft.total_score >= 70 ? 0.55 : 0.35,
  );

  return {
    id: newId(),
    dedup_key: draft.dedup_key,
    component_type: draft.component_type,
    challenge_category: draft.challenge_category,
    winning_agent: draft.winning_agent,
    strategy_hash: draft.strategy_hash,
    title: draft.title,
    description: draft.description,
    tournament_id: draft.tournament_id,
    source_round: draft.source_round,
    agent_id: draft.agent_id,
    agent_name: draft.agent_name,
    challenge_title: draft.challenge_title,
    total_score: draft.total_score,
    marketplace_score: draft.marketplace_score,
    status: draft.initial_status,
    tested_runs: 1,
    avg_score: draft.avg_score,
    avg_cost: draft.avg_cost,
    avg_tokens: draft.avg_tokens,
    avg_latency: draft.avg_latency,
    evidence: [evidence],
    judge_notes: judgeNotes,
    proof,
    arena_score: computeArenaScore(proof),
    component_id: draft.component_id,
    payload: draft.payload,
    last_seen_at: now,
    created_at: now,
    updated_at: now,
  };
}

export function mergeCandidateOnDuplicate(
  existing: MarketplaceCandidateRecord,
  state: TournamentState,
  winner: Evaluation,
  run: AgentRun | undefined,
): MarketplaceCandidateRecord {
  const metrics = runMetrics(winner, run);
  const evidence = buildEvidence(state, winner, run, metrics);
  const withMetrics = updateComponentMetrics(existing, metrics, state.tournament.round);
  return attachTournamentEvidence(withMetrics, evidence);
}

/** Build evidence + judge notes for a fresh candidate from tournament state. */
export function buildCandidateFromDraft(
  draft: CandidateDraft,
  state: TournamentState,
  winner: Evaluation,
  run: AgentRun | undefined,
): MarketplaceCandidateRecord {
  const metrics = runMetrics(winner, run);
  const evidence = buildEvidence(state, winner, run, metrics);
  const notes = buildJudgeNotes(winner, draft.component_type);
  return draftToRecord(draft, evidence, notes);
}

/** Process one completed round — detect drafts (caller runs upsert per draft). */
export function detectCandidatesForRound(state: TournamentState): {
  drafts: CandidateDraft[];
  winner: Evaluation;
  winnerRun: AgentRun | undefined;
} | null {
  if (state.tournament.round < 1 || state.tournament.evaluations.length === 0) return null;
  const winner = winnerFromState(state);
  if (!winner.agentId) return null;
  const winnerEval = state.tournament.evaluations.find((e) => e.agentId === winner.agentId);
  if (!winnerEval) return null;
  const winnerRun = state.tournament.activeRuns.find((r) => r.agentId === winnerEval.agentId);
  return {
    drafts: detectMarketplaceCandidates(state),
    winner: winnerEval,
    winnerRun,
  };
}
