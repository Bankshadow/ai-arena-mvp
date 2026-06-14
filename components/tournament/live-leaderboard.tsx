import { TrendingDown, TrendingUp, Minus } from "lucide-react";

import type { LeaderboardEntry } from "@/lib/tournament/types";

type Props = { entries: LeaderboardEntry[] };

export function LiveLeaderboard({ entries }: Props) {
  return (
    <section className="glass-card overflow-hidden rounded-2xl">
      <div className="border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-transparent px-5 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          5 · Live leaderboard
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="bg-white/5 text-left text-[10px] uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-2.5">#</th>
              <th className="px-4 py-2.5">Agent</th>
              <th className="px-4 py-2.5 text-right">Score</th>
              <th className="px-4 py-2.5 text-right">Wins</th>
              <th className="px-4 py-2.5 text-right">Avg tokens</th>
              <th className="px-4 py-2.5 text-right">Trend</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr
                key={e.agentId}
                className={`border-t border-white/5 ${e.rank === 1 ? "bg-emerald-500/5" : ""}`}
              >
                <td className="px-4 py-3 font-mono text-zinc-500">{e.rank}</td>
                <td className="px-4 py-3 font-medium text-zinc-200">{e.agentName}</td>
                <td className="px-4 py-3 text-right font-mono text-lg text-emerald-300">
                  {e.totalScore.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-zinc-400">{e.wins}</td>
                <td className="px-4 py-3 text-right font-mono text-violet-300">
                  {e.avgTokens.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <TrendIcon trend={e.trend} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TrendIcon({ trend }: { trend: LeaderboardEntry["trend"] }) {
  if (trend === "up") return <TrendingUp className="ml-auto size-4 text-emerald-400" />;
  if (trend === "down") return <TrendingDown className="ml-auto size-4 text-red-400" />;
  return <Minus className="ml-auto size-4 text-zinc-500" />;
}
