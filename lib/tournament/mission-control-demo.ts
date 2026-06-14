import type {
  Challenge,
  ChallengeIdea,
  CreatorAgentId,
  AgentRun,
  Evaluation,
  LeaderboardEntry,
  MarketplaceCandidate,
  TournamentEvent,
  TournamentState,
} from "@/lib/tournament/types";
import type {
  GuardAssessment,
  ProviderUsageEntry,
  RoutingTimelineEntry,
  TournamentRoutingMeta,
} from "@/lib/tournament/routing/types";
import {
  createInitialTournamentState,
  runTournamentLoop,
} from "@/lib/tournament/engine";

export const DEMO_ROUND_ID = "T-R12";
export const DEMO_WINNER_AGENT = "Lean Agent";
export const DEMO_WINNER_SCORE = 91;
export const DEMO_COST_SAVED_USD = 0.42;
export const DEMO_MARKETPLACE_COUNT = 4;
export const DEMO_MEMORY_LESSONS = 2;

export type { TournamentViewMode } from "@/lib/tournament/view-mode-labels";
export {
  getTournamentViewMode,
  isEmptyTournamentState,
} from "@/lib/tournament/view-mode-labels";

export type TournamentFlowStep = {
  id: string;
  label: string;
  status: "complete" | "active" | "pending";
  timestamp: string | null;
  actor: string;
  note: string;
};

const IDEA_META: Record<
  CreatorAgentId,
  { category: string; marketplacePotential: number; whyItMatters: string }
> = {
  strategy: {
    category: "Board & GTM",
    marketplacePotential: 88,
    whyItMatters: "Board-ready briefs are the highest-reuse workflow in enterprise AI stacks.",
  },
  technical: {
    category: "Architecture & SRE",
    marketplacePotential: 74,
    whyItMatters: "ADR-style outputs stress-test structure compliance under token caps.",
  },
  growth: {
    category: "Funnel & Retention",
    marketplacePotential: 62,
    whyItMatters: "Retention playbooks validate agent usefulness on noisy growth metrics.",
  },
};

const DEMO_MARKETPLACE: Array<{
  agentName: string;
  challengeTitle: string;
  label: string;
  status: MarketplaceCandidate["status"];
}> = [
  {
    label: "Low-Cost Executive Summary Workflow",
    agentName: "Lean Agent",
    challengeTitle: "Executive Summary Battle",
    status: "seed",
  },
  {
    label: "Lean Operator v1.2 Constitution",
    agentName: "Lean Agent",
    challengeTitle: "Executive Summary Battle",
    status: "review",
  },
  {
    label: "Groq-first Cost Router",
    agentName: "Tournament Engine",
    challengeTitle: "Executive Summary Battle",
    status: "review",
  },
  {
    label: "Strategy Creator Constitution v1.0",
    agentName: "Strategy Agent",
    challengeTitle: "Executive Summary Battle",
    status: "seed",
  },
];

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function enrichChallengeIdeas(ideas: ChallengeIdea[]): ChallengeIdea[] {
  return ideas.map((idea) => ({
    ...idea,
    ...IDEA_META[idea.creatorId],
  }));
}

function enrichSelectedChallenge(challenge: Challenge, ideas: ChallengeIdea[]): Challenge {
  const winner = [...ideas].sort((a, b) => b.selectionScore - a.selectionScore)[0];
  return {
    ...challenge,
    title: "Executive Summary Battle",
    category: winner ? IDEA_META[winner.creatorId].category : "Board & GTM",
    brief:
      "Board-ready summary under cost cap — produce a structured executive brief using only the provided source document.",
    expectedOutput: "## Executive Summary · ## Key Risks · ## Recommendations",
    scoringRubric: "80% quality (accuracy, structure, usefulness) + 20% cost efficiency",
    timeLimitMinutes: 5,
    selectedReason: winner
      ? `Selected because it had the highest selection score (${winner.selectionScore}). Novelty ${winner.noveltyScore} · Feasibility ${winner.feasibilityScore} · Marketplace potential ${IDEA_META[winner.creatorId].marketplacePotential}.`
      : "Top selection score from creator agents this round.",
    passThreshold: 72,
    costLimitUsd: 1.0,
  };
}

