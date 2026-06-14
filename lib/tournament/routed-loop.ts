import { CREATOR_AGENTS, getCompetitor } from "@/lib/tournament/agents";
import {
  calculateLeaderboard,
  createMarketplaceCandidates,
  evaluateAgentRunsMock,
  generateChallengeIdeasMock,
  newId,
  runCompetitorAgentsMock,
  selectBestChallengeMock,
} from "@/lib/tournament/engine-mock";
import { getProviderAdapter } from "@/lib/tournament/providers";
import { recordProviderUsage } from "@/lib/tournament/providers/usage-tracker";
import { modelRouter } from "@/lib/tournament/router/model-router";
import type {
  ProviderUsageEntry,
  RoutingTimelineEntry,
  TournamentRuntimeMode,
} from "@/lib/tournament/routing/types";
import { selectBestChallengeIdea } from "@/lib/tournament/llm";
import { buildAgentConstitutionUsage } from "@/lib/constitution/tournament-bridge";
import type {
  AgentRun,
  Challenge,
  ChallengeIdea,
  CompetitorAgentId,
  CreatorAgentId,
  Evaluation,
  LeaderboardEntry,
  MarketplaceCandidate,
  TournamentEvent,
} from "@/lib/tournament/types";
import { ALL_COMPETITOR_IDS } from "@/lib/tournament/agents";

