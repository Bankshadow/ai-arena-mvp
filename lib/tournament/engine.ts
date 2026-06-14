import {
  ALL_COMPETITOR_IDS,
  COMPETITOR_AGENTS,
  CREATOR_AGENTS,
  getCompetitor,
  getCreator,
} from "@/lib/tournament/agents";
import { breakdownEvaluation } from "@/lib/tournament/scoring";
import type {
  AgentRun,
  Challenge,
  ChallengeIdea,
  CompetitorAgentId,
  CreatorAgentId,
  Evaluation,
  LeaderboardEntry,
  MarketplaceCandidate,
  Tournament,
  TournamentEvent,
  TournamentLoopResult,
  TournamentState,
} from "@/lib/tournament/types";

const LOOP_MS = 5 * 60 * 1000;

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

const CHALLENGE_TEMPLATES: Record<
  CreatorAgentId,
  { titles: string[]; topics: string[] }
> = {
  strategy: {
    titles: ["Q4 Board Risk Brief", "Competitive Pricing War Room", "M&A Integration Memo"],
    topics: ["board strategy", "competitive response", "M&A integration"],
  },
  technical: {
    titles: ["Incident Postmortem Summary", "Architecture Decision Record", "SLO Breach Analysis"],
    topics: ["incident response", "system design", "reliability"],
  },
  growth: {
    titles: ["Churn Rescue Playbook", "PLG Funnel Diagnostic", "Expansion Revenue Brief"],
    topics: ["retention", "product-led growth", "expansion revenue"],
  },
};

function seeded(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seeded(seed) * arr.length)]!;
}

function event(
  tournamentId: string,
  round: number,
  type: TournamentEvent["type"],
  message: string,
  meta?: Record<string, unknown>,
): TournamentEvent {
  return {
    id: newId(),
    tournamentId,
    round,
    type,
    message,
    timestamp: new Date().toISOString(),
    meta,
  };
}

/** Step 1 — 3 creator agents propose challenge ideas. */
export function generateChallengeIdeas(round: number): ChallengeIdea[] {
  return CREATOR_AGENTS.map((creator, i) => {
    const tpl = CHALLENGE_TEMPLATES[creator.id as CreatorAgentId];
    const title = pick(tpl.titles, round * 10 + i);
    const topic = pick(tpl.topics, round * 20 + i);
    const novelty = Math.round(55 + seeded(round + i) * 40);
    const feasibility = Math.round(50 + seeded(round + i + 3) * 45);
    const selectionScore = Math.round(novelty * 0.45 + feasibility * 0.55);

    return {
      id: newId(),
      creatorId: creator.id as CreatorAgentId,
      creatorName: creator.name,
      title,
      brief: `${creator.specialty}: Produce a structured brief on ${topic} using only the provided source document.`,
      topic,
      difficulty: pick(["easy", "medium", "hard"] as const, round + i),
      noveltyScore: novelty,
      feasibilityScore: feasibility,
      selectionScore,
    };
  });
}

/** Step 2 — pick highest selection score. */
export function selectBestChallenge(ideas: ChallengeIdea[]): Challenge {
  const best = [...ideas].sort((a, b) => b.selectionScore - a.selectionScore)[0]!;
  const passThreshold = best.difficulty === "easy" ? 62 : best.difficulty === "hard" ? 72 : 66;

  return {
    id: newId(),
    title: best.title,
    brief: best.brief,
    inputDoc: `SOURCE DOCUMENT — ${best.title.toUpperCase()}\n\n` +
      `Context: Internal memo on ${best.topic}. Key metrics include 18% YoY growth, ` +
      `91% gross retention, $4.2M initiative budget, and 47 open integration requests. ` +
      `Top risks: pricing pressure, compliance review, engineering capacity. ` +
      `Q4 priorities: expand rollout, reduce time-to-value, launch self-serve dashboard.`,
    outputFormat:
      "## Executive Summary\n## Key Risks\n## Recommendations",
    passThreshold,
    costLimitUsd: 1.0,
    selectedFrom: best.creatorId,
    createdAt: new Date().toISOString(),
  };
}

