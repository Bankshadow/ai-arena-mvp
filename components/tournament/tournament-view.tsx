"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Radio } from "lucide-react";

import { AdminControls } from "@/components/tournament/admin-controls";
import { ActiveBattlePanel } from "@/components/tournament/active-battle-panel";
import { AgentPerformanceAnalytics } from "@/components/tournament/agent-performance-analytics";
import { ChallengeGeneratorSection } from "@/components/tournament/challenge-generator-section";
import { LiveLeaderboard } from "@/components/tournament/live-leaderboard";
import { MarketplaceSeedPanel } from "@/components/tournament/marketplace-seed-panel";
import { TournamentHistory } from "@/components/tournament/tournament-history";
import { ConstitutionTournamentPanel } from "@/components/tournament/constitution-tournament-panel";
import { MemoryTournamentPanel } from "@/components/tournament/memory-tournament-panel";
import { useMemory } from "@/components/memory/memory-provider";
import type { MemoryKnowledgeBase } from "@/lib/memory/store";
import { runMemoryCompilePipeline } from "@/lib/memory/pipeline";
import { TournamentJoinEvents } from "@/components/tournament/tournament-join-events";
import { TournamentStatusCard } from "@/components/tournament/tournament-status-card";
import { Nav } from "@/components/Nav";
import {
  createInitialTournamentState,
  getLoopIntervalMs,
  runTournamentLoop,
  type LoopStep,
  type TournamentMode,
} from "@/lib/tournament/engine";
import { createSampleTournamentState, SAMPLE_TOURNAMENT_ROUND_ID } from "@/lib/tournament/sample-round";
import {
  buildFlowTimeline,
  getTournamentViewMode,
} from "@/lib/tournament/mission-control-demo";
import { ScoreHelp } from "@/components/scoring/score-help";
import { MissionControlRoutingSection } from "@/components/tournament/mission-control-routing-section";
import { TournamentFlowTimeline } from "@/components/tournament/tournament-flow-timeline";
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
  supabaseConfigured: boolean;
  supabaseTableReady: boolean;
  supabaseCanSave: boolean;
  supabaseError: string | null;
  supabaseHint: string | null;
};

export function TournamentView() {
  const { mergeKb } = useMemory();
  const [sampleMode, setSampleMode] = useState(true);
  const [state, setState] = useState<TournamentState>(() => createSampleTournamentState());
  const [busy, setBusy] = useState(false);
  const [countdownSec, setCountdownSec] = useState<number | null>(null);
  const [persistMessage, setPersistMessage] = useState<string | null>(null);
  const [engineMode, setEngineMode] = useState<TournamentMode>("mock");
  const [runtimeMode, setRuntimeMode] = useState<TournamentRuntimeMode>(() =>
    readTournamentAdminSettings().defaultRuntimeMode,
  );
  const [engineStatus, setEngineStatus] = useState<EngineStatus>({
    llmAvailable: false,
    groqAvailable: false,
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
  }, [applyLoopResult, mergeKb]);

  const runStep = useCallback(
    async (step: LoopStep) => {
      setSampleMode(false);
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

  const viewMode = getTournamentViewMode(state, sampleMode);
  const flowSteps = buildFlowTimeline(state);

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(167,139,250,0.15),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-violet-400/90">
              <Radio className="size-3.5 animate-pulse text-emerald-400" />
              Autonomous simulation
            </p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Tournament Engine</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              AI agents generate challenges, compete, get judged, update the leaderboard, and seed
              the marketplace —{" "}
              <span className="text-violet-300">{runtimeMode.replace(/_/g, " ")}</span> loop every
              5 minutes. Completed rounds auto-save.
            </p>
          </div>
        </header>

        <TournamentJoinEvents />

        {sampleMode && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyan-500/25 bg-cyan-500/10 px-5 py-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-cyan-300">
                Sample round · Replay mode
              </p>
              <p className="mt-1 text-sm text-zinc-300">
                Showing a completed demo round. Use manual controls below to start a live loop, or
                clear to reset the engine.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/tournaments/${SAMPLE_TOURNAMENT_ROUND_ID}`}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5"
              >
                Full replay →
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSampleMode(false);
                  setState(createInitialTournamentState());
                  setPersistMessage(null);
                }}
                className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-2 text-xs text-violet-200"
              >
                Switch to live mode
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-4">
          <ScoreHelp system="agent_simulation" />
          <ScoreHelp system="marketplace" />
        </div>

        <div className="mt-6 space-y-6">
          <TournamentStatusCard
            tournament={state.tournament}
            countdownSec={countdownSec}
            persistMessage={persistMessage}
            engineMode={engineMode}
            runtimeMode={runtimeMode}
            viewMode={viewMode}
            supabaseConfigured={engineStatus.supabaseConfigured}
            supabaseTableReady={engineStatus.supabaseTableReady}
            supabaseHint={engineStatus.supabaseHint}
            persistIsError={persistMessage?.startsWith("Supabase save failed") ?? false}
            marketplaceCount={state.marketplace.length}
            memoryLessons={state.memory?.lessons_updated}
            busy={busy}
            onRunNow={() => runStep("full")}
            onReplay={() => {
              setSampleMode(true);
              setState(createSampleTournamentState());
              setPersistMessage(null);
            }}
            onSwitchLive={() => {
              setSampleMode(false);
              setState(createInitialTournamentState());
              setPersistMessage(null);
            }}
          />

          <TournamentFlowTimeline steps={flowSteps} />

          <AdminControls
            busy={busy}
            paused={state.tournament.paused}
            onRunFull={() => runStep("full")}
            onPause={() => {
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
            }}
            onResume={() => {
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
            }}
            onGenerateOnly={() => runStep("generate")}
            onRunAgentsOnly={() => runStep("run")}
            onEvaluateOnly={() => runStep("evaluate")}
            onSave={async () => {
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
            }}
          />

          <ChallengeGeneratorSection
            ideas={state.tournament.challengeIdeas}
            selectedChallenge={state.tournament.selectedChallenge}
            roundSelectedIdeaId={selectedIdeaId}
          />

          <ActiveBattlePanel
            runs={state.tournament.activeRuns}
            evaluations={state.tournament.evaluations}
            agentModels={state.routing?.agentModels}
            viewMode={viewMode}
          />

          <MissionControlRoutingSection
            routing={state.routing}
            groqAvailable={engineStatus.groqAvailable}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <LiveLeaderboard entries={state.leaderboard} viewMode={viewMode} />
            <MemoryTournamentPanel memory={state.memory} />
          </div>

          <MarketplaceSeedPanel state={state} />

          <div className="grid gap-6 xl:grid-cols-2">
            <AgentPerformanceAnalytics
              evaluations={state.tournament.evaluations}
              leaderboard={state.leaderboard}
            />
            <TournamentHistory events={state.history} />
          </div>

          <ConstitutionTournamentPanel
            constitution={state.constitution}
            activeRuns={state.tournament.activeRuns}
            evaluations={state.tournament.evaluations}
            onPromoteMarketplace={() => {
              setPersistMessage("Constitution marked as marketplace candidate (mock — local only)");
            }}
          />
        </div>
      </main>
    </div>
  );
}
