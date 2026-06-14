"use client";

import { useState } from "react";

import { LiveLeaderboard } from "@/components/tournament/live-leaderboard";
import { WhyWinnerWon, WinnerPodium } from "@/components/tournament/os/winner-podium";
import { TournamentStageShell } from "@/components/tournament/os/tournament-stage-shell";
import { useTranslations } from "@/components/i18n/locale-provider";
import { buildWinnerNarrative, type RoundWinner } from "@/lib/tournament/winner-narrative";
import type { LeaderboardEntry } from "@/lib/tournament/types";
import type { TournamentViewMode } from "@/lib/tournament/view-mode-labels";

type Props = {
  entries: LeaderboardEntry[];
  viewMode: TournamentViewMode;
  winner: RoundWinner | null;
  round: number;
};

export function LeaderboardStage({ entries, viewMode, winner, round }: Props) {
  const os = useTranslations().tournament.os;
  const [showTable, setShowTable] = useState(false);
  const narrative = winner ? buildWinnerNarrative(winner, round) : "";

  return (
    <TournamentStageShell
      phase="leaderboard"
      action={
        <button
          type="button"
          onClick={() => setShowTable((s) => !s)}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          {showTable ? os.leaderboard.hideTable : os.leaderboard.showTable}
        </button>
      }
    >
      <WinnerPodium entries={entries} />
      {winner && <WhyWinnerWon winnerName={winner.agentName} narrative={narrative} />}
      {showTable && <LiveLeaderboard entries={entries} viewMode={viewMode} embedded />}
    </TournamentStageShell>
  );
}
