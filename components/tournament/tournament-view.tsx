"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Radio } from "lucide-react";

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
} from "@/lib/tournament/engine";
import { saveTournamentStateMock } from "@/lib/tournament/persistence";
import type { TournamentEvent, TournamentState } from "@/lib/tournament/types";

export function TournamentView() {
  const [state, setState] = useState<TournamentState>(() => createInitialTournamentState());
  const [busy, setBusy] = useState(false);
  const [countdownSec, setCountdownSec] = useState<number | null>(null);
  const [persistMessage, setPersistMessage] = useState<string | null>(null);
  const nextRunRef = useRef<number | null>(null);

  const applyLoop = useCallback((step: LoopStep) => {
    setState((prev) => runTournamentLoop(prev, step));
    nextRunRef.current = Date.now() + getLoopIntervalMs();
  }, []);

  const runStep = useCallback(
    async (step: LoopStep) => {
      setBusy(true);
      await new Promise((r) => setTimeout(r, 400));
      applyLoop(step);
      setBusy(false);
    },
    [applyLoop],
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
      if (nextRunRef.current === null) return;
      const remaining = Math.max(0, Math.ceil((nextRunRef.current - Date.now()) / 1000));
      setCountdownSec(remaining);
      if (remaining === 0) {
        applyLoop("full");
        nextRunRef.current = Date.now() + getLoopIntervalMs();
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [state.tournament.paused, applyLoop]);

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
              the future marketplace — mock loop every 5 minutes.
            </p>
          </div>
        </header>

        <div className="space-y-6">
          <TournamentStatusCard
            tournament={state.tournament}
            countdownSec={countdownSec}
            persistMessage={persistMessage}
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
            onSaveMock={async () => {
              setBusy(true);
              const result = await saveTournamentStateMock(state);
              setPersistMessage(result.message);
              appendEvent({
                id: crypto.randomUUID(),
                tournamentId: state.tournament.id,
                round: state.tournament.round,
                type: "supabase_save_mock",
                message: result.message,
                timestamp: result.savedAt,
              });
              setBusy(false);
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
