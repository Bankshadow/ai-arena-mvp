"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { History, Radio } from "lucide-react";

import { Nav } from "@/components/Nav";
import { getCompetitor } from "@/lib/tournament/agents";
import type { CompetitorAgentId } from "@/lib/tournament/types";
import {
  listLocalTournamentRounds,
  mergeTournamentLists,
} from "@/lib/tournament/local-storage";
import type { TournamentListItem } from "@/lib/tournament/saved-tournament";

export function TournamentsListView() {
  const [rounds, setRounds] = useState<TournamentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"supabase" | "local" | "mixed">("local");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/tournament/rounds");
        const data = await res.json();
        const remote: TournamentListItem[] = data.rounds ?? [];
        const merged = mergeTournamentLists(remote, listLocalTournamentRounds());
        setRounds(merged);
        setSource(
          remote.length > 0 && listLocalTournamentRounds().length > 0
            ? "mixed"
            : remote.length > 0
              ? "supabase"
              : "local",
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(167,139,250,0.12),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400/80">
          Tournament · Round history
        </p>
        <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
          <History className="size-8 text-violet-400" />
          Saved rounds
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Replay completed tournament rounds. Auto-saved to Supabase when configured, otherwise in
          your browser.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/tournament"
            className="inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm text-violet-200 hover:bg-violet-500/20"
          >
            <Radio className="size-4" />
            Open tournament engine
          </Link>
          {!loading && (
            <span className="self-center text-xs text-zinc-500">
              Source:{" "}
              {source === "supabase"
                ? "Supabase"
                : source === "mixed"
                  ? "Supabase + local"
                  : "Browser only"}
            </span>
          )}
        </div>

        <div className="mt-8 glass-card overflow-hidden rounded-2xl">
          {loading ? (
            <p className="p-8 text-center text-sm text-zinc-500">Loading rounds…</p>
          ) : rounds.length === 0 ? (
            <div className="flex flex-col items-center p-12 text-center text-zinc-500">
              <History className="size-10 text-zinc-700" />
              <p className="mt-3 text-sm">No tournament rounds saved yet.</p>
              <Link href="/tournament" className="mt-4 text-sm text-cyan-400 hover:underline">
                Run your first round →
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Round</th>
                  <th className="px-4 py-3">Challenge</th>
                  <th className="px-4 py-3">Winner</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {rounds.map((r) => (
                  <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {new Date(r.savedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-violet-300">#{r.round}</td>
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
                          getCompetitor(r.winnerAgentId as CompetitorAgentId).name ??
                          r.winnerAgentId)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 capitalize text-zinc-400">{r.mode}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-300">
                      {r.winnerScore ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
