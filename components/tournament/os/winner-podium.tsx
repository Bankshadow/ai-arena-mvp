"use client";

import { Trophy } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";
import type { LeaderboardEntry } from "@/lib/tournament/types";

type Props = { entries: LeaderboardEntry[] };

function rankLabel(rank: number, labels: { rank1: string; rank2: string; rank3: string }) {
  if (rank === 1) return labels.rank1;
  if (rank === 2) return labels.rank2;
  return labels.rank3;
}

export function WinnerPodium({ entries }: Props) {
  const os = useTranslations().tournament.os;
  const top3 = entries.filter((e) => e.rank <= 3).sort((a, b) => a.rank - b.rank);
  if (top3.length === 0) return null;

  const order = [top3.find((e) => e.rank === 2), top3.find((e) => e.rank === 1), top3.find((e) => e.rank === 3)].filter(
    Boolean,
  ) as LeaderboardEntry[];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {order.map((entry) => (
        <PodiumCard
          key={entry.agentId}
          entry={entry}
          rankLabel={rankLabel(entry.rank, os.leaderboard)}
        />
      ))}
    </div>
  );
}

function PodiumCard({ entry, rankLabel }: { entry: LeaderboardEntry; rankLabel: string }) {
  const isFirst = entry.rank === 1;
  return (
    <div
      className={`rounded-xl border p-4 text-center ${
        isFirst
          ? "border-emerald-500/40 bg-emerald-500/10 sm:-mt-2 sm:pb-6"
          : "border-white/10 bg-black/25"
      }`}
    >
      {isFirst && <Trophy className="mx-auto mb-2 size-5 text-amber-400" />}
      <p className="font-mono text-[10px] uppercase text-zinc-500">{rankLabel}</p>
      <p className="mt-1 font-semibold text-zinc-100">{entry.agentName}</p>
      <p className={`mt-1 font-mono font-bold ${isFirst ? "text-xl text-emerald-300 sm:text-2xl" : "text-lg text-zinc-300"}`}>
        {entry.totalScore.toFixed(1)}
      </p>
      <p className="mt-2 text-[10px] text-zinc-500">
        Q {entry.qualityScore?.toFixed(0) ?? "—"} · E {entry.efficiencyScore?.toFixed(0) ?? "—"} · $
        {entry.avgCost.toFixed(3)}
      </p>
    </div>
  );
}

export function WhyWinnerWon({ winnerName, narrative }: { winnerName: string; narrative: string }) {
  const os = useTranslations().tournament.os;

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
      <p className="text-[10px] uppercase tracking-wider text-emerald-400/90">{os.leaderboard.whyWon}</p>
      <p className="mt-2 break-words text-xs leading-relaxed text-zinc-300 sm:text-sm">
        <span className="font-medium text-emerald-200">{winnerName}</span> — {narrative}
      </p>
    </div>
  );
}
