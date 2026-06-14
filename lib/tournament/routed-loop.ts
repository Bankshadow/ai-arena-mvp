import { CREATOR_AGENTS, getCompetitor } from "@/lib/tournament/agents";
import {
  calculateLeaderboard,
  createMarketplaceCandidates,
  generateChallengeIdeasMock,
  newId,
  runCompetitorAgentsMock,
  selectBestChallengeMock,
} from "@/lib/tournament/engine-mock";
import { buildAgentConstitutionUsage } from "@/lib/constitution/tournament-bridge";
import { selectBestChallengeIdea } from "@/lib/tournament/llm";
import {
  evaluateAgentRunsHybrid,
  finalJudgeLabel,
} from "@/lib/tournament/judge/hybrid-evaluator";
import { modelRouter } from "@/lib/tournament/router/model-router";
import {
  executeRoutedTask,
  recordMarketplaceSummaryStep,
} from "@/lib/tournament/router/execute-routed-task";
import { ProviderUsageLogger } from "@/lib/tournament/usage/usage-logger";
import type {
  GuardAssessment,
  ProviderUsageEntry,
  RoutingTimelineEntry,
  TournamentRuntimeMode,
} from "@/lib/tournament/routing/types";
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
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/```\s*$/i, "");
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

async function generateChallengeIdeasRouted(
  round: number,
  runtimeMode: TournamentRuntimeMode,
  usage: ProviderUsageEntry[],
  timeline: RoutingTimelineEntry[],
  logger: ProviderUsageLogger,
  tournamentId: string,
): Promise<ChallengeIdea[]> {
  const decision = modelRouter.route("challenge_generation", runtimeMode);
  if (!decision.usesRealApi) {
    return generateChallengeIdeasMock(round);
  }

  const creators = CREATOR_AGENTS.map((c) => `${c.id}: ${c.name} (${c.specialty})`).join("\n");

  try {
    const { text } = await executeRoutedTask({
      taskType: "challenge_generation",
      runtimeMode,
      system: "You design AI tournament challenges. Return ONLY valid JSON array.",
      user: `Round ${round}. Creators:\n${creators}\n\nReturn JSON array with 3 objects:\n[{"creatorId":"strategy|technical|growth","title":"...","brief":"...","topic":"...","difficulty":"easy|medium|hard","noveltyScore":0-100,"feasibilityScore":0-100}]`,
      step: "Generate challenge ideas",
      jsonMode: true,
      usage,
      timeline,
      logger,
      tournamentId,
      round,
    });

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
  } catch {
    return generateChallengeIdeasMock(round);
  }
}

async function buildChallengeDocumentRouted(
  idea: ChallengeIdea,
  runtimeMode: TournamentRuntimeMode,
  usage: ProviderUsageEntry[],
  timeline: RoutingTimelineEntry[],
  logger: ProviderUsageLogger,
  tournamentId: string,
  round: number,
): Promise<Challenge> {
  const passThreshold = idea.difficulty === "easy" ? 62 : idea.difficulty === "hard" ? 72 : 66;
  const decision = modelRouter.route("challenge_generation", runtimeMode);

  if (!decision.usesRealApi) {
    return selectBestChallengeMock([idea]);
  }

  try {
    const { text } = await executeRoutedTask({
      taskType: "challenge_generation",
      runtimeMode,
      system: "You write fictional source documents for AI benchmarks. Return ONLY JSON.",
      user: `Create source doc for:\nTitle: ${idea.title}\nBrief: ${idea.brief}\n\nReturn JSON: {"inputDoc":"600+ chars memo","outputFormat":"markdown sections"}`,
      step: "Build challenge document",
      jsonMode: true,
      usage,
      timeline,
      logger,
      tournamentId,
      round,
    });

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
  } catch {
    return selectBestChallengeMock([idea]);
  }
}

async function runCompetitorAgentRouted(
  agentId: CompetitorAgentId,
  challenge: Challenge,
  round: number,
  runtimeMode: TournamentRuntimeMode,
  usage: ProviderUsageEntry[],
  timeline: RoutingTimelineEntry[],
  agentModels: Record<string, string>,
  logger: ProviderUsageLogger,
  tournamentId: string,
): Promise<AgentRun> {
  const agent = getCompetitor(agentId);
  const decision = modelRouter.route("competitor_run", runtimeMode, agentId);
  agentModels[agentId] = `${decision.provider}/${decision.model}`;

  if (!decision.usesRealApi) {
    const mockRuns = runCompetitorAgentsMock(challenge, round);
    return mockRuns.find((r) => r.agentId === agentId)!;
  }

  const t0 = Date.now();
  const { result } = await executeRoutedTask({
    taskType: "competitor_run",
    runtimeMode,
    system: `You are ${agent.name}. Minimize tokens while meeting all required sections.`,
    user: `Challenge: ${challenge.title}\n${challenge.brief}\n\nFormat:\n${challenge.outputFormat}\n\nSource:\n${challenge.inputDoc}`,
    step: `Run ${agent.name}`,
    agentId,
    usage,
    timeline,
    logger,
    tournamentId,
    round,
  });

  const constitution = buildAgentConstitutionUsage(agentId);

  return {
    id: newId(),
    agentId,
    agentName: agent.name,
    challengeId: challenge.id,
    modelUsed: `${result.provider}/${result.model}`,
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
    guard?: GuardAssessment | null;
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
  const { tournamentId, round, step, runtimeMode, competitorCount, guard, existing } = params;

  const history = [...existing.history];
  const providerUsage: ProviderUsageEntry[] = [];
  const routingTimeline: RoutingTimelineEntry[] = [];
  const agentModels: Record<string, string> = {};
  const logger = new ProviderUsageLogger({ tournamentId, round, runtimeMode });

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
    challengeIdeas = await generateChallengeIdeasRouted(
      round,
      runtimeMode,
      providerUsage,
      routingTimeline,
      logger,
      tournamentId,
    );
    history.unshift(
      event(tournamentId, round, "challenges_generated", `${challengeIdeas.length} challenge ideas`),
    );
    const best = selectBestChallengeIdea(challengeIdeas);
    selectedChallenge = await buildChallengeDocumentRouted(
      best,
      runtimeMode,
      providerUsage,
      routingTimeline,
      logger,
      tournamentId,
      round,
    );
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
          logger,
          tournamentId,
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
      routingTimeline.push({
        step: "Preliminary judge",
        taskType: "preliminary_judge",
        provider: prelimDecision.provider,
        model: prelimDecision.model,
        timestamp: new Date().toISOString(),
      });
    }

    evaluations = await evaluateAgentRunsHybrid(activeRuns, selectedChallenge, round, {
      tournamentId,
      round,
      runtimeMode,
      usage: providerUsage,
      timeline: routingTimeline,
      logger,
      guard: guard ?? null,
    });
    history.unshift(
      event(tournamentId, round, "evaluation_complete", `Scored ${evaluations.length} outputs`, {
        judge: finalJudgeLabel(runtimeMode, guard ?? null),
      }),
    );

    leaderboard = calculateLeaderboard(evaluations, leaderboard, round, activeRuns);
    history.unshift(event(tournamentId, round, "leaderboard_updated", "Leaderboard refreshed"));

    const seeds = createMarketplaceCandidates(tournamentId, round, selectedChallenge, evaluations);
    marketplace = [...seeds, ...marketplace].slice(0, 20);
    history.unshift(event(tournamentId, round, "marketplace_seeded", `${seeds.length} marketplace seeds`));

    recordMarketplaceSummaryStep(runtimeMode, routingTimeline, round, seeds.length);
    history.unshift(
      event(tournamentId, round, "loop_complete", `Round ${round} complete`, {
        winner: [...evaluations].sort((a, b) => b.totalScore - a.totalScore)[0]?.agentName,
      }),
    );
  }

  await logger.logBatch(providerUsage);

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