function enrichFailReasons(
  evaluations: Evaluation[],
  runs: AgentRun[],
  challenge: Challenge,
): Evaluation[] {
  const FAIL_BY_AGENT: Partial<
    Record<
      Evaluation["agentId"],
      { failReason: string; gateFailed: string }
    >
  > = {
    premium: { failReason: "cost cap exceeded", gateFailed: "cost_cap" },
    rag: { failReason: "quality gate failed", gateFailed: "quality" },
    "multi-agent": { failReason: "format compliance failed", gateFailed: "format" },
    fast: { failReason: "missing required section", gateFailed: "format" },
  };

  return evaluations.map((ev) => {
    if (ev.passed) return ev;
    const run = runs.find((r) => r.id === ev.runId);
    const preset = FAIL_BY_AGENT[ev.agentId];
    if (preset) return { ...ev, ...preset };

    if (run && run.costUsd > challenge.costLimitUsd) {
      return { ...ev, failReason: "cost cap exceeded", gateFailed: "cost_cap" };
    }
    if (ev.scores.badFormattingPenalty < 0) {
      return { ...ev, failReason: "format compliance failed", gateFailed: "format" };
    }
    if (run && run.latencyMs > 10000) {
      return { ...ev, failReason: "latency gate failed", gateFailed: "latency" };
    }
    return { ...ev, failReason: "quality gate failed", gateFailed: "quality" };
  });
}

function patchWinnerScore(evaluations: Evaluation[]): Evaluation[] {
  return evaluations.map((ev) => {
    if (ev.agentId !== "lean") return ev;
    const delta = DEMO_WINNER_SCORE - ev.totalScore;
    return {
      ...ev,
      totalScore: DEMO_WINNER_SCORE,
      qualityScore: Math.min(60, ev.qualityScore + Math.round(delta * 0.6)),
      marketplaceScore: Math.min(10, ev.marketplaceScore + 1),
      passed: true,
    };
  });
}

function enrichLeaderboard(
  entries: LeaderboardEntry[],
  evaluations: Evaluation[],
): LeaderboardEntry[] {
  const evalByAgent = new Map(evaluations.map((e) => [e.agentId, e]));
  return entries.map((entry) => {
    const ev = evalByAgent.get(entry.agentId);
    if (!ev) return entry;
    return {
      ...entry,
      totalScore: ev.totalScore,
      qualityScore: ev.qualityScore,
      efficiencyScore: ev.efficiencyScore,
      marketplaceScore: ev.marketplaceScore,
      penaltyTotal: ev.penaltyTotal,
      trend: entry.agentId === "lean" ? "up" : entry.trend,
    };
  });
}

function buildDemoRouting(completedAt: string): TournamentRoutingMeta {
  const base = minutesAgo(8);
  const guard: GuardAssessment = {
    canRun: true,
    riskLevel: "low",
    recommendedAction: "proceed",
    apiCallCount: 14,
    estimatedInputTokens: 42_800,
    estimatedOutputTokens: 11_200,
    estimatedCostUsd: 0.0042,
    requestsPerMinute: 3,
    requestsPerDay: 14,
    tokensPerDay: 54_000,
    message: "Mock demo round completed under Groq-free caps. Safe to run another loop.",
  };

  const routingTimeline: RoutingTimelineEntry[] = [
    {
      step: "challenge_generation",
      taskType: "challenge_generation",
      provider: "mock",
      model: "mock-groq-8b",
      timestamp: minutesAgo(7),
    },
    {
      step: "competitor_run",
      taskType: "competitor_run",
      provider: "mock",
      model: "mock-groq-8b",
      timestamp: minutesAgo(6),
    },
    {
      step: "preliminary_judge",
      taskType: "preliminary_judge",
      provider: "mock",
      model: "mock-groq-8b",
      timestamp: minutesAgo(5),
    },
    {
      step: "final_judge",
      taskType: "final_judge",
      provider: "mock",
      model: "mock-claude-sonnet",
      timestamp: minutesAgo(4),
    },
    {
      step: "marketplace_summary",
      taskType: "marketplace_polish",
      provider: "mock",
      model: "mock-claude-sonnet",
      timestamp: minutesAgo(3),
    },
  ];

  const providerUsage: ProviderUsageEntry[] = [
    {
      id: "usage-1",
      provider: "mock",
      model: "mock-groq-8b",
      taskType: "challenge_generation",
      inputTokens: 2400,
      outputTokens: 680,
      estimatedCostUsd: 0.002,
      latencyMs: 820,
      timestamp: minutesAgo(7),
      status: "success",
    },
    {
      id: "usage-2",
      provider: "mock",
      model: "mock-groq-8b",
      taskType: "competitor_run",
      inputTokens: 9800,
      outputTokens: 4200,
      estimatedCostUsd: 0.018,
      latencyMs: 2340,
      timestamp: minutesAgo(6),
      status: "success",
    },
    {
      id: "usage-3",
      provider: "mock",
      model: "mock-groq-8b",
      taskType: "preliminary_judge",
      inputTokens: 5200,
      outputTokens: 900,
      estimatedCostUsd: 0.006,
      latencyMs: 1100,
      timestamp: minutesAgo(5),
      status: "success",
    },
    {
      id: "usage-4",
      provider: "mock",
      model: "mock-claude-sonnet",
      taskType: "final_judge",
      inputTokens: 6100,
      outputTokens: 1200,
      estimatedCostUsd: 0.024,
      latencyMs: 2800,
      timestamp: minutesAgo(4),
      status: "success",
    },
    {
      id: "usage-5",
      provider: "mock",
      model: "mock-claude-sonnet",
      taskType: "marketplace_polish",
      inputTokens: 1800,
      outputTokens: 520,
      estimatedCostUsd: 0.008,
      latencyMs: 960,
      timestamp: minutesAgo(3),
      status: "success",
    },
  ];

  return {
    runtimeMode: "mock",
    guard,
    routingTimeline,
    providerUsage,
    costSavedEstimateUsd: DEMO_COST_SAVED_USD,
    agentModels: {
      lean: "mock-groq-8b",
      premium: "mock-groq-70b",
      rag: "mock-groq-8b",
      "multi-agent": "mock-groq-8b",
      fast: "mock-groq-8b",
    },
  };
}

