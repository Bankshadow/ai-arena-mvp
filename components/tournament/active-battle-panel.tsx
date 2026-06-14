import type { AgentRun, Evaluation } from "@/lib/tournament/types";
import {
  isCompletedViewMode,
  VIEW_MODE_BATTLE_TITLE,
  type TournamentViewMode,
} from "@/lib/tournament/view-mode-labels";

type Props = {
  runs: AgentRun[];
  evaluations: Evaluation[];
  agentModels?: Record<string, string>;
  viewMode?: TournamentViewMode;
};

function modelBadge(agentId: string, modelUsed: string, agentModels?: Record<string, string>) {
  const routed = agentModels?.[agentId];
  const label = routed ?? modelUsed;
  return (
    <span className="mt-1 inline-block rounded bg-violet-500/15 px-1.5 py-0.5 font-mono text-[10px] text-violet-300">
      {label}
    </span>
  );
}

function FailBadge({ evaluation }: { evaluation: Evaluation }) {
  if (evaluation.passed || !evaluation.failReason) return null;
  return (
    <span
      title={`Gate: ${evaluation.gateFailed?.replace(/_/g, " ") ?? "failed"}`}
      className="mt-2 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] text-red-300"
    >
      {evaluation.failReason}
    </span>
  );
}

export function ActiveBattlePanel({ runs, evaluations, agentModels, viewMode = "completed_sample" }: Props) {
  const evalByRun = new Map(evaluations.map((e) => [e.runId, e]));
  const completedMode = isCompletedViewMode(viewMode) || (runs.length > 0 && runs.every((r) => evalByRun.has(r.id)));

  return (
    <section className="glass-card overflow-hidden rounded-2xl">
      <div className="border-b border-white/10 px-5 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          4 · {VIEW_MODE_BATTLE_TITLE[viewMode]}
        </h3>
        <p className="text-xs text-zinc-500">
          {completedMode
            ? "5 competitor agents · completed · 2 judges (mock)"
            : "5 competitor agents · live · 2 judges (mock)"}
        </p>
      </div>

      {runs.length === 0 ? (
        <p className="p-8 text-center text-sm text-zinc-600">No agent runs yet — run a tournament loop.</p>
      ) : completedMode ? (
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {runs.map((run) => {
            const ev = evalByRun.get(run.id);
            return (
              <article
                key={run.id}
                className={`rounded-xl border p-4 ${
                  ev?.passed
                    ? "border-emerald-500/25 bg-emerald-500/5"
                    : "border-red-500/20 bg-red-500/5"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-zinc-100">{run.agentName}</p>
                    {modelBadge(run.agentId, run.modelUsed, agentModels)}
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${
                      ev?.passed
                        ? "border-emerald-500/40 text-emerald-300"
                        : "border-red-500/40 text-red-300"
                    }`}
                  >
                    {ev?.passed ? "completed" : "fail"}
                  </span>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <Stat label="Score" value={ev ? ev.totalScore.toFixed(1) : "—"} accent />
                  <Stat label="Tokens" value={(run.tokensIn + run.tokensOut).toLocaleString()} />
                  <Stat label="Cost" value={`$${run.costUsd.toFixed(3)}`} />
                  <Stat label="Latency" value={`${(run.latencyMs / 1000).toFixed(1)}s`} />
                </dl>
                <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
                  {run.promptStrategySummary ??
                    ev?.efficiencyJudgeNotes ??
                    "Single-pass structured brief workflow."}
                </p>
                {ev && <FailBadge evaluation={ev} />}
                {ev && ev.penaltyTotal < 0 && (
                  <p className="mt-2 text-[10px] text-red-400/90">
                    Penalty {ev.penaltyTotal} pts applied
                  </p>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-white/5 text-left text-[10px] uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-2.5">Agent</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Tokens</th>
                <th className="px-4 py-2.5 text-right">Cost</th>
                <th className="px-4 py-2.5 text-right">Latency</th>
                <th className="px-4 py-2.5 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => {
                const ev = evalByRun.get(run.id);
                const live = !ev;
                return (
                  <tr key={run.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-200">{run.agentName}</p>
                      {modelBadge(run.agentId, run.modelUsed, agentModels)}
                      {ev && !ev.passed && (
                        <div className="mt-1">
                          <FailBadge evaluation={ev} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {live ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                          Running
                        </span>
                      ) : ev?.passed ? (
                        <span className="text-emerald-400">Pass</span>
                      ) : (
                        <span className="text-red-400">Fail</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-violet-300">
                      {(run.tokensIn + run.tokensOut).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-cyan-400">
                      ${run.costUsd.toFixed(3)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-400">
                      {(run.latencyMs / 1000).toFixed(1)}s
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-white">
                      {ev ? ev.totalScore.toFixed(1) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <dt className="text-zinc-600">{label}</dt>
      <dd className={`font-mono ${accent ? "text-emerald-300" : "text-zinc-300"}`}>{value}</dd>
    </div>
  );
}
