import { TrendingDown, TrendingUp, Minus } from "lucide-react";

import { AgentScoreFormulaHelp } from "@/components/tournament/agent-score-formula-help";
import type { LeaderboardEntry } from "@/lib/tournament/types";
import {
  VIEW_MODE_LEADERBOARD_TITLE,
  type TournamentViewMode,
} from "@/lib/tournament/view-mode-labels";

type Props = {
  entries: LeaderboardEntry[];
  viewMode?: TournamentViewMode;
  embedded?: boolean;
};

export function LiveLeaderboard({ entries, viewMode = "completed_sample", embedded }: Props) {
  return (
    <section className={embedded ? "" : "glass-card overflow-hidden rounded-2xl"}>
      {!embedded && (
        <div className="border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-transparent px-5 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            8 · {VIEW_MODE_LEADERBOARD_TITLE[viewMode]}
          </h3>
        </div>
      )}
      {entries.length === 0 ? (
        <p className="p-8 text-center text-sm text-zinc-600">No scores yet — run a tournament loop.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead className="bg-white/5 text-left text-[10px] uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-3 py-2.5">#</th>
                  <th className="px-3 py-2.5">Agent</th>
                  <th className="px-3 py-2.5 text-right">Final</th>
                  <th className="px-3 py-2.5 text-right">Quality</th>
                  <th className="px-3 py-2.5 text-right">Efficiency</th>
                  <th className="px-3 py-2.5 text-right">Marketplace</th>
                  <th className="px-3 py-2.5 text-right">Penalty</th>
                  <th className="px-3 py-2.5 text-right">Cost</th>
                  <th className="px-3 py-2.5 text-right">Tokens</th>
                  <th className="px-3 py-2.5 text-right">Trend</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr
                    key={e.agentId}
                    className={`border-t border-white/5 ${e.rank === 1 ? "bg-emerald-500/5" : ""}`}
                  >
                    <td className="px-3 py-3 font-mono text-zinc-500">{e.rank}</td>
                    <td className="px-3 py-3 font-medium text-zinc-200">{e.agentName}</td>
                    <td className="px-3 py-3 text-right font-mono text-lg text-emerald-300">
                      {e.totalScore.toFixed(1)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-zinc-400">
                      {e.qualityScore?.toFixed(0) ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-zinc-400">
                      {e.efficiencyScore?.toFixed(0) ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-amber-300/90">
                      {e.marketplaceScore?.toFixed(1) ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-red-400/80">
                      {e.penaltyTotal != null && e.penaltyTotal < 0 ? e.penaltyTotal : "0"}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-cyan-400">
                      ${e.avgCost.toFixed(3)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-violet-300">
                      {e.avgTokens.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <TrendIcon trend={e.trend} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-white/10 p-4">
            <AgentScoreFormulaHelp />
          </div>
        </>
      )}
    </section>
  );
}

function TrendIcon({ trend }: { trend: LeaderboardEntry["trend"] }) {
  if (trend === "up") return <TrendingUp className="ml-auto size-4 text-emerald-400" />;
  if (trend === "down") return <TrendingDown className="ml-auto size-4 text-red-400" />;
  return <Minus className="ml-auto size-4 text-zinc-500" />;
}
