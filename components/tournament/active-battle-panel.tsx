import type { AgentRun, Evaluation } from "@/lib/tournament/types";

type Props = {
  runs: AgentRun[];
  evaluations: Evaluation[];
  agentModels?: Record<string, string>;
};

function modelBadge(agentId: string, modelUsed: string, agentModels?: Record<string, string>) {
  const routed = agentModels?.[agentId];
  if (routed) {
    return (
      <span className="mt-1 inline-block rounded bg-violet-500/15 px-1.5 py-0.5 font-mono text-[10px] text-violet-300">
        {routed}
      </span>
    );
  }
  return <p className="text-xs text-zinc-500">{modelUsed}</p>;
}

function constitutionBadge(run: AgentRun) {
  if (!run.constitutionVersion) return null;
  return (
    <span className="mt-1 inline-block rounded border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300">
      {run.constitutionVersion}
    </span>
  );
}

export function ActiveBattlePanel({ runs, evaluations, agentModels }: Props) {
  const evalByRun = new Map(evaluations.map((e) => [e.runId, e]));

  return (
    <section className="glass-card overflow-hidden rounded-2xl">
      <div className="border-b border-white/10 px-5 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          4 · Active battle
        </h3>
        <p className="text-xs text-zinc-500">5 competitor agents · 2 judges (mock)</p>
      </div>

      {runs.length === 0 ? (
        <p className="p-8 text-center text-sm text-zinc-600">No active runs</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
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
                      <div className="flex flex-wrap gap-1">
                        {modelBadge(run.agentId, run.modelUsed, agentModels)}
                        {constitutionBadge(run)}
                      </div>
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
