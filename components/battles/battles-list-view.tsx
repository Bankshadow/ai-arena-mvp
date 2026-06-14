"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { History, Play, Swords } from "lucide-react";

import { Nav } from "@/components/Nav";
import { EnvStatusBanner } from "@/components/env/env-status-banner";
import { ScoreHelp } from "@/components/scoring/score-help";
import { fetchJson } from "@/lib/client/fetch-json";
import { getAgentById } from "@/lib/agents/personas";
import type { AgentPersonaId } from "@/lib/agents/types";
import { mergeWithMockBattles, type BattleHistoryRow } from "@/lib/battle/mock-history";
import { listLocalBattles, mergeBattleLists } from "@/lib/battle/local-storage";

export function BattlesListView() {
  const [battles, setBattles] = useState<BattleHistoryRow[]>(() => mergeWithMockBattles([]));
  const [source, setSource] = useState<"demo" | "supabase" | "local" | "mixed">("demo");
  const [fetchNotice, setFetchNotice] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setFetchNotice(null);
      const { ok, data, timedOut } = await fetchJson<{ battles?: BattleHistoryRow[] }>(
        "/api/battles",
      );

      if (!ok || !data) {
        setBattles(mergeWithMockBattles(mergeBattleLists([], listLocalBattles())));
        setSource(listLocalBattles().length > 0 ? "local" : "demo");
        if (timedOut) {
          setFetchNotice("Battle history timed out — showing demo and local saves.");
        } else if (!ok) {
          setFetchNotice("Could not reach battle API — showing demo and local saves.");
        }
        return;
      }

      const remote = data.battles ?? [];
      const merged = mergeWithMockBattles(mergeBattleLists(remote, listLocalBattles()));
      setBattles(merged);
      const hasLive = remote.length > 0 || listLocalBattles().length > 0;
      setSource(
        hasLive && remote.length > 0
          ? listLocalBattles().length > 0
            ? "mixed"
            : "supabase"
          : hasLive
            ? "local"
            : "demo",
      );
    }
    load();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(168,85,247,0.12),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400/80">
          Battle history
        </p>
        <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
          <History className="size-8 text-violet-400" />
          Past battles
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          AI agents battle first. Replay token fights, compare variants, and study winning
          workflows before they hit the marketplace.
        </p>

        <div className="mt-4">
          <ScoreHelp system="agent_simulation" />
        </div>

        {fetchNotice && (
          <EnvStatusBanner className="mt-4" title={fetchNotice} variant="warning" />
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/battle"
            className="inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm text-violet-200 hover:bg-violet-500/20"
          >
            <Swords className="size-4" />
            New battle
          </Link>
          <span className="self-center text-xs text-zinc-500">
            Source:{" "}
            {source === "demo"
              ? "Demo history + your saves"
              : source === "supabase"
                ? "Supabase + demo"
                : source === "mixed"
                  ? "Supabase + local + demo"
                  : "Local + demo"}
          </span>
        </div>

        <div className="mt-8 glass-card overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Challenge</th>
                  <th className="px-4 py-3">Variants</th>
                  <th className="px-4 py-3">Winner</th>
                  <th className="px-4 py-3 text-right">Score</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-right">Tokens</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {battles.map((b) => (
                  <tr key={b.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {new Date(b.savedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{b.battleType}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/battles/${b.id}`}
                        className="font-medium text-zinc-200 hover:text-cyan-300"
                      >
                        {b.title}
                      </Link>
                      <p className="text-xs capitalize text-zinc-500">
                        {b.topic} · {b.difficulty}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-400">{b.variants}</td>
                    <td className="px-4 py-3 text-zinc-300">
                      {b.winnerAgentId
                        ? getAgentById(b.winnerAgentId as AgentPersonaId)?.name ?? b.winnerAgentId
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-300">
                      {b.winnerScore > 0 ? b.winnerScore.toFixed(1) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-cyan-300">
                      {b.costUsd > 0 ? `$${b.costUsd.toFixed(3)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-violet-300">
                      {b.totalTokens > 0
                        ? b.totalTokens.toLocaleString()
                        : (b.winnerTokens?.toLocaleString() ?? "—")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/battles/${b.id}`}
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
