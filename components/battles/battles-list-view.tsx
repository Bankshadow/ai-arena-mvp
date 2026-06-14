"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { History, Swords } from "lucide-react";

import { Nav } from "@/components/Nav";
import { getAgentById } from "@/lib/agents/personas";
import type { AgentPersonaId } from "@/lib/agents/types";
import { listLocalBattles, mergeBattleLists } from "@/lib/battle/local-storage";
import type { BattleListItemWithId } from "@/lib/battle/local-storage-types";

export function BattlesListView() {
  const [battles, setBattles] = useState<BattleListItemWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"supabase" | "local" | "mixed">("local");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/battles");
        const data = await res.json();
        const remote: BattleListItemWithId[] = data.battles ?? [];
        const merged = mergeBattleLists(remote, listLocalBattles());
        setBattles(merged);
        setSource(
          remote.length > 0 && listLocalBattles().length > 0
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
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(168,85,247,0.12),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400/80">
          MVP9 · Battle history
        </p>
        <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
          <History className="size-8 text-violet-400" />
          Past battles
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Replay saved 5-agent token battles. Stored in Supabase when configured, otherwise in your
          browser.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/battle"
            className="inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm text-violet-200 hover:bg-violet-500/20"
          >
            <Swords className="size-4" />
            New battle
          </Link>
          {!loading && (
            <span className="self-center text-xs text-zinc-500">
              Source: {source === "supabase" ? "Supabase" : source === "mixed" ? "Supabase + local" : "Browser only"}
            </span>
          )}
        </div>

        <div className="mt-8 glass-card overflow-hidden rounded-2xl">
          {loading ? (
            <p className="p-8 text-center text-sm text-zinc-500">Loading battles…</p>
          ) : battles.length === 0 ? (
            <div className="flex flex-col items-center p-12 text-center text-zinc-500">
              <History className="size-10 text-zinc-700" />
              <p className="mt-3 text-sm">No battles saved yet.</p>
              <Link href="/battle" className="mt-4 text-sm text-cyan-400 hover:underline">
                Run your first battle →
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Challenge</th>
                  <th className="px-4 py-3">Winner</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3 text-right">Tokens</th>
                </tr>
              </thead>
              <tbody>
                {battles.map((b) => (
                  <tr key={b.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {new Date(b.savedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/battles/${b.id}`} className="font-medium text-zinc-200 hover:text-cyan-300">
                        {b.title}
                      </Link>
                      <p className="text-xs capitalize text-zinc-500">
                        {b.topic} · {b.difficulty}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {b.winnerAgentId
                        ? getAgentById(b.winnerAgentId as AgentPersonaId)?.name ?? b.winnerAgentId
                        : "—"}
                    </td>
                    <td className="px-4 py-3 capitalize text-zinc-400">{b.mode}</td>
                    <td className="px-4 py-3 text-right font-mono text-violet-300">
                      {b.winnerTokens?.toLocaleString() ?? "—"}
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
