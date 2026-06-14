"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { TournamentCommandBar } from "@/components/tournament/os/tournament-command-bar";
import { TournamentOpsRail } from "@/components/tournament/os/tournament-ops-rail";
import { TournamentPhaseNav } from "@/components/tournament/os/tournament-phase-nav";
import { TournamentSystemsDrawer } from "@/components/tournament/os/tournament-systems-drawer";
import { AgentsStage } from "@/components/tournament/os/stages/agents-stage";
import { ChallengeStage } from "@/components/tournament/os/stages/challenge-stage";
import { JudgingStage } from "@/components/tournament/os/stages/judging-stage";
import { LeaderboardStage } from "@/components/tournament/os/stages/leaderboard-stage";
import { MarketplaceProofStage } from "@/components/tournament/os/stages/marketplace-proof-stage";
import { OverviewStage } from "@/components/tournament/os/stages/overview-stage";
import {
  phaseAnchorId,
  TOURNAMENT_PHASES,
  type TournamentPhase,
} from "@/components/tournament/os/types";
import { TournamentJoinEvents } from "@/components/tournament/tournament-join-events";
import { useMemory } from "@/components/memory/memory-provider";
import type { MemoryKnowledgeBase } from "@/lib/memory/store";
import { runMemoryCompilePipeline } from "@/lib/memory/pipeline";
import { useTranslations } from "@/components/i18n/locale-provider";
import { Nav } from "@/components/Nav";
import {
  createInitialTournamentState,
  getLoopIntervalMs,
  runTournamentLoop,
  type LoopStep,
  type TournamentMode,
} from "@/lib/tournament/engine";
import { enrichLegacyCandidates } from "@/lib/marketplace/candidate-detector";
import { createSampleTournamentState } from "@/lib/tournament/sample-round";
import {
  buildFlowTimeline,
  DEMO_MARKETPLACE_COUNT,
} from "@/lib/tournament/mission-control-demo";
import { getTournamentViewMode } from "@/lib/tournament/view-mode-labels";
import { getRoundWinner } from "@/lib/tournament/winner-narrative";
import { DEFAULT_RUNTIME_MODE, type TournamentRuntimeMode } from "@/lib/tournament/routing/types";
import {
  readTournamentAdminSettings,
  resolveTournamentRuntimeMode,
} from "@/lib/tournament/admin-settings";
import type { TournamentEvent, TournamentState } from "@/lib/tournament/types";
import { upsertLocalTournamentRound } from "@/lib/tournament/local-storage";
import {
  buildSavedTournamentRecord,
  shouldAutoSaveTournament,
} from "@/lib/tournament/saved-tournament";

type EngineStatus = {
  llmAvailable: boolean;
  groqAvailable: boolean;
  premiumAvailable: boolean;
  supabaseConfigured: boolean;
  supabaseTableReady: boolean;
  supabaseCanSave: boolean;
  supabaseError: string | null;
  supabaseHint: string | null;
};

function deriveCompletedPhases(state: TournamentState): Partial<Record<TournamentPhase, boolean>> {
  const t = state.tournament;
  return {
    overview: true,
    challenge: t.challengeIdeas.length > 0 || Boolean(t.selectedChallenge),
    agents: t.activeRuns.length > 0,
    judging: t.evaluations.length > 0,
    leaderboard: state.leaderboard.length > 0,
    "marketplace-proof":
      state.marketplace.length > 0 || enrichLegacyCandidates(state).length > 0,
  };
}

