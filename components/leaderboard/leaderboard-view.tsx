"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";

import { LeaderboardTable, type LeaderboardRow } from "@/components/LeaderboardTable";
import { Nav } from "@/components/Nav";
import {
  getBestSubmissionPerEmail,
  loadSubmissions,
} from "@/lib/client/submissions";
import { mergeLeaderboardRows } from "@/lib/leaderboard/merge-rows";

export type LeaderboardViewProps = {
  initialRows: LeaderboardRow[];
  source: "database" | "mock" | "empty";
  updatedLabel?: string;
};

export function LeaderboardView({
  initialRows,
  source,
  updatedLabel,
}: LeaderboardViewProps) {
  const [rows, setRows] = useState<LeaderboardRow[]>(initialRows);

  useEffect(() => {
    const local = getBestSubmissionPerEmail(loadSubmissions()).map((s) => ({
      rank: 0,
      player: s.name,
      qualityScore: s.qualityScore,
      cost: s.estimatedCost,
      costScore: s.costScore,
      finalScore: s.finalScore,
      modelUsed: s.modelUsed,
      highlight: true,
    }));

    setRows(mergeLeaderboardRows(initialRows, local));
  }, [initialRows]);

  const subtitle =
    source === "database"
      ? `Live rankings from scored submissions${updatedLabel ? ` · ${updatedLabel}` : ""}`
      : source === "mock"
        ? "Demo leaders + your browser submissions · connect DATABASE_URL for live data"
        : "No scored entries yet · submit to appear after review";

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
            <p className="mt-2 text-zinc-400">
              Final Score = Quality × 0.8 + Cost Score × 0.2 · {subtitle}
            </p>
          </div>
          <Link
            href="/submit"
            className="shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-black"
          >
            Submit solution
          </Link>
        </div>

        <div className="mt-10">
          <LeaderboardTable rows={rows} />
        </div>
      </main>
    </div>
  );
}
