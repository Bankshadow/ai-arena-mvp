"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, History } from "lucide-react";

import { BattleResults } from "@/components/battles/battle-results";
import { Nav } from "@/components/Nav";
import { getLocalBattle } from "@/lib/battle/local-storage";
import type { SavedBattleRecord } from "@/lib/battle/saved-battle";

type Props = { battleId: string };

export function BattleDetailView({ battleId }: Props) {
  const [battle, setBattle] = useState<SavedBattleRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/battles/${battleId}`);
        if (res.ok) {
          const data = (await res.json()) as SavedBattleRecord;
          setBattle(data);
          return;
        }
      } catch {
        // fall through to localStorage
      }

      const local = getLocalBattle(battleId);
      if (local) {
        setBattle(local);
      } else {
        setNotFound(true);
      }
    }

    load().finally(() => setLoading(false));
  }, [battleId]);

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(168,85,247,0.12),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6">
        <Link
          href="/battles"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="size-4" />
          All battles
        </Link>

        {loading && (
          <p className="mt-8 text-center text-sm text-zinc-500">Loading replay…</p>
        )}

        {notFound && !loading && (
          <div className="mt-8 glass-card rounded-2xl p-12 text-center text-zinc-500">
            <History className="mx-auto size-10 text-zinc-700" />
            <p className="mt-3">Battle not found on this device.</p>
            <Link href="/battles" className="mt-4 inline-block text-cyan-400 hover:underline">
              Back to history
            </Link>
          </div>
        )}

        {battle && !loading && (
          <>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-violet-400/80">
              Replay · {new Date(battle.savedAt).toLocaleString()}
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{battle.challenge.title}</h1>
            <p className="mt-2 text-sm text-zinc-400">{battle.challenge.brief}</p>

            <div className="mt-8">
              <BattleResults result={battle} mode={battle.mode} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
