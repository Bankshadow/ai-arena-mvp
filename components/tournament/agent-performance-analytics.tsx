import type { Evaluation, LeaderboardEntry } from "@/lib/tournament/types";
import { SCORE_WEIGHTS } from "@/lib/tournament/scoring";

type Props = {
  evaluations: Evaluation[];
  leaderboard: LeaderboardEntry[];
};

export function AgentPerformanceAnalytics({ evaluations, leaderboard }: Props) {
  const top = evaluations.sort((a, b) => b.totalScore - a.totalScore)[0];
  const avgScore =
    evaluations.length > 0
      ? evaluations.reduce((s, e) => s + e.totalScore, 0) / evaluations.length
      : 0;

  return (
    <section className="glass-card rounded-2xl p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
        7 · Agent performance
      </h3>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs text-zinc-500">Round leader</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {top?.agentName ?? leaderboard[0]?.agentName ?? "—"}
          </p>
          <p className="font-mono text-emerald-400">{top?.totalScore.toFixed(1) ?? "—"}/100</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs text-zinc-500">Field average</p>
          <p className="mt-1 font-mono text-2xl text-violet-300">
            {evaluations.length ? avgScore.toFixed(1) : "—"}
          </p>
        </div>
      </div>

      {top && (
        <div className="mt-4 space-y-3">
          <ScoreBar label="Quality" value={top.qualityScore} max={SCORE_WEIGHTS.qualityMax} color="violet" />
          <ScoreBar label="Efficiency" value={top.efficiencyScore} max={SCORE_WEIGHTS.efficiencyMax} color="cyan" />
          <ScoreBar
            label="Marketplace"
            value={top.marketplaceScore}
            max={SCORE_WEIGHTS.marketplaceMax}
            color="amber"
          />
          {top.penaltyTotal < 0 && (
            <p className="text-xs text-red-400">Penalties: {top.penaltyTotal}</p>
          )}
        </div>
      )}

      <div className="mt-4 grid grid-cols-5 gap-1">
        {leaderboard.map((e) => (
          <div key={e.agentId} className="text-center">
            <div
              className="mx-auto h-16 w-full max-w-[40px] rounded-t bg-gradient-to-t from-violet-500/40 to-violet-500/10"
              style={{ height: `${Math.max(20, (e.totalScore / 100) * 64)}px` }}
            />
            <p className="mt-1 truncate text-[9px] text-zinc-500">{e.agentName.split(" ")[0]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ScoreBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: "violet" | "cyan" | "amber";
}) {
  const pct = Math.round((value / max) * 100);
  const bar =
    color === "violet"
      ? "bg-violet-500"
      : color === "cyan"
        ? "bg-cyan-500"
        : "bg-amber-500";

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="font-mono text-zinc-300">
          {value}/{max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full ${bar} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