export function TournamentView() {
  const t = useTranslations();
  const th = t.tournament.header;
  const { mergeKb } = useMemory();
  const [sampleMode, setSampleMode] = useState(true);
  const [replayMode, setReplayMode] = useState(false);
  const [state, setState] = useState<TournamentState>(() => createSampleTournamentState());
  const [busy, setBusy] = useState(false);
  const [countdownSec, setCountdownSec] = useState<number | null>(null);
  const [persistMessage, setPersistMessage] = useState<string | null>(null);
  const [engineMode, setEngineMode] = useState<TournamentMode>("mock");
  const [runtimeMode, setRuntimeMode] = useState<TournamentRuntimeMode>(() =>
    readTournamentAdminSettings().defaultRuntimeMode,
  );
  const [activePhase, setActivePhase] = useState<TournamentPhase>("overview");
  const [engineStatus, setEngineStatus] = useState<EngineStatus>({
    llmAvailable: false,
    groqAvailable: false,
    premiumAvailable: false,
    supabaseConfigured: false,
    supabaseTableReady: false,
    supabaseCanSave: false,
    supabaseError: null,
    supabaseHint: null,
  });
  const stateRef = useRef(state);
  const runtimeModeRef = useRef(runtimeMode);
  const nextRunRef = useRef<number | null>(null);

  stateRef.current = state;
  runtimeModeRef.current = runtimeMode;

  useEffect(() => {
    fetch("/api/tournament/status")
      .then((r) => r.json())
      .then((data: EngineStatus & { defaultRuntimeMode?: TournamentRuntimeMode }) => {
        setEngineStatus(data);
        const adminMode = readTournamentAdminSettings().defaultRuntimeMode;
        const effective = resolveTournamentRuntimeMode(
          adminMode ?? data.defaultRuntimeMode ?? DEFAULT_RUNTIME_MODE,
          data.groqAvailable,
          data.premiumAvailable ?? data.llmAvailable,
        );
        setRuntimeMode(effective);
        setState((s) => ({
          ...s,
          routing: s.routing
            ? { ...s.routing, runtimeMode: effective }
            : {
                runtimeMode: effective,
                guard: null,
                routingTimeline: [],
                providerUsage: [],
                costSavedEstimateUsd: 0,
                agentModels: {},
              },
        }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    TOURNAMENT_PHASES.forEach((phase) => {
      const el = document.getElementById(phaseAnchorId(phase));
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
              setActivePhase(phase);
            }
          });
        },
        { rootMargin: "-40% 0px -45% 0px", threshold: [0.25, 0.5] },
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const applyLoopResult = useCallback(
    (result: TournamentState, mode?: TournamentMode, label?: TournamentRuntimeMode) => {
      setState(result);
      if (mode) setEngineMode(mode);
      if (label) setRuntimeMode(label);
      if (result.routing?.runtimeMode) setRuntimeMode(result.routing.runtimeMode);
      nextRunRef.current = Date.now() + getLoopIntervalMs();
    },
    [],
  );

  const runStepViaApi = useCallback(async (step: LoopStep): Promise<boolean> => {
    const res = await fetch("/api/tournament/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        state: stateRef.current,
        step,
        runtimeMode: runtimeModeRef.current,
      }),
    });

    if (!res.ok) return false;

    const data = (await res.json()) as TournamentState & {
      mode?: TournamentMode;
      engineLabel?: TournamentRuntimeMode;
      savedRoundId?: string | null;
      persistError?: string | null;
      memoryKb?: Partial<MemoryKnowledgeBase>;
    };
    const nextState: TournamentState = {
      tournament: data.tournament,
      leaderboard: data.leaderboard,
      history: data.history,
      marketplace: data.marketplace,
      routing: data.routing,
      constitution: data.constitution,
      memory: data.memory,
    };
    if (data.memoryKb) mergeKb(data.memoryKb);
    applyLoopResult(nextState, data.mode, data.engineLabel ?? runtimeModeRef.current);

    if (shouldAutoSaveTournament(nextState)) {
      const mode = data.mode ?? "mock";
      const record = buildSavedTournamentRecord(
        nextState,
        mode,
        data.savedRoundId ?? undefined,
      );
      upsertLocalTournamentRound(record);

      if (data.savedRoundId) {
        setPersistMessage(`Round ${record.round} auto-saved to Supabase`);
      } else if (data.persistError) {
        setPersistMessage(`Supabase save failed: ${data.persistError}`);
      } else if (!engineStatus.supabaseCanSave) {
        setPersistMessage(`Round ${record.round} saved locally (Supabase not ready)`);
      } else {
        setPersistMessage(`Round ${record.round} saved locally`);
      }
    }
    return true;
  }, [applyLoopResult, mergeKb, engineStatus.supabaseCanSave]);

  const runStep = useCallback(
    async (step: LoopStep) => {
      setSampleMode(false);
      setReplayMode(false);
      setBusy(true);
      try {
        const ok = await runStepViaApi(step);
        if (!ok) {
          setState((prev) => {
            const next = runTournamentLoop(prev, step);
            if (next.memory?.compiled_at) {
              const { knowledgeBase } = runMemoryCompilePipeline(next);
              mergeKb(knowledgeBase);
            }
            if (shouldAutoSaveTournament(next)) {
              const record = buildSavedTournamentRecord(next, "mock");
              upsertLocalTournamentRound(record);
              setPersistMessage(`Round ${record.round} saved locally (offline mock)`);
            }
            return next;
          });
          setEngineMode("mock");
          nextRunRef.current = Date.now() + getLoopIntervalMs();
        }
      } catch {
        setState((prev) => {
          const next = runTournamentLoop(prev, step);
          if (next.memory?.compiled_at) {
            const { knowledgeBase } = runMemoryCompilePipeline(next);
            mergeKb(knowledgeBase);
          }
          if (shouldAutoSaveTournament(next)) {
            const record = buildSavedTournamentRecord(next, "mock");
            upsertLocalTournamentRound(record);
            setPersistMessage(`Round ${record.round} saved locally (offline mock)`);
          }
          return next;
        });
        setEngineMode("mock");
        nextRunRef.current = Date.now() + getLoopIntervalMs();
      } finally {
        setBusy(false);
      }
    },
    [runStepViaApi, mergeKb],
  );

  const appendEvent = useCallback((ev: TournamentEvent) => {
    setState((prev) => ({ ...prev, history: [ev, ...prev.history].slice(0, 100) }));
  }, []);

  useEffect(() => {
    if (state.tournament.paused) {
      setCountdownSec(null);
      return;
    }

    nextRunRef.current = nextRunRef.current ?? Date.now() + getLoopIntervalMs();

    const tick = setInterval(() => {
      if (nextRunRef.current === null || busy) return;
      const remaining = Math.max(0, Math.ceil((nextRunRef.current - Date.now()) / 1000));
      setCountdownSec(remaining);
      if (remaining === 0) {
        void runStep("full");
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [state.tournament.paused, busy, runStep]);

  const selectedIdeaId =
    state.tournament.challengeIdeas.length > 0
      ? state.tournament.challengeIdeas.reduce((best, idea) =>
          !best || idea.selectionScore > best.selectionScore ? idea : best,
        ).id
      : null;

  const viewMode = getTournamentViewMode(state, { sampleMode, replayMode });
  const flowSteps = buildFlowTimeline(state);
  const marketplaceCount = Math.max(
    state.marketplace.length,
    enrichLegacyCandidates(state).length,
    DEMO_MARKETPLACE_COUNT,
  );
  const winner = getRoundWinner(
    state.tournament.evaluations,
    state.tournament.activeRuns,
    state.leaderboard,
  );
  const completedPhases = deriveCompletedPhases(state);

  const handlePause = () => {
    setState((s) => ({
      ...s,
      tournament: { ...s.tournament, paused: true },
    }));
    appendEvent({
      id: crypto.randomUUID(),
      tournamentId: state.tournament.id,
      round: state.tournament.round,
      type: "paused",
      message: "Auto loop paused",
      timestamp: new Date().toISOString(),
    });
  };

  const handleResume = () => {
    nextRunRef.current = Date.now() + getLoopIntervalMs();
    setState((s) => ({
      ...s,
      tournament: { ...s.tournament, paused: false },
    }));
    appendEvent({
      id: crypto.randomUUID(),
      tournamentId: state.tournament.id,
      round: state.tournament.round,
      type: "resumed",
      message: "Auto loop resumed",
      timestamp: new Date().toISOString(),
    });
  };

  const handleSave = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/tournament/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: stateRef.current, mode: engineMode }),
      });
      const result = (await res.json()) as {
        ok: boolean;
        message: string;
        savedAt: string;
      };
      setPersistMessage(result.ok ? result.message : `Supabase save failed: ${result.message}`);
      appendEvent({
        id: crypto.randomUUID(),
        tournamentId: state.tournament.id,
        round: state.tournament.round,
        type: "supabase_save",
        message: result.message,
        timestamp: result.savedAt,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      setPersistMessage(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(167,139,250,0.15),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6">
        <header className="mb-2">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-violet-400/90">
            {th.eyebrow}
          </p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{th.title}</h1>
        </header>

        <TournamentJoinEvents />

        <TournamentCommandBar
          tournament={state.tournament}
          viewMode={viewMode}
          runtimeMode={runtimeMode}
          countdownSec={countdownSec}
          winner={winner}
          busy={busy}
          onRunNow={() => runStep("full")}
        />

        <TournamentPhaseNav
          activePhase={activePhase}
          completedPhases={completedPhases}
          onPhaseClick={setActivePhase}
        />

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 space-y-8">
            <OverviewStage
              tournament={state.tournament}
              flowSteps={flowSteps}
              viewMode={viewMode}
              engineMode={engineMode}
              runtimeMode={runtimeMode}
              countdownSec={countdownSec}
              persistMessage={persistMessage}
              persistIsError={persistMessage?.startsWith("Supabase save failed") ?? false}
              supabaseConfigured={engineStatus.supabaseConfigured}
              supabaseTableReady={engineStatus.supabaseTableReady}
              supabaseHint={engineStatus.supabaseHint}
              marketplaceCount={marketplaceCount}
              memoryLessons={state.memory?.lessons_updated}
              winner={winner}
              busy={busy}
              sampleMode={sampleMode}
              replayMode={replayMode}
              onRunNow={() => runStep("full")}
              onReplay={() => {
                setSampleMode(true);
                setReplayMode(true);
                setState(createSampleTournamentState());
                setPersistMessage(null);
              }}
              onSwitchLive={() => {
                setSampleMode(false);
                setReplayMode(false);
                setState(createInitialTournamentState());
                setPersistMessage(null);
              }}
              onSetReplay={() => setReplayMode(true)}
              onSetSampleOff={() => {
                setSampleMode(false);
                setReplayMode(false);
                setState(createInitialTournamentState());
                setPersistMessage(null);
              }}
            />

            <ChallengeStage
              ideas={state.tournament.challengeIdeas}
              selectedChallenge={state.tournament.selectedChallenge}
              roundSelectedIdeaId={selectedIdeaId}
            />

            <AgentsStage
              runs={state.tournament.activeRuns}
              evaluations={state.tournament.evaluations}
              agentModels={state.routing?.agentModels}
              viewMode={viewMode}
            />

            <JudgingStage
              evaluations={state.tournament.evaluations}
              runs={state.tournament.activeRuns}
            />

            <LeaderboardStage
              entries={state.leaderboard}
              viewMode={viewMode}
              winner={winner}
              round={state.tournament.round}
            />

            <MarketplaceProofStage
              state={state}
              winner={winner}
              marketplaceCount={marketplaceCount}
            />

            <TournamentSystemsDrawer
              flowSteps={flowSteps}
              memory={state.memory}
              events={state.history}
              evaluations={state.tournament.evaluations}
              leaderboard={state.leaderboard}
              constitution={state.constitution}
              activeRuns={state.tournament.activeRuns}
              onPromoteMarketplace={() => {
                setPersistMessage("Constitution marked as marketplace candidate (mock — local only)");
              }}
            />
          </div>

          <TournamentOpsRail
            busy={busy}
            paused={state.tournament.paused}
            onRunFull={() => runStep("full")}
            onPause={handlePause}
            onResume={handleResume}
            onGenerateOnly={() => runStep("generate")}
            onRunAgentsOnly={() => runStep("run")}
            onEvaluateOnly={() => runStep("evaluate")}
            onSave={handleSave}
            routing={state.routing}
            groqAvailable={engineStatus.groqAvailable}
            premiumAvailable={engineStatus.premiumAvailable}
            persistMessage={persistMessage}
            persistIsError={persistMessage?.startsWith("Supabase save failed") ?? false}
            supabaseConfigured={engineStatus.supabaseConfigured}
            supabaseTableReady={engineStatus.supabaseTableReady}
            supabaseHint={engineStatus.supabaseHint}
          />
        </div>
      </main>
    </div>
  );
}