function buildDemoMarketplace(
  tournamentId: string,
  round: number,
  evaluations: Evaluation[],
): MarketplaceCandidate[] {
  const lean = evaluations.find((e) => e.agentId === "lean");
  const scores = [lean?.totalScore ?? DEMO_WINNER_SCORE, 84, 81];

  return DEMO_MARKETPLACE.map((item, i) => ({
    id: `demo-marketplace-${i + 1}`,
    tournamentId,
    round,
    agentId: i === 2 ? "lean" : "lean",
    agentName: item.agentName,
    challengeTitle: item.challengeTitle,
    totalScore: scores[i] ?? 80,
    marketplaceScore: 7 + i,
    reusability: 8 - i,
    enterpriseValue: 7,
    repeatability: 8,
    suggestedPriceUsd: 0.25 + i * 0.15,
    status: item.status,
    createdAt: minutesAgo(2),
    itemType:
      i === 1 ? "agent_constitution" : i === 2 ? "cost_policy" : "challenge_creator_constitution",
  }));
}

function buildDemoHistory(
  tournamentId: string,
  round: number,
  completedAt: string,
): TournamentEvent[] {
  const mk = (type: TournamentEvent["type"], message: string, offsetMin: number): TournamentEvent => ({
    id: `demo-history-${type}-${offsetMin}`,
    tournamentId,
    round,
    type,
    message,
    timestamp: minutesAgo(offsetMin),
  });

  return [
    mk("loop_complete", "Round completed · winner Lean Agent · score 91", 2),
    mk("marketplace_seeded", "4 marketplace candidates created", 2),
    mk("marketplace_seeded", "Marketplace candidate created · Groq-first Cost Router", 2),
    mk("marketplace_seeded", "Marketplace candidate created · Lean Operator v1.2 Constitution", 3),
    mk("leaderboard_updated", "Memory lesson extracted · cost-cap routing pattern", 3),
    mk("evaluation_complete", "Constitution update suggested · Lean Operator v1.2", 4),
    mk("evaluation_complete", "Quality Judge + Efficiency Judge scored 5 outputs", 5),
    mk("agents_running", "5 competitor agents completed runs", 6),
    mk("challenge_selected", 'Winner selected · "Executive Summary Battle" from Strategy Agent', 7),
    mk("challenges_generated", "3 challenge ideas from creator agents", 7),
    mk("loop_started", `Tournament round ${round} started · ${DEMO_ROUND_ID}`, 8),
  ];
}

