"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { LeaderboardTable, type LeaderboardRow } from "@/components/LeaderboardTable";
import { Nav } from "@/components/Nav";
import type { UnifiedLeaderboardMeta } from "@/lib/leaderboard/unified";

export type LeaderboardViewProps = {
  rows: LeaderboardRow[];
  source: "supabase" | "mock" | "empty" | "unified";
  meta?: UnifiedLeaderboardMeta;
};

export function LeaderboardView({ rows, source, meta }: LeaderboardViewProps) {
  const t = useTranslations();
  const lb = t.leaderboard;

  const subtitle =
    source === "unified"
      ? lb.subtitleUnified
      : source === "supabase"
        ? lb.subtitleSupabase
        : source === "mock"
          ? lb.subtitleMock
          : lb.subtitleEmpty;

  const emptyMessage =
    source === "empty" || rows.length === 0 ? lb.empty : undefined;

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(167,139,250,0.1),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400/80">{lb.eyebrow}</p>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
              <Trophy className="size-8 text-amber-400" />
              {lb.title}
            </h1>
            <p className="mt-2 text-zinc-400">{subtitle}</p>
            {meta && meta.total > 0 && (
              <p className="mt-2 text-xs text-zinc-500">
                {lb.sourcesLabel}: {meta.sources.human} human · {meta.sources.agent} agents ·{" "}
                {meta.sources["agent-live"]} live runs · {meta.sources.battle} battles ·{" "}
                {meta.sources.tournament} tournament
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/arena"
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
            >
              {lb.enterArena}
            </Link>
            <Link
              href="/submit"
              className="shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-black"
            >
              {lb.submitSolution}
            </Link>
          </div>
        </div>

        <div className="mt-10">
          <LeaderboardTable rows={rows} emptyMessage={emptyMessage} />
        </div>
      </main>
    </div>
  );
}
