import Link from "next/link";
import { Trophy } from "lucide-react";

import { getAgentById } from "@/lib/agents/personas";
import type { BattleMode } from "@/lib/battle/saved-battle";
import type { BattleResult } from "@/lib/battle/types";

type Props = {
  result: BattleResult;
  mode?: BattleMode;
  savedBattleId?: string | null;
  persistNote?: string | null;
};

export function BattleResults({ result, mode, savedBattleId, persistNote }: Props) {
  const passThreshold = result.challenge.passThreshold;

  return (
    <div className="space-y-6">
      {mode === "demo" && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Demo mode — simulated token counts + heuristic judge. Add{" "}
          <code className="text-amber-100">ANTHROPIC_API_KEY</code> for live LLM battles.
        </p>
      )}

      {persistNote && (
        <p className="rounded-lg border border-zinc-500/30 bg-zinc-500/10 px-4 py-3 text-sm text-zinc-400">
          {persistNote}
        </p>
      )}

      {savedBattleId && (
        <p className="text-sm text-zinc-400">
          Battle saved.{" "}
          <Link href={`/battles/${savedBattleId}`} className="text-cyan-400 hover:underline">
            View replay →
          </Link>
          {" · "}
          <Link href="/battles" className="text-cyan-400 hover:underline">
            All battles
          </Link>
        </p>
      )}

      {result.winner ? (
        <div className="glass-card rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <div className="flex items-center gap-3">
            <Trophy className="size-8 text-emerald-400" />
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-400/80">Winner</p>
              <p className="text-xl font-semibold text-white">
                {getAgentById(result.winner.agentId)?.name}
              </p>
              <p className="text-sm text-zinc-400">
                Passed with{" "}
                <span className="font-mono text-emerald-300">
                  {result.winner.totalTokens.toLocaleString()} tokens
                </span>{" "}
                (quality {result.winner.qualityAdj}/{passThreshold} gate)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-amber-200">
          No agent passed the quality gate ({passThreshold}/100).
        </div>
      )}

      <div className="glass-card overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Agent</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Tokens</th>
              <th className="px-4 py-3 text-right">Quality</th>
              <th className="px-4 py-3 text-right">Cost</th>
            </tr>
          </thead>
          <tbody>
            {result.entries.map((entry) => {
              const isWinner = result.winner?.agentId === entry.agentId;
              return (
                <tr
                  key={entry.agentId}
                  className={isWinner ? "bg-emerald-500/10" : "border-t border-white/5"}
                >
                  <td className="px-4 py-3 font-mono text-zinc-500">{entry.rank ?? "—"}</td>
                  <td className="px-4 py-3 font-medium text-zinc-200">
                    {getAgentById(entry.agentId)?.name}
                  </td>
                  <td className="px-4 py-3">
                    {entry.passed ? (
                      <span className="text-emerald-400">Pass</span>
                    ) : (
                      <span className="text-red-400" title={entry.failReason}>
                        Fail
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-violet-300">
                    {entry.totalTokens.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-white">{entry.qualityAdj}</td>
                  <td className="px-4 py-3 text-right font-mono text-cyan-400">
                    ${entry.run.costUsd.toFixed(4)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <details className="glass-card rounded-2xl p-4">
        <summary className="cursor-pointer text-sm text-zinc-300">Challenge source document</summary>
        <pre className="mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap text-xs text-zinc-500">
          {result.challenge.inputDoc}
        </pre>
      </details>

      <details className="glass-card rounded-2xl p-4">
        <summary className="cursor-pointer text-sm text-zinc-300">Agent outputs</summary>
        <div className="mt-4 space-y-4">
          {result.entries.map((entry) => (
            <div
              key={entry.agentId}
              className="rounded-lg border border-white/10 bg-black/20 p-3"
            >
              <p className="text-sm font-medium text-violet-200">
                {getAgentById(entry.agentId)?.name}
              </p>
              <pre className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap text-xs text-zinc-500">
                {entry.fullOutput}
              </pre>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