/** Step 3 — 5 competitor agents run the selected challenge (mock). */
export function runCompetitorAgents(challenge: Challenge, round: number): AgentRun[] {
  const profiles: Record<
    CompetitorAgentId,
    { model: string; tokensIn: number; tokensOut: number; cost: number; latency: number; steps: number }
  > = {
    lean: { model: "claude-haiku-4-5", tokensIn: 1800, tokensOut: 620, cost: 0.035, latency: 2400, steps: 1 },
    premium: { model: "claude-opus-4-8", tokensIn: 9200, tokensOut: 2800, cost: 0.72, latency: 14200, steps: 3 },
    rag: { model: "claude-sonnet-4-6", tokensIn: 5400, tokensOut: 1500, cost: 0.19, latency: 6800, steps: 2 },
    "multi-agent": { model: "claude-sonnet-4-6", tokensIn: 7800, tokensOut: 2200, cost: 0.28, latency: 9800, steps: 4 },
    fast: { model: "claude-sonnet-4-6", tokensIn: 2100, tokensOut: 780, cost: 0.08, latency: 1800, steps: 1 },
  };

  return ALL_COMPETITOR_IDS.map((agentId, i) => {
    const agent = getCompetitor(agentId);
    const p = profiles[agentId];
    const jitter = 0.9 + seeded(round * 100 + i) * 0.2;
    const tokensIn = Math.round(p.tokensIn * jitter);
    const tokensOut = Math.round(p.tokensOut * jitter);
    const fullOutput = `## Executive Summary\n${agent.name} summary for "${challenge.title}" — ${challenge.brief.slice(0, 120)}…\n\n## Key Risks\n1. Pricing pressure\n2. Compliance gap\n3. Capacity risk\n\n## Recommendations\n1. Prioritize Q4 rollout\n2. Close integration backlog\n3. Present ROI narrative`;

    return {
      id: newId(),
      agentId,
      agentName: agent.name,
      challengeId: challenge.id,
      modelUsed: p.model,
      tokensIn,
      tokensOut,
      costUsd: Math.round(p.cost * jitter * 1000) / 1000,
      latencyMs: Math.round(p.latency * jitter),
      workflowSteps: p.steps,
      outputPreview: fullOutput.slice(0, 140).replace(/\n/g, " "),
      fullOutput,
    };
  });
}

/** Step 4 — 2 judges evaluate runs (mock rubric). */
export function evaluateAgentRuns(
  runs: AgentRun[],
  challenge: Challenge,
  round: number,
): Evaluation[] {
  const minTokens = Math.min(...runs.map((r) => r.tokensIn + r.tokensOut));
  const minCost = Math.min(...runs.map((r) => r.costUsd));
  const minLatency = Math.min(...runs.map((r) => r.latencyMs));

  return runs.map((run, i) => {
    const tokenRatio = minTokens / (run.tokensIn + run.tokensOut);
    const costRatio = minCost / run.costUsd;
    const latencyRatio = minLatency / run.latencyMs;
    const qualityBase = 0.72 + seeded(round * 50 + i) * 0.22;

    const scores = {
      accuracy: Math.round(15 * qualityBase),
      completeness: Math.round(15 * (qualityBase - 0.05)),
      structure: Math.round(10 * qualityBase),
      usefulness: Math.round(10 * (qualityBase - 0.03)),
      formatCompliance: run.fullOutput.includes("Executive Summary") ? 10 : 5,
      costEfficiency: Math.round(10 * Math.min(1, costRatio)),
      tokenEfficiency: Math.round(10 * Math.min(1, tokenRatio)),
      latency: Math.round(5 * Math.min(1, latencyRatio)),
      workflowSimplicity: Math.round(5 * (1 / run.workflowSteps) * Math.min(run.workflowSteps, 2)),
      reusability: Math.round(4 * (0.6 + seeded(i + round) * 0.35)),
      enterpriseValue: Math.round(3 * (0.55 + seeded(i + round + 1) * 0.4)),
      repeatability: Math.round(3 * (0.6 + seeded(i + round + 2) * 0.35)),
      hallucinationPenalty: run.agentId === "premium" ? -1 : seeded(i) > 0.85 ? -3 : 0,
      costLimitPenalty: run.costUsd > challenge.costLimitUsd ? -10 : 0,
      missingOutputPenalty: 0,
      badFormattingPenalty: run.fullOutput.includes("##") ? 0 : -5,
    };

    const breakdown = breakdownEvaluation(scores);
    const passed = breakdown.totalScore >= challenge.passThreshold;

    return {
      id: newId(),
      runId: run.id,
      agentId: run.agentId,
      agentName: run.agentName,
      qualityJudgeNotes: passed
        ? "Meets rubric dimensions; structure and usefulness aligned with source."
        : "Partial coverage; recommendations need more specificity.",
      efficiencyJudgeNotes:
        run.tokensIn + run.tokensOut === minTokens
          ? "Lowest token footprint in field."
          : `Token rank ${runs.filter((r) => r.tokensIn + r.tokensOut < run.tokensIn + run.tokensOut).length + 1} of ${runs.length}.`,
      scores,
      ...breakdown,
      passed,
    };
  });
}