export function buildFlowTimeline(state: TournamentState): TournamentFlowStep[] {
  const completedAt = state.tournament.completedAt ?? minutesAgo(2);
  const steps: Omit<TournamentFlowStep, "timestamp">[] = [
    {
      id: "challenge_generated",
      label: "Challenge generated",
      status: state.tournament.challengeIdeas.length ? "complete" : "pending",
      actor: "Creator agents",
      note: `${state.tournament.challengeIdeas.length || 3} ideas proposed`,
    },
    {
      id: "challenge_selected",
      label: "Challenge selected",
      status: state.tournament.selectedChallenge ? "complete" : "pending",
      actor: "Tournament selector",
      note: state.tournament.selectedChallenge?.title ?? "Awaiting selection",
    },
    {
      id: "agents_completed",
      label: "Agents completed runs",
      status: state.tournament.activeRuns.length ? "complete" : "pending",
      actor: "5 competitor agents",
      note: `${state.tournament.activeRuns.length || 5} runs logged`,
    },
    {
      id: "judges_evaluated",
      label: "Judges evaluated",
      status: state.tournament.evaluations.length ? "complete" : "pending",
      actor: "Quality + Efficiency judges",
      note: `${state.tournament.evaluations.length || 5} outputs scored`,
    },
    {
      id: "scores_calculated",
      label: "Scores calculated",
      status: state.tournament.evaluations.length ? "complete" : "pending",
      actor: "Scoring engine",
      note: `Winner ${DEMO_WINNER_AGENT} · ${DEMO_WINNER_SCORE}/100`,
    },
    {
      id: "leaderboard_updated",
      label: "Leaderboard updated",
      status: state.leaderboard.length ? "complete" : "pending",
      actor: "Leaderboard service",
      note: `${state.leaderboard.length || 5} agents ranked`,
    },
    {
      id: "memory_compiled",
      label: "Memory compiled",
      status: state.memory?.compiled_at ? "complete" : "pending",
      actor: "Memory compiler",
      note: `${state.memory?.lessons_updated ?? DEMO_MEMORY_LESSONS} lessons extracted`,
    },
    {
      id: "marketplace_created",
      label: "Marketplace candidates created",
      status: state.marketplace.length ? "complete" : "pending",
      actor: "Marketplace detector",
      note: `${state.marketplace.length || DEMO_MARKETPLACE_COUNT} candidates ready`,
    },
  ];

  const offsets = [8, 7, 6, 5, 4, 3, 2, 2];
  return steps.map((step, i) => ({
    ...step,
    timestamp: step.status === "complete" ? minutesAgo(offsets[i] ?? 2) : null,
  }));
}

/** Rich completed demo round for mission control default view. */
export function enrichMissionControlDemo(state: TournamentState): TournamentState {
  const ideas = enrichChallengeIdeas(state.tournament.challengeIdeas);
  const completedAt = state.tournament.completedAt ?? minutesAgo(2);
  const selectedChallenge = state.tournament.selectedChallenge
    ? enrichSelectedChallenge(state.tournament.selectedChallenge, ideas)
    : null;
  const evaluations = enrichFailReasons(
    patchWinnerScore(state.tournament.evaluations),
    state.tournament.activeRuns,
    selectedChallenge ?? state.tournament.selectedChallenge!,
  );

  const tournament = {
    ...state.tournament,
    id: DEMO_ROUND_ID,
    round: state.tournament.round || 12,
    phase: "complete" as const,
    paused: true,
    completedAt,
    challengeIdeas: ideas,
    selectedChallenge,
    evaluations,
    activeRuns: state.tournament.activeRuns,
  };

  const marketplace =
    state.marketplace.length > 0
      ? state.marketplace.slice(0, DEMO_MARKETPLACE_COUNT)
      : buildDemoMarketplace(DEMO_ROUND_ID, tournament.round, evaluations);

  const history = buildDemoHistory(DEMO_ROUND_ID, tournament.round, completedAt);

  return {
    ...state,
    tournament,
    leaderboard: enrichLeaderboard(
      calculateLeaderboardFromEvals(evaluations, state.leaderboard),
      evaluations,
    )
      .sort((a, b) => b.totalScore - a.totalScore || b.wins - a.wins)
      .map((entry, idx) => ({ ...entry, rank: idx + 1 })),
    marketplace,
    history,
    routing: state.routing?.providerUsage?.length
      ? { ...state.routing, costSavedEstimateUsd: DEMO_COST_SAVED_USD }
      : buildDemoRouting(completedAt),
    memory: state.memory ?? {
      last_compile_run_id: "demo-compile-r12",
      last_log_id: null,
      articles_created: 8,
      lessons_updated: DEMO_MEMORY_LESSONS,
      proposals_pending: 1,
      compiled_at: completedAt,
    },
  };
}

function calculateLeaderboardFromEvals(
  evaluations: Evaluation[],
  previous: LeaderboardEntry[],
): LeaderboardEntry[] {
  if (previous.length > 0) return previous;
  return [...evaluations]
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((ev, idx) => ({
      rank: idx + 1,
      agentId: ev.agentId,
      agentName: ev.agentName,
      totalScore: ev.totalScore,
      wins: ev.agentId === "lean" ? 3 : 0,
      rounds: 1,
      avgTokens: 3200,
      avgCost: 0.08,
      trend: ev.agentId === "lean" ? "up" : "flat",
      qualityScore: ev.qualityScore,
      efficiencyScore: ev.efficiencyScore,
      marketplaceScore: ev.marketplaceScore,
      penaltyTotal: ev.penaltyTotal,
    }));
}

export function createMissionControlDemoState(): TournamentState {
  const base = createInitialTournamentState();
  const result = runTournamentLoop(base, "full");
  return enrichMissionControlDemo({
    tournament: { ...result.tournament, paused: true },
    leaderboard: result.leaderboard,
    history: result.history,
    marketplace: result.marketplace,
    routing: buildDemoRouting(new Date().toISOString()),
    constitution: result.constitution,
    memory: result.memory,
  });
}
