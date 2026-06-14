"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, History } from "lucide-react";

import { ActiveBattlePanel } from "@/components/tournament/active-battle-panel";
import { ChallengeGeneratorPanel } from "@/components/tournament/challenge-generator-panel";
import { LiveLeaderboard } from "@/components/tournament/live-leaderboard";
import { SelectedChallengeCard } from "@/components/tournament/selected-challenge-card";
import { Nav } from "@/components/Nav";
import { getLocalTournamentRound } from "@/lib/tournament/local-storage";
import {
  getSampleTournamentRecord,
  SAMPLE_TOURNAMENT_ROUND_ID,
} from "@/lib/tournament/sample-round";
import type { SavedTournamentRecord } from "@/lib/tournament/saved-tournament";

type Props = { roundId: string };

export function TournamentDetailView({ roundId }: Props) {
  const [record, setRecord] = useState<SavedTournamentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      if (
        roundId === SAMPLE_TOURNAMENT_ROUND_ID ||
        roundId.startsWith("mock-tournament")
      ) {
        setRecord({ ...getSampleTournamentRecord(), id: roundId });
        return;
      }

      try {
        const res = await fetch(`/api/tournament/rounds/${roundId}`);
        if (res.ok) {
          const data = (await res.json()) as SavedTournamentRecord;
          setRecord(data);
          return;
        }
      } catch {
        // fall through to localStorage
      }

      const local = getLocalTournamentRound(roundId);
      if (local) {
        setRecord(local);
      } else {
        setNotFound(true);
      }
    }

    load().finally(() => setLoading(false));
  }, [roundId]);

  const state = record?.state;
  const selectedIdeaId =
    state && state.tournament.challengeIdeas.length > 0
      ? state.tournament.challengeIdeas.reduce((best, idea) =>
          !best || idea.selectionScore > best.selectionScore ? idea : best,
        ).id
      : null;

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(167,139,250,0.12),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
        <Link
          href="/tournaments"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="size-4" />
          All rounds
        </Link>

        {loading && (
          <p className="mt-8 text-center text-sm text-zinc-500">Loading replay…</p>
        )}

        {notFound && !loading && (
          <div className="mt-8 glass-card rounded-2xl p-12 text-center text-zinc-500">
            <History className="mx-auto size-10 text-zinc-700" />
            <p className="mt-3">Tournament round not found on this device.</p>
            <Link href="/tournaments" className="mt-4 inline-block text-cyan-400 hover:underline">
              Back to history
            </Link>
          </div>
        )}

        {record && state && !loading && (
          <div className="mt-6 space-y-6">
            <header>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400/80">
                Replay · Round {record.round} · {record.mode} ·{" "}
                {new Date(record.savedAt).toLocaleString()}
              </p>
              <h1 className="mt-2 text-3xl font-semibold">
                {state.tournament.selectedChallenge?.title ?? "Tournament round"}
              </h1>
              {record.winnerAgentId && (
                <p className="mt-2 text-sm text-emerald-300">
                  Winner: {record.state.tournament.evaluations.find((e) => e.agentId === record.winnerAgentId)?.agentName ?? record.winnerAgentId}{" "}
                  · {record.winnerScore} pts
                </p>
              )}
            </header>

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

            <LiveLeaderboard entries={state.leaderboard} />
          </div>
        )}
      </main>
    </div>
  );
}