/** Step 5 — aggregate cumulative leaderboard. */
export function calculateLeaderboard(
  evaluations: Evaluation[],
  previous: LeaderboardEntry[],
  round: number,
): LeaderboardEntry[] {
  const winner = [...evaluations].sort((a, b) => b.totalScore - a.totalScore)[0];
  const byAgent = new Map(previous.map((e) => [e.agentId, { ...e }]));

  for (const ev of evaluations) {
    const run = COMPETITOR_AGENTS.find((a) => a.id === ev.agentId);
    const prev = byAgent.get(ev.agentId) ?? {
      rank: 0,
      agentId: ev.agentId,
      agentName: run?.name ?? ev.agentName,
      totalScore: 0,
      wins: 0,
      rounds: 0,
      avgTokens: 0,
      avgCost: 0,
      trend: "flat" as const,
    };

    const prevScore = prev.totalScore;
    prev.rounds += 1;
    prev.totalScore = Math.round(((prev.totalScore * (prev.rounds - 1) + ev.totalScore) / prev.rounds) * 10) / 10;
    if (winner?.agentId === ev.agentId) prev.wins += 1;
    prev.trend = prev.totalScore > prevScore ? "up" : prev.totalScore < prevScore ? "down" : "flat";
    byAgent.set(ev.agentId, prev);
  }

  // attach token/cost averages from this round's runs would need runs passed in - use mock from eval agent
  const entries = [...byAgent.values()].sort((a, b) => b.totalScore - a.totalScore || b.wins - a.wins);
  return entries.map((e, idx) => ({
    ...e,
    rank: idx + 1,
    avgTokens: Math.round(2200 + seeded(round + idx) * 6000),
    avgCost: Math.round((0.05 + seeded(round + idx + 5) * 0.5) * 100) / 100,
  }));
}

/** Step 6 — top evaluations become marketplace seeds. */
export function createMarketplaceCandidates(
  tournamentId: string,
  round: number,
  challenge: Challenge,
  evaluations: Evaluation[],
): MarketplaceCandidate[] {
  return [...evaluations]
    .filter((e) => e.passed)
    .sort((a, b) => b.marketplaceScore - a.marketplaceScore || b.totalScore - a.totalScore)
    .slice(0, 3)
    .map((ev, i) => ({
      id: newId(),
      tournamentId,
      round,
      agentId: ev.agentId,
      agentName: ev.agentName,
      challengeTitle: challenge.title,
      totalScore: ev.totalScore,
      marketplaceScore: ev.marketplaceScore,
      reusability: ev.scores.reusability,
      enterpriseValue: ev.scores.enterpriseValue,
      repeatability: ev.scores.repeatability,
      suggestedPriceUsd: Math.round((0.15 + ev.marketplaceScore * 0.08 + i * 0.05) * 100) / 100,
      status: i === 0 ? ("seed" as const) : ("review" as const),
      createdAt: new Date().toISOString(),
    }));
}

export function getLoopIntervalMs(): number {
  return LOOP_MS;
}

export type LoopStep =
  | "full"
  | "generate"
  | "run"
  | "evaluate";

