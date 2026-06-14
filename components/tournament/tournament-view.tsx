"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { History, Radio } from "lucide-react";

import { AdminControls } from "@/components/tournament/admin-controls";
import { ActiveBattlePanel } from "@/components/tournament/active-battle-panel";
import { AgentPerformanceAnalytics } from "@/components/tournament/agent-performance-analytics";
import { ChallengeGeneratorPanel } from "@/components/tournament/challenge-generator-panel";
import { LiveLeaderboard } from "@/components/tournament/live-leaderboard";
import { MarketplaceSeedPanel } from "@/components/tournament/marketplace-seed-panel";
import { SelectedChallengeCard } from "@/components/tournament/selected-challenge-card";
import { TournamentHistory } from "@/components/tournament/tournament-history";
import { TournamentStatusCard } from "@/components/tournament/tournament-status-card";
import { Nav } from "@/components/Nav";
import {
  createInitialTournamentState,
  getLoopIntervalMs,
  runTournamentLoop,
  type LoopStep,
  type TournamentMode,
} from "@/lib/tournament/engine";
import type { TournamentEvent, TournamentState } from "@/lib/tournament/types";
import { upsertLocalTournamentRound } from "@/lib/tournament/local-storage";
import {
  buildSavedTournamentRecord,
  shouldAutoSaveTournament,
} from "@/lib/tournament/saved-tournament";

type EngineStatus = {
  llmAvailable: boolean;
  supabaseConfigured: boolean;
  supabaseTableReady: boolean;
  supabaseCanSave: boolean;
  supabaseError: string | null;
  supabaseHint: string | null;
};

export function TournamentView() {
  const [state, setState] = useState<TournamentState>(() => createInitialTournamentState());
  const [busy, setBusy] = useState(false);
  const [countdownSec, setCountdownSec] = useState<number | null>(null);
  const [persistMessage, setPersistMessage] = useState<string | null>(null);
  const [engineMode, setEngineMode] = useState<TournamentMode>("mock");
  const [engineStatus, setEngineStatus] = useState<EngineStatus>({
    llmAvailable: false,
    supabaseConfigured: false,
    supabaseTableReady: false,
    supabaseCanSave: false,
    supabaseError: null,
    supabaseHint: null,
  });
  const stateRef = useRef(state);
  const nextRunRef = useRef<number | null>(null);

  stateRef.current = state;

  useEffect(() => {
    fetch("/api/tournament/status")
      .then((r) => r.json())
      .then((data: EngineStatus) => {
        setEngineStatus(data);
        if (data.llmAvailable) setEngineMode("live");
      })
      .catch(() => {});
  }, []);

  const applyLoopResult = useCallback((result: TournamentState, mode?: TournamentMode) => {
    setState(result);
    if (mode) setEngineMode(mode);
    nextRunRef.current = Date.now() + getLoopIntervalMs();
  }, []);

  const runStepViaApi = useCallback(async (step: LoopStep): Promise<boolean> => {
    const res = await fetch("/api/tournament/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: stateRef.current, step }),
    });

    if (!res.ok) return false;

    const data = (await res.json()) as TournamentState & {
      mode?: TournamentMode;
      savedRoundId?: string | null;
      persistError?: string | null;
    };
    const nextState: TournamentState = {
      tournament: data.tournament,
      leaderboard: data.leaderboard,
      history: data.history,
      marketplace: data.marketplace,
    };
    applyLoopResult(nextState, data.mode);

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
  }, [applyLoopResult]);

  const runStep = useCallback(
    async (step: LoopStep) => {
      setBusy(true);
      try {
        const ok = await runStepViaApi(step);
        if (!ok) {
          setState((prev) => {
            const next = runTournamentLoop(prev, step);
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
    [runStepViaApi],
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
              the marketplace — {engineMode === "live" ? "live LLM" : "mock"} loop every 5 minutes.
              Completed rounds auto-save.
            </p>
          </div>
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10"
          >
            <History className="size-4 text-violet-400" />
            Saved rounds
          </Link>
        </header>

        <div className="space-y-6">
          <TournamentStatusCard
            tournament={state.tournament}
            countdownSec={countdownSec}
            persistMessage={persistMessage}
            engineMode={engineMode}
            supabaseConfigured={engineStatus.supabaseConfigured}
            supabaseTableReady={engineStatus.supabaseTableReady}
            supabaseHint={engineStatus.supabaseHint}
            persistIsError={persistMessage?.startsWith("Supabase save failed") ?? false}
          />

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

          <div className="grid gap-6 lg:grid-cols-2">
            <ChallengeGeneratorPanel
              ideas={state.tournament.challengeIdeas}
              selectedId={selectedIdeaId}
            />
            <SelectedChallengeCard challenge={state.tournament.selectedChallenge} />
          </div>

          <ActiveBattlePanel
            runs={state.tournament.activeRuns}
            evaluations={state.tournament.evaluations}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <LiveLeaderboard entries={state.leaderboard} />
            <AgentPerformanceAnalytics
              evaluations={state.tournament.evaluations}
              leaderboard={state.leaderboard}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <TournamentHistory events={state.history} />
            <MarketplaceSeedPanel candidates={state.marketplace} />
          </div>
        </div>
      </main>
    </div>
  );
}