function parseJson<T>(text: string): T {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/```\s*$/, "");
  return JSON.parse(trimmed) as T;
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

function pushTimeline(
  timeline: RoutingTimelineEntry[],
  step: string,
  taskType: RoutingTimelineEntry["taskType"],
  provider: RoutingTimelineEntry["provider"],
  model: string,
) {
  timeline.push({
    step,
    taskType,
    provider,
    model,
    timestamp: new Date().toISOString(),
  });
}

async function routedGenerate(
  taskType: RoutingTimelineEntry["taskType"],
  runtimeMode: TournamentRuntimeMode,
  system: string,
  user: string,
  usage: ProviderUsageEntry[],
  timeline: RoutingTimelineEntry[],
  step: string,
  agentId?: string,
  jsonMode = false,
): Promise<string> {
  const decision = modelRouter.route(taskType, runtimeMode, agentId);
  pushTimeline(timeline, step, decision.taskType, decision.provider, decision.model);

  const adapter = getProviderAdapter(decision.provider);
  const result = await adapter.generateText({
    taskType: decision.taskType,
    system,
    user,
    model: decision.model,
    maxTokens: decision.maxTokens,
    temperature: decision.temperature,
    jsonMode,
  });

  usage.push(recordProviderUsage(result, taskType));
  return result.text;
}

async function generateChallengeIdeasRouted(
  round: number,
  runtimeMode: TournamentRuntimeMode,
  usage: ProviderUsageEntry[],
  timeline: RoutingTimelineEntry[],
): Promise<ChallengeIdea[]> {
  const decision = modelRouter.route("challenge_generation", runtimeMode);
  if (!decision.usesRealApi) {
    return generateChallengeIdeasMock(round);
  }

  const creators = CREATOR_AGENTS.map((c) => `${c.id}: ${c.name} (${c.specialty})`).join("\n");
  const text = await routedGenerate(
    "challenge_generation",
    runtimeMode,
    "You design AI tournament challenges. Return ONLY valid JSON array.",
    `Round ${round}. Creators:\n${creators}\n\nReturn JSON array with 3 objects:\n[{"creatorId":"strategy|technical|growth","title":"...","brief":"...","topic":"...","difficulty":"easy|medium|hard","noveltyScore":0-100,"feasibilityScore":0-100}]`,
    usage,
    timeline,
    "Generate challenge ideas",
    undefined,
    true,
  );

  type RawIdea = {
    creatorId: CreatorAgentId;
    title: string;
    brief: string;
    topic: string;
    difficulty: "easy" | "medium" | "hard";
    noveltyScore: number;
    feasibilityScore: number;
  };

  const parsed = parseJson<RawIdea[]>(text);
  return parsed.map((item) => {
    const creator = CREATOR_AGENTS.find((c) => c.id === item.creatorId) ?? CREATOR_AGENTS[0]!;
    const novelty = Math.min(100, Math.max(0, Math.round(item.noveltyScore)));
    const feasibility = Math.min(100, Math.max(0, Math.round(item.feasibilityScore)));
    return {
      id: newId(),
      creatorId: creator.id as CreatorAgentId,
      creatorName: creator.name,
      title: item.title,
      brief: item.brief,
      topic: item.topic,
      difficulty: item.difficulty,
      noveltyScore: novelty,
      feasibilityScore: feasibility,
      selectionScore: Math.round(novelty * 0.45 + feasibility * 0.55),
    };
  });
}

async function buildChallengeDocumentRouted(
  idea: ChallengeIdea,
  runtimeMode: TournamentRuntimeMode,
  usage: ProviderUsageEntry[],
  timeline: RoutingTimelineEntry[],
): Promise<Challenge> {
  const passThreshold = idea.difficulty === "easy" ? 62 : idea.difficulty === "hard" ? 72 : 66;
  const decision = modelRouter.route("challenge_generation", runtimeMode);

  if (!decision.usesRealApi) {
    return selectBestChallengeMock([idea]);
  }

  const text = await routedGenerate(
    "challenge_generation",
    runtimeMode,
    "You write fictional source documents for AI benchmarks. Return ONLY JSON.",
    `Create source doc for:\nTitle: ${idea.title}\nBrief: ${idea.brief}\n\nReturn JSON: {"inputDoc":"600+ chars memo","outputFormat":"markdown sections"}`,
    usage,
    timeline,
    "Build challenge document",
    undefined,
    true,
  );

  const parsed = parseJson<{ inputDoc: string; outputFormat?: string }>(text);

  return {
    id: newId(),
    title: idea.title,
    brief: idea.brief,
    inputDoc: parsed.inputDoc,
    outputFormat: parsed.outputFormat ?? "## Executive Summary\n## Key Risks\n## Recommendations",
    passThreshold,
    costLimitUsd: 1.0,
    selectedFrom: idea.creatorId,
    createdAt: new Date().toISOString(),
  };
}

async function runCompetitorAgentRouted(
  agentId: CompetitorAgentId,
  challenge: Challenge,
  round: number,
  runtimeMode: TournamentRuntimeMode,
  usage: ProviderUsageEntry[],
  timeline: RoutingTimelineEntry[],
  agentModels: Record<string, string>,
): Promise<AgentRun> {
  const agent = getCompetitor(agentId);
  const decision = modelRouter.route("competitor_run", runtimeMode, agentId);
  agentModels[agentId] = `${decision.provider}/${decision.model}`;

  if (!decision.usesRealApi) {
    const mockRuns = runCompetitorAgentsMock(challenge, round);
    return mockRuns.find((r) => r.agentId === agentId)!;
  }

  const adapter = getProviderAdapter(decision.provider);
  const t0 = Date.now();
  const result = await adapter.generateText({
    taskType: "competitor_run",
    system: `You are ${agent.name}. Minimize tokens while meeting all required sections.`,
    user: `Challenge: ${challenge.title}\n${challenge.brief}\n\nFormat:\n${challenge.outputFormat}\n\nSource:\n${challenge.inputDoc}`,
    model: decision.model,
    maxTokens: decision.maxTokens,
    temperature: decision.temperature,
  });

  usage.push(recordProviderUsage(result, "competitor_run"));
  pushTimeline(timeline, `Run ${agent.name}`, "competitor_run", decision.provider, decision.model);

  const constitution = buildAgentConstitutionUsage(agentId);

  return {
    id: newId(),
    agentId,
    agentName: agent.name,
    challengeId: challenge.id,
    modelUsed: `${decision.provider}/${result.model}`,
    tokensIn: result.inputTokens,
    tokensOut: result.outputTokens,
    costUsd: result.estimatedCostUsd,
    latencyMs: result.latencyMs || Date.now() - t0,
    workflowSteps: agentId === "premium" ? 3 : agentId === "multi-agent" ? 4 : 1,
    outputPreview: result.text.slice(0, 140).replace(/\n/g, " "),
    fullOutput: result.text,
    ...(constitution
      ? {
          constitutionId: constitution.constitutionId,
          constitutionVersionId: constitution.versionId,
          constitutionVersion: constitution.version,
          promptStrategySummary: constitution.promptStrategySummary,
        }
      : {}),
  };
}

export type RoutedLoopStep = "full" | "generate" | "run" | "evaluate";

export type RoutedLoopOutput = {
  challengeIdeas: ChallengeIdea[];
  selectedChallenge: Challenge | null;
  activeRuns: AgentRun[];
  evaluations: Evaluation[];
  leaderboard: LeaderboardEntry[];
  marketplace: MarketplaceCandidate[];
  history: TournamentEvent[];
  providerUsage: ProviderUsageEntry[];
  routingTimeline: RoutingTimelineEntry[];
  agentModels: Record<string, string>;
  costSavedEstimateUsd: number;
};

export async function runRoutedTournamentStep(
  params: {
    tournamentId: string;
    round: number;
    step: RoutedLoopStep;
    runtimeMode: TournamentRuntimeMode;
    competitorCount: number;
    existing: {
      challengeIdeas: ChallengeIdea[];
      selectedChallenge: Challenge | null;
      activeRuns: AgentRun[];
      evaluations: Evaluation[];
      leaderboard: LeaderboardEntry[];
      marketplace: MarketplaceCandidate[];
      history: TournamentEvent[];
    };
  },
): Promise<RoutedLoopOutput> {
  const {
    tournamentId,
    round,
    step,
    runtimeMode,
    competitorCount,
    existing,
  } = params;

  const history = [...existing.history];
  const providerUsage: ProviderUsageEntry[] = [];
  const routingTimeline: RoutingTimelineEntry[] = [];
  const agentModels: Record<string, string> = {};

  let challengeIdeas = existing.challengeIdeas;
  let selectedChallenge = existing.selectedChallenge;
  let activeRuns = existing.activeRuns;
  let evaluations = existing.evaluations;
  let leaderboard = existing.leaderboard;
  let marketplace = [...existing.marketplace];

  history.unshift(
    event(tournamentId, round, "loop_started", `Round ${round} · ${runtimeMode}`, {
      step,
      runtimeMode,
    }),
  );

  if (step === "full" || step === "generate") {
    challengeIdeas = await generateChallengeIdeasRouted(round, runtimeMode, providerUsage, routingTimeline);
    history.unshift(
      event(tournamentId, round, "challenges_generated", `${challengeIdeas.length} challenge ideas`),
    );
    const best = selectBestChallengeIdea(challengeIdeas);
    selectedChallenge = await buildChallengeDocumentRouted(best, runtimeMode, providerUsage, routingTimeline);
    history.unshift(
      event(tournamentId, round, "challenge_selected", `Selected "${selectedChallenge.title}"`),
    );
  }

  const competitorIds = ALL_COMPETITOR_IDS.slice(0, competitorCount);

  if ((step === "full" || step === "run") && selectedChallenge) {
    activeRuns = await Promise.all(
      competitorIds.map((id) =>
        runCompetitorAgentRouted(
          id,
          selectedChallenge!,
          round,
          runtimeMode,
          providerUsage,
          routingTimeline,
          agentModels,
        ),
      ),
    );
    history.unshift(
      event(tournamentId, round, "agents_running", `${activeRuns.length} competitor runs complete`),
    );
  }

  if ((step === "full" || step === "evaluate") && selectedChallenge && activeRuns.length > 0) {
    const prelimDecision = modelRouter.route("preliminary_judge", runtimeMode);
    if (prelimDecision.usesRealApi) {
      pushTimeline(
        routingTimeline,
        "Preliminary judge",
        "preliminary_judge",
        prelimDecision.provider,
        prelimDecision.model,
      );
    }

    evaluations = evaluateAgentRunsMock(activeRuns, selectedChallenge, round);
    history.unshift(
      event(tournamentId, round, "evaluation_complete", `Scored ${evaluations.length} outputs`, {
        judge: runtimeMode === "hybrid_quality" ? "groq-prelim+mock-final" : "groq+mock",
      }),
    );

    leaderboard = calculateLeaderboard(evaluations, leaderboard, round, activeRuns);
    history.unshift(event(tournamentId, round, "leaderboard_updated", "Leaderboard refreshed"));

    const seeds = createMarketplaceCandidates(tournamentId, round, selectedChallenge, evaluations);
    marketplace = [...seeds, ...marketplace].slice(0, 20);
    history.unshift(event(tournamentId, round, "marketplace_seeded", `${seeds.length} marketplace seeds`));
    history.unshift(
      event(tournamentId, round, "loop_complete", `Round ${round} complete`, {
        winner: [...evaluations].sort((a, b) => b.totalScore - a.totalScore)[0]?.agentName,
      }),
    );
  }

  const totalIn = providerUsage.reduce((s, u) => s + u.inputTokens, 0);
  const totalOut = providerUsage.reduce((s, u) => s + u.outputTokens, 0);
  const actualCost = providerUsage.reduce((s, u) => s + u.estimatedCostUsd, 0);
  const claudeCost = modelRouter.estimateClaudeEquivalentCost(totalIn, totalOut);
  const costSavedEstimateUsd = Math.max(0, Math.round((claudeCost - actualCost) * 10000) / 10000);

  return {
    challengeIdeas,
    selectedChallenge,
    activeRuns,
    evaluations,
    leaderboard,
    marketplace,
    history,
    providerUsage,
    routingTimeline,
    agentModels,
    costSavedEstimateUsd,
  };
}
