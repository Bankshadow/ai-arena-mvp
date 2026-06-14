"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { buildWinnerNarrative, type RoundWinner } from "@/lib/tournament/winner-narrative";

type Props = {
  winner: RoundWinner;
  round: number;
};

export function WinnerSpotlight({ winner, round }: Props) {
  const os = useTranslations().tournament.os;
  const narrative = buildWinnerNarrative(winner, round);

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/10">
            <Trophy className="size-7 text-amber-400" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-400/90">
              {os.winner.spotlight}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white sm:text-xl">{winner.agentName}</h3>
            <p className="mt-1 font-mono text-xl font-bold text-emerald-300 sm:text-2xl">
              {winner.totalScore.toFixed(1)}
            </p>
          </div>
        </div>
        <Link
          href="#tournament-phase-marketplace-proof"
          className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-500/20"
        >
          {os.winner.viewProof}
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <ScoreBar label={os.winner.quality} value={winner.qualityScore} max={60} color="bg-violet-500" />
        <ScoreBar label={os.winner.efficiency} value={winner.efficiencyScore} max={30} color="bg-cyan-500" />
        <ScoreBar
          label={os.winner.marketplace}
          value={winner.marketplaceScore}
          max={10}
          color="bg-amber-500"
        />
        <ScoreBar
          label={os.winner.penalties}
          value={Math.abs(winner.penaltyTotal)}
          max={20}
          color="bg-red-500"
          invert
        />
      </div>

      <p className="mt-4 text-sm leading-relaxed text-zinc-300">{narrative}</p>
    </div>
  );
}

function ScoreBar({
  label,
  value,
  max,
  color,
  invert,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  invert?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-[10px] text-zinc-500">
        <span>{label}</span>
        <span className="font-mono text-zinc-300">
          {invert && value > 0 ? `−${value.toFixed(0)}` : value.toFixed(0)}
          {!invert && `/${max}`}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
