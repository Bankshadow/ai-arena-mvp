"use client";

import Link from "next/link";

import { TournamentStatusCard } from "@/components/tournament/tournament-status-card";
import { CompactFlowStepper } from "@/components/tournament/os/compact-flow-stepper";
import { WinnerSpotlight } from "@/components/tournament/os/winner-spotlight";
import { TournamentStageShell } from "@/components/tournament/os/tournament-stage-shell";
import { useTranslations } from "@/components/i18n/locale-provider";
import type { TournamentFlowStep } from "@/lib/tournament/mission-control-demo";
import type { TournamentMode } from "@/lib/tournament/engine";
import type { TournamentRuntimeMode } from "@/lib/tournament/routing/types";
import type { TournamentViewMode } from "@/lib/tournament/view-mode-labels";
import type { RoundWinner } from "@/lib/tournament/winner-narrative";
import type { Tournament } from "@/lib/tournament/types";
import { SAMPLE_TOURNAMENT_ROUND_ID } from "@/lib/tournament/sample-round";

type Props = {
  tournament: Tournament;
  flowSteps: TournamentFlowStep[];
  viewMode: TournamentViewMode;
  engineMode: TournamentMode;
  runtimeMode: TournamentRuntimeMode;
  countdownSec: number | null;
  persistMessage: string | null;
  persistIsError?: boolean;
  supabaseConfigured: boolean;
  supabaseTableReady: boolean;
  supabaseHint: string | null;
  marketplaceCount: number;
  memoryLessons?: number;
  winner: RoundWinner | null;
  busy?: boolean;
  sampleMode: boolean;
  replayMode: boolean;
  onRunNow: () => void;
  onReplay: () => void;
  onSwitchLive: () => void;
  onSetReplay: () => void;
  onSetSampleOff: () => void;
};

export function OverviewStage({
  tournament,
  flowSteps,
  viewMode,
  engineMode,
  runtimeMode,
  countdownSec,
  persistMessage,
  persistIsError,
  supabaseConfigured,
  supabaseTableReady,
  supabaseHint,
  marketplaceCount,
  memoryLessons,
  winner,
  busy,
  sampleMode,
  replayMode,
  onRunNow,
  onReplay,
  onSwitchLive,
  onSetReplay,
  onSetSampleOff,
}: Props) {
  const sb = useTranslations().tournament.sampleBanner;

  return (
    <TournamentStageShell phase="overview">
      {(sampleMode || replayMode) && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-cyan-300">
              {replayMode ? sb.replayEyebrow : sb.sampleEyebrow}
            </p>
            <p className="mt-1 text-sm text-zinc-300">
              {replayMode ? sb.replayBody : sb.sampleBody}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/tournaments/${SAMPLE_TOURNAMENT_ROUND_ID}`}
              onClick={onSetReplay}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5"
            >
              {sb.fullReplay}
            </Link>
            <button
              type="button"
              onClick={onSetSampleOff}
              className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-2 text-xs text-violet-200"
            >
              {sb.switchLive}
            </button>
          </div>
        </div>
      )}

      <CompactFlowStepper steps={flowSteps} />

      {winner && <WinnerSpotlight winner={winner} round={tournament.round} />}

      <TournamentStatusCard
        tournament={tournament}
        countdownSec={countdownSec}
        persistMessage={null}
        engineMode={engineMode}
        runtimeMode={runtimeMode}
        viewMode={viewMode}
        supabaseConfigured={supabaseConfigured}
        supabaseTableReady={supabaseTableReady}
        supabaseHint={supabaseHint}
        persistIsError={persistIsError}
        marketplaceCount={marketplaceCount}
        memoryLessons={memoryLessons}
        busy={busy}
        onRunNow={onRunNow}
        onReplay={onReplay}
        onSwitchLive={onSwitchLive}
        embedded
      />

      {persistMessage && (
        <p className={`text-xs ${persistIsError ? "text-rose-300" : "text-cyan-300"}`}>
          {persistMessage}
        </p>
      )}
    </TournamentStageShell>
  );
}
