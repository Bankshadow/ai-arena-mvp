import type { Tournament, TournamentPhase } from "@/lib/tournament/types";
import type { TournamentMode } from "@/lib/tournament/engine";
import { getLoopIntervalMs } from "@/lib/tournament/engine";

const PHASE_LABELS: Record<TournamentPhase, string> = {
  idle: "Standby",
  generating: "Generating challenges",
  selecting: "Selecting challenge",
  running: "Agents running",
  judging: "Judges evaluating",
  scoring: "Calculating scores",
  marketplace: "Seeding marketplace",
  complete: "Round complete",
};

type Props = {
  tournament: Tournament;
  countdownSec: number | null;
  persistMessage: string | null;
  engineMode: TournamentMode;
  supabaseConfigured: boolean;
  supabaseTableReady: boolean;
  supabaseHint: string | null;
  persistIsError?: boolean;
};

export function TournamentStatusCard({
  tournament,
  countdownSec,
  persistMessage,
  engineMode,
  supabaseConfigured,
  supabaseTableReady,
  supabaseHint,
  persistIsError,
}: Props) {
  const phaseLabel = PHASE_LABELS[tournament.phase];
  const intervalMin = getLoopIntervalMs() / 60000;

  return (
    <section className="glass-card overflow-hidden rounded-2xl border border-violet-500/20">
      <div className="border-b border-white/10 bg-gradient-to-r from-violet-500/10 via-transparent to-cyan-500/10 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400/80">
              Tournament Engine
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Round {tournament.round || "—"} · {phaseLabel}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                tournament.paused
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                  : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              }`}
            >
              {tournament.paused ? "Paused" : "Auto loop active"}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                engineMode === "live"
                  ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-200"
                  : "border-white/10 bg-white/5 text-zinc-400"
              }`}
            >
              {engineMode === "live" ? "Live LLM" : "Mock mode"}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-xs ${
                supabaseConfigured && supabaseTableReady
                  ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300/80"
                  : supabaseConfigured
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                    : "border-zinc-700 bg-zinc-900/50 text-zinc-500"
              }`}
            >
              Supabase{" "}
              {!supabaseConfigured
                ? "off"
                : supabaseTableReady
                  ? "ready"
                  : "table missing"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Loop interval" value={`${intervalMin} min`} />
        <Stat
          label="Next run"
          value={
            tournament.paused
              ? "—"
              : countdownSec !== null
                ? `${Math.floor(countdownSec / 60)}:${String(countdownSec % 60).padStart(2, "0")}`
                : "Manual"
          }
          highlight={!tournament.paused && countdownSec !== null && countdownSec < 60}
        />
        <Stat label="Last completed" value={formatTime(tournament.completedAt)} />
        <Stat label="Active runs" value={String(tournament.activeRuns.length)} />
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

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
