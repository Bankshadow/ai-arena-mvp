import { hasAnthropicKey, hasGroqKey } from "@/lib/env";
import { buildDefaultConstitutionMeta, finalizeConstitutionMetaFromEvaluations } from "@/lib/constitution/tournament-bridge";
import { runMemoryCompilePipeline } from "@/lib/memory/pipeline";
import {
  calculateLeaderboard,
  createMarketplaceCandidates,
  evaluateAgentRunsMock,
  generateChallengeIdeasMock,
  newId,
  runCompetitorAgentsMock,
  selectBestChallengeMock,
} from "@/lib/tournament/engine-mock";
import { runTournamentLoopWithRouting } from "@/lib/tournament/loop-service";
import type { TournamentRuntimeMode } from "@/lib/tournament/routing/types";
import { DEFAULT_RUNTIME_MODE } from "@/lib/tournament/routing/types";
import type {
  Tournament,
  TournamentEvent,
  TournamentLoopResult,
  TournamentState,
} from "@/lib/tournament/types";
import { COMPETITOR_AGENTS, getCreator } from "@/lib/tournament/agents";
import type { CompetitorAgentId } from "@/lib/tournament/types";

import { TOURNAMENT_LOOP_MS } from "@/lib/tournament/constants";

export type LoopStep = "full" | "generate" | "run" | "evaluate";
export type TournamentMode = "live" | "mock";

export { getLoopIntervalMs } from "@/lib/tournament/constants";

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

/** Sync mock loop — client fallback only. */
export function runTournamentLoop(
  state: TournamentState,
  step: LoopStep = "full",
): TournamentLoopResult {
  return runTournamentLoopSync(state, step);
}

function runTournamentLoopSync(state: TournamentState, step: LoopStep): TournamentLoopResult {
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

  history.unshift(event(tournamentId, round, "loop_started", `Tournament round ${round} started`, { step, mode: "mock" }));

  if (step === "full" || step === "generate") {
    challengeIdeas = generateChallengeIdeasMock(round);
    history.unshift(event(tournamentId, round, "challenges_generated", `${challengeIdeas.length} challenge ideas from creator agents`));
    selectedChallenge = selectBestChallengeMock(challengeIdeas);
    history.unshift(event(tournamentId, round, "challenge_selected", `Selected "${selectedChallenge.title}" from ${getCreator(selectedChallenge.selectedFrom).name}`));
  }

  if ((step === "full" || step === "run") && selectedChallenge) {
    activeRuns = runCompetitorAgentsMock(selectedChallenge, round);
    history.unshift(event(tournamentId, round, "agents_running", `${activeRuns.length} competitor agents completed runs`));
  }

  if ((step === "full" || step === "evaluate") && selectedChallenge && activeRuns.length > 0) {
    evaluations = evaluateAgentRunsMock(activeRuns, selectedChallenge, round);
    history.unshift(event(tournamentId, round, "evaluation_complete", `Quality Judge + Efficiency Judge scored ${evaluations.length} outputs`));
    leaderboard = calculateLeaderboard(evaluations, leaderboard, round, activeRuns);
    history.unshift(event(tournamentId, round, "leaderboard_updated", "Live leaderboard refreshed", { leader: leaderboard[0]?.agentName }));
    const seeds = createMarketplaceCandidates(tournamentId, round, selectedChallenge, evaluations);
    marketplace = [...seeds, ...marketplace].slice(0, 20);
    history.unshift(event(tournamentId, round, "marketplace_seeded", `${seeds.length} marketplace candidates created`));
    history.unshift(event(tournamentId, round, "loop_complete", `Round ${round} complete`, { winner: evaluations.sort((a, b) => b.totalScore - a.totalScore)[0]?.agentName }));
  }

  return finalizeLoop(state, step, round, {
    challengeIdeas,
    selectedChallenge,
    activeRuns,
    evaluations,
    leaderboard,
    marketplace,
    history,
  });
}

/** Server-side loop — multi-provider routing (default: mock). */
export async function runTournamentLoopAsync(
  state: TournamentState,
  step: LoopStep = "full",
  runtimeMode: TournamentRuntimeMode = state.routing?.runtimeMode ?? DEFAULT_RUNTIME_MODE,
): Promise<TournamentLoopResult & { mode: TournamentMode; engineLabel?: TournamentRuntimeMode }> {
  return runTournamentLoopWithRouting(state, step, runtimeMode);
}

function finalizeLoop(
  state: TournamentState,
  step: LoopStep,
  round: number,
  data: {
    challengeIdeas: Tournament["challengeIdeas"];
    selectedChallenge: Tournament["selectedChallenge"];
    activeRuns: Tournament["activeRuns"];
    evaluations: Tournament["evaluations"];
    leaderboard: TournamentState["leaderboard"];
    marketplace: TournamentState["marketplace"];
    history: TournamentEvent[];
  },
): TournamentLoopResult {
  const now = new Date().toISOString();
  const t = state.tournament;

  const base: TournamentLoopResult = {
    tournament: {
      ...t,
      round: step === "full" ? round : t.round,
      phase: step === "full" || step === "evaluate" ? "complete" : step === "run" ? "running" : "generating",
      startedAt: t.startedAt ?? now,
      completedAt: step === "full" || step === "evaluate" ? now : t.completedAt,
      challengeIdeas: data.challengeIdeas,
      selectedChallenge: data.selectedChallenge,
      activeRuns: data.activeRuns,
      evaluations: data.evaluations,
      nextRunAt: new Date(Date.now() + TOURNAMENT_LOOP_MS).toISOString(),
    },
    leaderboard: data.leaderboard,
    history: data.history.slice(0, 100),
    marketplace: data.marketplace,
    routing: state.routing,
    constitution: finalizeConstitutionMetaFromEvaluations(
      state.constitution ?? buildDefaultConstitutionMeta(),
      data.evaluations,
    ),
  };

  if (data.evaluations.length > 0 && (step === "full" || step === "evaluate")) {
    const mem = runMemoryCompilePipeline(base);
    return { ...base, memory: mem.meta };
  }

  return { ...base, memory: state.memory };
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
      event(id, 0, "manual_run", "Tournament engine initialized", {
        mode: hasGroqKey() ? "groq-ready" : hasAnthropicKey() ? "anthropic-ready" : "mock",
        defaultRuntimeMode: DEFAULT_RUNTIME_MODE,
      }),
    ],
    marketplace: [],
    routing: {
      runtimeMode: DEFAULT_RUNTIME_MODE,
      guard: null,
      routingTimeline: [],
      providerUsage: [],
      costSavedEstimateUsd: 0,
      agentModels: {},
    },
    constitution: buildDefaultConstitutionMeta("standard"),
  };
}

// Re-export mock helpers used elsewhere
export {
  calculateLeaderboard,
  createMarketplaceCandidates,
  generateChallengeIdeasMock,
  selectBestChallengeMock,
};
