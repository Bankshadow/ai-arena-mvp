import type { LoopStep } from "@/lib/tournament/engine";
import { getLoopIntervalMs } from "@/lib/tournament/constants";
import { runMemoryCompilePipeline } from "@/lib/memory/pipeline";
import type { MemoryKnowledgeBase } from "@/lib/memory/store";
import {
  buildDefaultConstitutionMeta,
  finalizeConstitutionMetaFromEvaluations,
} from "@/lib/constitution/tournament-bridge";
import { newId } from "@/lib/tournament/engine-mock";
import { rateLimitGuard } from "@/lib/tournament/guard/rate-limit-guard";
import { runRoutedTournamentStep } from "@/lib/tournament/routed-loop";
import type {
  TournamentRoutingMeta,
  TournamentRuntimeMode,
} from "@/lib/tournament/routing/types";
import type { TournamentEvent, TournamentLoopResult, TournamentState } from "@/lib/tournament/types";

const LOOP_MS = getLoopIntervalMs();

function competitorCountForGuard(
  guard: ReturnType<typeof rateLimitGuard.assess>,
  requested: number,
): number {
  if (guard.recommendedAction === "reduce_competitors") {
    return Math.min(requested, 3);
  }
  return requested;
}

function finalizeFromRouted(
  state: TournamentState,
  step: LoopStep,
  round: number,
  runtimeMode: TournamentRuntimeMode,
  routed: Awaited<ReturnType<typeof runRoutedTournamentStep>>,
  guard: ReturnType<typeof rateLimitGuard.assess>,
): { result: TournamentLoopResult; memoryKb?: Partial<MemoryKnowledgeBase> } {
  const now = new Date().toISOString();
  const t = state.tournament;

  const routing: TournamentRoutingMeta = {
    runtimeMode,
    guard,
    routingTimeline: routed.routingTimeline,
    providerUsage: [...(state.routing?.providerUsage ?? []), ...routed.providerUsage].slice(-50),
    costSavedEstimateUsd:
      (state.routing?.costSavedEstimateUsd ?? 0) + routed.costSavedEstimateUsd,
    agentModels: { ...state.routing?.agentModels, ...routed.agentModels },
  };

  const constitution = finalizeConstitutionMetaFromEvaluations(
    state.constitution ?? buildDefaultConstitutionMeta(),
    routed.evaluations,
  );

  const partialState: TournamentState = {
    tournament: {
      ...t,
      round: step === "full" ? round : t.round,
      phase: step === "full" || step === "evaluate" ? "complete" : step === "run" ? "running" : "generating",
      startedAt: t.startedAt ?? now,
      completedAt: step === "full" || step === "evaluate" ? now : t.completedAt,
      challengeIdeas: routed.challengeIdeas,
      selectedChallenge: routed.selectedChallenge,
      activeRuns: routed.activeRuns,
      evaluations: routed.evaluations,
      nextRunAt: new Date(Date.now() + LOOP_MS).toISOString(),
    },
    leaderboard: routed.leaderboard,
    history: routed.history.slice(0, 100),
    marketplace: routed.marketplace,
    routing,
    constitution,
  };

  const memoryResult =
    routed.evaluations.length > 0 && (step === "full" || step === "evaluate")
      ? runMemoryCompilePipeline(partialState)
      : null;

  return {
    result: {
      ...partialState,
      memory: memoryResult?.meta ?? state.memory,
    },
    memoryKb: memoryResult?.knowledgeBase,
  };
}

export type LoopServiceResult = TournamentLoopResult & {
  mode: "mock" | "live";
  engineLabel: TournamentRuntimeMode;
  memoryKb?: Partial<MemoryKnowledgeBase>;
};

export async function runTournamentLoopWithRouting(
  state: TournamentState,
  step: LoopStep = "full",
  runtimeMode: TournamentRuntimeMode = "mock",
): Promise<LoopServiceResult> {
  const t = state.tournament;
  const round = step === "full" ? t.round + 1 : t.round || 1;

  const guard = rateLimitGuard.assess({
    runtimeMode,
    competitorCount: 5,
    includeFinalJudge: runtimeMode === "hybrid_quality",
  });

  if (!guard.canRun && runtimeMode !== "mock") {
    const fallback = await runTournamentLoopWithRouting(state, step, "mock");
    const guardEvent: TournamentEvent = {
      id: newId(),
      tournamentId: t.id,
      round,
      type: "manual_run",
      message: `Rate limit guard blocked ${runtimeMode}: ${guard.message}. Ran mock instead.`,
      timestamp: new Date().toISOString(),
      meta: { guard },
    };
    return {
      ...fallback,
      history: [guardEvent, ...fallback.history].slice(0, 100),
    };
  }

  const competitors = competitorCountForGuard(guard, 5);

  try {
    const routed = await runRoutedTournamentStep({
      tournamentId: t.id,
      round,
      step,
      runtimeMode,
      competitorCount: competitors,
      existing: {
        challengeIdeas: t.challengeIdeas,
        selectedChallenge: t.selectedChallenge,
        activeRuns: t.activeRuns,
        evaluations: t.evaluations,
        leaderboard: state.leaderboard,
        marketplace: state.marketplace,
        history: state.history,
      },
    });

    const { result, memoryKb } = finalizeFromRouted(state, step, round, runtimeMode, routed, guard);

    return {
      ...result,
      mode: runtimeMode === "mock" ? "mock" : "live",
      engineLabel: runtimeMode,
      memoryKb,
    };
  } catch (err) {
    if (runtimeMode === "mock") throw err;
    const message = err instanceof Error ? err.message : String(err);
    const fallback = await runTournamentLoopWithRouting(state, step, "mock");
    const fallbackEvent: TournamentEvent = {
      id: newId(),
      tournamentId: t.id,
      round,
      type: "manual_run",
      message: `${runtimeMode} failed (${message}) — fell back to mock`,
      timestamp: new Date().toISOString(),
    };
    return {
      ...fallback,
      history: [fallbackEvent, ...fallback.history].slice(0, 100),
      engineLabel: "mock",
    };
  }
}