/** Full tournament loop (mock). */
export function runTournamentLoop(
  state: TournamentState,
  step: LoopStep = "full",
): TournamentLoopResult {
  const t = state.tournament;
  const round = step === "full" ? t.round + 1 : t.round || 1;
  const tournamentId = t.id;
  const history = [...state.history];
  let challengeIdeas = t.challengeIdeas;
  let selectedChallenge = t.selectedChallenge;
  let activeRuns = t.activeRuns;
  let evaluations = t.evaluations;
  let leaderboard = state.leaderboard;
  let marketplace = [...state.marketplace];

  history.unshift(
    event(tournamentId, round, "loop_started", `Tournament round ${round} started`, { step }),
  );

  if (step === "full" || step === "generate") {
    challengeIdeas = generateChallengeIdeas(round);
    history.unshift(
      event(
        tournamentId,
        round,
        "challenges_generated",
        `${challengeIdeas.length} challenge ideas from creator agents`,
        { ideas: challengeIdeas.map((c) => c.title) },
      ),
    );
    selectedChallenge = selectBestChallenge(challengeIdeas);
    history.unshift(
      event(
        tournamentId,
        round,
        "challenge_selected",
        `Selected "${selectedChallenge.title}" from ${getCreator(selectedChallenge.selectedFrom).name}`,
        { challengeId: selectedChallenge.id },
      ),
    );
  }

  if ((step === "full" || step === "run") && selectedChallenge) {
    activeRuns = runCompetitorAgents(selectedChallenge, round);
    history.unshift(
      event(
        tournamentId,
        round,
        "agents_running",
        `${activeRuns.length} competitor agents completed runs`,
        { agents: activeRuns.map((r) => r.agentName) },
      ),
    );
  }

  if ((step === "full" || step === "evaluate") && selectedChallenge && activeRuns.length > 0) {
    evaluations = evaluateAgentRuns(activeRuns, selectedChallenge, round);
    history.unshift(
      event(
        tournamentId,
        round,
        "evaluation_complete",
        `Quality Judge + Efficiency Judge scored ${evaluations.length} outputs`,
      ),
    );
    leaderboard = calculateLeaderboard(evaluations, leaderboard, round);
    history.unshift(
      event(tournamentId, round, "leaderboard_updated", "Live leaderboard refreshed", {
        leader: leaderboard[0]?.agentName,
      }),
    );
    const seeds = createMarketplaceCandidates(tournamentId, round, selectedChallenge, evaluations);
    marketplace = [...seeds, ...marketplace].slice(0, 20);
    history.unshift(
      event(
        tournamentId,
        round,
        "marketplace_seeded",
        `${seeds.length} marketplace candidates created`,
        { count: seeds.length },
      ),
    );
    history.unshift(
      event(tournamentId, round, "loop_complete", `Round ${round} complete`, {
        winner: evaluations.sort((a, b) => b.totalScore - a.totalScore)[0]?.agentName,
      }),
    );
  }

  const now = new Date().toISOString();
  const tournament: Tournament = {
    ...t,
    round: step === "full" ? round : t.round,
    phase: step === "full" || step === "evaluate" ? "complete" : step === "run" ? "running" : "generating",
    startedAt: t.startedAt ?? now,
    completedAt: step === "full" || step === "evaluate" ? now : t.completedAt,
    challengeIdeas,
    selectedChallenge,
    activeRuns,
    evaluations,
    nextRunAt: new Date(Date.now() + LOOP_MS).toISOString(),
  };

  return { tournament, leaderboard, history: history.slice(0, 100), marketplace };
}

export function createInitialTournamentState(): TournamentState {
  const id = newId();
  return {
    tournament: {
      id,
      round: 0,
      phase: "idle",
      startedAt: null,
      completedAt: null,
      paused: false,
      nextRunAt: null,
      selectedChallenge: null,
      challengeIdeas: [],
      activeRuns: [],
      evaluations: [],
    },
    leaderboard: COMPETITOR_AGENTS.map((a, i) => ({
      rank: i + 1,
      agentId: a.id as CompetitorAgentId,
      agentName: a.name,
      totalScore: Math.round(70 - i * 3),
      wins: Math.max(0, 2 - i),
      rounds: 0,
      avgTokens: 3000 + i * 800,
      avgCost: 0.12 + i * 0.08,
      trend: "flat",
    })),
    history: [
      event(id, 0, "manual_run", "Tournament engine initialized — mock mode", {
        mode: "mock",
      }),
    ],
    marketplace: [],
  };
}
