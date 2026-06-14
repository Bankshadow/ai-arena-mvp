"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { History, Play, Radio } from "lucide-react";

import { Nav } from "@/components/Nav";
import { ScoreHelp } from "@/components/scoring/score-help";
import { getCompetitor } from "@/lib/tournament/agents";
import {
  listLocalTournamentRounds,
  mergeTournamentLists,
} from "@/lib/tournament/local-storage";
import {
  mergeWithMockTournamentRounds,
  type TournamentHistoryRow,
} from "@/lib/tournament/mock-saved-rounds";
import type { CompetitorAgentId } from "@/lib/tournament/types";

export function TournamentsListView() {
  const [rounds, setRounds] = useState<TournamentHistoryRow[]>(() =>
    mergeWithMockTournamentRounds([]),
  );
  const [source, setSource] = useState<"demo" | "supabase" | "local" | "mixed">("demo");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/tournament/rounds");
        const data = await res.json();
        const remote = data.rounds ?? [];
        const merged = mergeWithMockTournamentRounds(
          mergeTournamentLists(remote, listLocalTournamentRounds()),
        );
        setRounds(merged);
        const hasLive = remote.length > 0 || listLocalTournamentRounds().length > 0;
        setSource(
          hasLive && remote.length > 0
            ? listLocalTournamentRounds().length > 0
              ? "mixed"
              : "supabase"
            : hasLive
              ? "local"
              : "demo",
        );
      } catch {
        setRounds(
          mergeWithMockTournamentRounds(
            mergeTournamentLists([], listLocalTournamentRounds()),
          ),
        );
      }
    }
    load();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(167,139,250,0.12),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400/80">
          Tournament · Round history
        </p>
        <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
          <History className="size-8 text-violet-400" />
          Saved rounds
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Autonomous tournament rounds — challenge selection, agent runs, judging, leaderboard, and
          marketplace seeding. Replay any completed round.
        </p>

        <div className="mt-4 flex flex-wrap gap-4">
          <ScoreHelp system="agent_simulation" />
          <ScoreHelp system="marketplace" />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/tournament"
            className="inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm text-violet-200 hover:bg-violet-500/20"
          >
            <Radio className="size-4" />
            Open tournament engine
          </Link>
          <span className="self-center text-xs text-zinc-500">
            Source:{" "}
            {source === "demo"
              ? "Demo rounds + your saves"
              : source === "supabase"
                ? "Supabase + demo"
                : source === "mixed"
                  ? "Supabase + local + demo"
                  : "Local + demo"}
          </span>
        </div>

        <div className="mt-8 glass-card overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Round ID</th>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Challenge</th>
                  <th className="px-4 py-3">Winner</th>
                  <th className="px-4 py-3 text-right">Score</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-right">MP candidates</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rounds.map((r) => (
                  <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-xs text-violet-300">
                      {r.roundLabel}
                      {r.isDemo && (
                        <span className="ml-1 rounded bg-white/10 px-1 text-[10px] text-zinc-500">
                          demo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {new Date(r.savedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/tournaments/${r.id}`}
                        className="font-medium text-zinc-200 hover:text-cyan-300"
                      >
                        {r.challengeTitle ?? "Untitled challenge"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {r.winnerAgentId
                        ? (r.winnerAgentName ??
                          getCompetitor(r.winnerAgentId as CompetitorAgentId)?.name ??
                          r.winnerAgentId)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-300">
                      {r.winnerScore ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-cyan-300">
                      {r.costUsd > 0 ? `$${r.costUsd.toFixed(3)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-amber-300">
                      {r.marketplaceCandidates || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/tournaments/${r.id}`}
                        className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline"
                      >
                        <Play className="size-3" /> Replay
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
