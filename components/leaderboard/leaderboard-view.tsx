"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";

import { LeaderboardTable, type LeaderboardRow } from "@/components/LeaderboardTable";
import { Nav } from "@/components/Nav";

export type LeaderboardViewProps = {
  rows: LeaderboardRow[];
  source: "supabase" | "mock" | "empty";
};

export function LeaderboardView({ rows, source }: LeaderboardViewProps) {
  const subtitle =
    source === "supabase"
      ? "Approved submissions · Final Score = Quality × 0.8 + Cost Score × 0.2"
      : source === "mock"
        ? "Demo data — configure Supabase for live rankings"
        : "Final Score = Quality × 0.8 + Cost Score × 0.2";

  const emptyMessage =
    source === "empty" || (source === "supabase" && rows.length === 0)
      ? "No reviewed submissions yet."
      : undefined;

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(167,139,250,0.1),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400/80">
              Rankings
            </p>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
              <Trophy className="size-8 text-amber-400" />
              Leaderboard
            </h1>
            <p className="mt-2 text-zinc-400">{subtitle}</p>
          </div>
          <Link
            href="/submit"
            className="shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-black"
          >
            Submit solution
          </Link>
        </div>

        <div className="mt-10">
          <LeaderboardTable rows={rows} emptyMessage={emptyMessage} />
        </div>
      </main>
    </div>
  );
}
