"use client";

import { Radio, Trophy } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";
import {
  fillTemplate,
  translateRuntimeMode,
  translateTournamentPhase,
  translateViewModeStatus,
} from "@/lib/i18n/helpers";
import { DEMO_ROUND_ID } from "@/lib/tournament/mission-control-demo";
import type { Tournament } from "@/lib/tournament/types";
import type { TournamentRuntimeMode } from "@/lib/tournament/routing/types";
import type { TournamentViewMode } from "@/lib/tournament/view-mode-labels";
import type { RoundWinner } from "@/lib/tournament/winner-narrative";

type Props = {
  tournament: Tournament;
  viewMode: TournamentViewMode;
  runtimeMode: TournamentRuntimeMode;
  countdownSec: number | null;
  winner: RoundWinner | null;
  busy?: boolean;
  onRunNow?: () => void;
};

export function TournamentCommandBar({
  tournament,
  viewMode,
  runtimeMode,
  countdownSec,
  winner,
  busy,
  onRunNow,
}: Props) {
  const t = useTranslations();
  const os = t.tournament.os;
  const phaseLabel = translateTournamentPhase(tournament.phase, t);
  const viewLabel = translateViewModeStatus(viewMode, t);
  const runtimeLabel = translateRuntimeMode(runtimeMode, t);

  const countdown =
    viewMode === "live" && !tournament.paused && countdownSec != null
      ? `${Math.floor(countdownSec / 60)}:${String(countdownSec % 60).padStart(2, "0")}`
      : null;

  return (
    <div className="sticky top-16 z-40 -mx-4 border-b border-white/10 bg-[#030303]/95 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-violet-400/90">
              <Radio className="size-3 animate-pulse text-emerald-400" />
              {fillTemplate(os.command.roundLabel, {
                roundId: DEMO_ROUND_ID,
                round: String(tournament.round || 12),
              })}
            </span>
            <PhasePill label={phaseLabel} />
            <ModePill label={viewLabel} />
            <ModePill label={runtimeLabel} muted />
            {tournament.paused && <ModePill label={os.command.paused} warn />}
            {countdown && (
              <span className="font-mono text-xs text-cyan-300">{os.command.nextIn} {countdown}</span>
            )}
          </div>
          <p className="mt-1 truncate text-sm text-zinc-400">{os.tagline}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {winner && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
              <Trophy className="size-3.5 text-amber-400" />
              {winner.agentName} · {winner.totalScore.toFixed(1)}
            </span>
          )}
          <button
            type="button"
            onClick={onRunNow}
            disabled={busy}
            className="rounded-lg border border-violet-500/50 bg-violet-500/15 px-4 py-2 text-xs font-medium text-violet-100 transition hover:bg-violet-500/25 disabled:opacity-50"
          >
            {os.command.runRound}
          </button>
        </div>
      </div>
    </div>
  );
}

function PhasePill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-violet-200">
      {label}
    </span>
  );
}

function ModePill({ label, muted, warn }: { label: string; muted?: boolean; warn?: boolean }) {
  const styles = warn
    ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
    : muted
      ? "border-white/10 bg-white/5 text-zinc-500"
      : "border-cyan-500/30 bg-cyan-500/10 text-cyan-200";
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wide ${styles}`}>
      {label}
    </span>
  );
}
