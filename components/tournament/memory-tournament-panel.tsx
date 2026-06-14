"use client";

import Link from "next/link";
import { Brain } from "lucide-react";

import type { TournamentMemoryMeta } from "@/lib/memory/types";

type Props = {
  memory: TournamentMemoryMeta | undefined;
};

export function MemoryTournamentPanel({ memory }: Props) {
  if (!memory?.compiled_at) {
    return (
      <section className="glass-card rounded-2xl border border-cyan-500/15 p-5">
        <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
          <Brain className="size-4 text-cyan-400" /> Tournament memory
        </p>
        <p className="mt-2 text-sm text-zinc-600">
          Complete a round to compile lessons into the knowledge base.
        </p>
        <Link href="/memory" className="mt-3 inline-block text-xs text-cyan-400 hover:underline">
          Open memory dashboard →
        </Link>
      </section>
    );
  }

  return (
    <section className="glass-card overflow-hidden rounded-2xl border border-cyan-500/20">
      <div className="border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-transparent px-5 py-4">
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-cyan-400/80">
          <Brain className="size-4" /> Memory compiled
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          {memory.articles_created} articles · {memory.lessons_updated} lessons ·{" "}
          {memory.proposals_pending} proposals
        </p>
      </div>
      <div className="flex flex-wrap gap-2 p-4">
        <Link
          href="/memory/articles"
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
        >
          View articles
        </Link>
        <Link
          href="/constitution/proposals"
          className="rounded-lg border border-violet-500/30 px-3 py-1.5 text-xs text-violet-200 hover:bg-violet-500/10"
        >
          Review proposals
        </Link>
        <Link
          href="/memory/query"
          className="rounded-lg border border-cyan-500/30 px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-500/10"
        >
          Query memory
        </Link>
      </div>
    </section>
  );
}
