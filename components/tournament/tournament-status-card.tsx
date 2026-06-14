"use client";

import type { ReactNode } from "react";

import { useTranslations } from "@/components/i18n/locale-provider";
import {
  fillTemplate,
  translateRuntimeMode,
  translateTournamentPhase,
  translateViewModeCta,
  translateViewModeRunsStat,
  translateViewModeStatus,
} from "@/lib/i18n/helpers";
import type { Tournament } from "@/lib/tournament/types";
import type { TournamentMode } from "@/lib/tournament/engine";
import { getLoopIntervalMs } from "@/lib/tournament/engine";
import { DEFAULT_RUNTIME_MODE, type TournamentRuntimeMode } from "@/lib/tournament/routing/types";
import {
  DEMO_COST_SAVED_USD,
  DEMO_MARKETPLACE_COUNT,
  DEMO_MEMORY_LESSONS,
  DEMO_ROUND_ID,
  DEMO_WINNER_AGENT,
  DEMO_WINNER_SCORE,
} from "@/lib/tournament/mission-control-demo";
import { isCompletedViewMode, type TournamentViewMode } from "@/lib/tournament/view-mode-labels";

type Props = {
  tournament: Tournament;
  countdownSec: number | null;
  persistMessage: string | null;
  engineMode: TournamentMode;
  runtimeMode?: TournamentRuntimeMode;
  viewMode?: TournamentViewMode;
  supabaseConfigured: boolean;
  supabaseTableReady: boolean;
  supabaseHint: string | null;
  persistIsError?: boolean;
  marketplaceCount?: number;
  memoryLessons?: number;
  onRunNow?: () => void;
  onReplay?: () => void;
  onSwitchLive?: () => void;
  busy?: boolean;
};

export function TournamentStatusCard({
  tournament,
  countdownSec,
  persistMessage,
  engineMode,
  runtimeMode = DEFAULT_RUNTIME_MODE,
  viewMode = "completed_sample",
  supabaseConfigured,
  supabaseTableReady,
  supabaseHint,
  persistIsError,
  marketplaceCount = DEMO_MARKETPLACE_COUNT,
  memoryLessons = DEMO_MEMORY_LESSONS,
  onRunNow,
  onReplay,
  onSwitchLive,
  busy,
}: Props) {
  const t = useTranslations();
  const ts = t.tournament.status;
  const tc = t.tournament.common;
  const phaseLabel = translateTournamentPhase(tournament.phase, t);
  const intervalMin = getLoopIntervalMs() / 60000;
  const winner =
    [...tournament.evaluations].sort((a, b) => b.totalScore - a.totalScore)[0]?.agentName ??
    DEMO_WINNER_AGENT;
  const winnerScore =
    [...tournament.evaluations].sort((a, b) => b.totalScore - a.totalScore)[0]?.totalScore ??
    DEMO_WINNER_SCORE;
  const cta = translateViewModeCta(viewMode, t);
  const showDemoStats = isCompletedViewMode(viewMode);

  const supabaseBadge = !supabaseConfigured
    ? ts.badges.supabaseOff
    : supabaseTableReady
      ? ts.badges.supabaseReady
      : ts.badges.supabaseTableMissing;

  return (
    <section className="glass-card overflow-hidden rounded-2xl border border-violet-500/20">
      <div className="border-b border-white/10 bg-gradient-to-r from-violet-500/10 via-transparent to-cyan-500/10 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400/80">
              {fillTemplate(ts.engineLabel, { roundId: DEMO_ROUND_ID })}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              {fillTemplate(ts.roundPhase, {
                round: String(tournament.round || 12),
                phase: phaseLabel,
              })}
            </h2>
            <p className="mt-1 text-sm text-cyan-300/90">
              {fillTemplate(ts.currentView, {
                view: translateViewModeStatus(viewMode, t),
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              label={tournament.paused ? ts.badges.paused : ts.badges.autoLoop}
              tone={tournament.paused ? "amber" : "emerald"}
            />
            <Badge label={translateRuntimeMode(runtimeMode, t)} tone="cyan" />
            <Badge
              label={engineMode === "live" ? ts.badges.apiActive : ts.badges.offline}
              tone="neutral"
            />
            <Badge label={supabaseBadge} tone={supabaseConfigured && supabaseTableReady ? "emerald" : "neutral"} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-b border-white/10 p-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <Stat label={ts.stats.loopInterval} value={`${intervalMin} ${tc.min}`} />
        <Stat
          label={ts.stats.nextRun}
          value={
            viewMode === "live" && !tournament.paused && countdownSec !== null
              ? `${Math.floor(countdownSec / 60)}:${String(countdownSec % 60).padStart(2, "0")}`
              : ts.stats.manual
          }
          highlight={viewMode === "live" && !tournament.paused && countdownSec !== null && countdownSec < 60}
        />
        <Stat label={ts.stats.lastCompleted} value={formatTime(tournament.completedAt)} />
        <Stat label={translateViewModeRunsStat(viewMode, t)} value={String(tournament.activeRuns.length)} />
        <Stat label={ts.stats.winner} value={winner} />
        <Stat label={ts.stats.finalScore} value={`${winnerScore.toFixed(0)}`} highlight />
      </div>

      {showDemoStats && (
        <div className="grid gap-3 border-b border-white/10 bg-black/20 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <DemoStat label={ts.stats.selectedChallenge} value="Executive Summary Battle" />
          <DemoStat label={ts.stats.costSaved} value={`$${DEMO_COST_SAVED_USD.toFixed(2)}`} />
          <DemoStat label={ts.stats.marketplaceCandidates} value={String(marketplaceCount)} />
          <DemoStat label={ts.stats.memoryLessons} value={String(memoryLessons)} />
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-white/10 px-5 py-4">
        <ActionButton onClick={onRunNow} disabled={busy} primary>
          {cta.runNow}
        </ActionButton>
        <ActionButton onClick={onReplay} disabled={busy}>
          {cta.replay}
        </ActionButton>
        <ActionButton onClick={onSwitchLive} disabled={busy}>
          {cta.switchLive}
        </ActionButton>
      </div>

      {supabaseConfigured && !supabaseTableReady && supabaseHint && (
        <p className="border-t border-amber-500/20 bg-amber-500/5 px-5 py-3 text-xs text-amber-200">
          {supabaseHint}
        </p>
      )}

      {persistMessage && (
        <p
          className={`border-t border-white/10 px-5 py-3 text-xs ${
            persistIsError ? "text-rose-300" : "text-cyan-300"
          }`}
        >
          {persistMessage}
        </p>
      )}
    </section>
  );
}

function Badge({
  label,
  tone,
}: {
  label: string;
  tone: "emerald" | "amber" | "cyan" | "neutral";
}) {
  const styles = {
    emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    amber: "border-amber-500/40 bg-amber-500/10 text-amber-200",
    cyan: "border-cyan-500/40 bg-cyan-500/10 text-cyan-200",
    neutral: "border-white/10 bg-white/5 text-zinc-400",
  };
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${styles[tone]}`}>
      {label}
    </span>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`mt-1 font-mono text-lg ${highlight ? "text-emerald-400" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function DemoStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-cyan-500/15 bg-cyan-500/5 p-3">
      <p className="text-[10px] uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-zinc-200">{value}</p>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  primary,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-3 py-2 text-xs font-medium transition disabled:opacity-50 ${
        primary
          ? "border border-violet-500/40 bg-violet-500/15 text-violet-100 hover:bg-violet-500/25"
          : "border border-white/10 text-zinc-300 hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
