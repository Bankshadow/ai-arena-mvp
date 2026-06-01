import { formatCost } from "@/lib/data/leaderboard";

export type LeaderboardRow = {
  rank: number;
  player: string;
  qualityScore: number;
  cost: number;
  costScore: number;
  finalScore: number;
  modelUsed: string;
  highlight?: boolean;
};

function rankBadgeClass(rank: number) {
  if (rank === 1) return "bg-amber-500/25 text-amber-200 ring-1 ring-amber-500/40";
  if (rank === 2) return "bg-zinc-400/20 text-zinc-200 ring-1 ring-zinc-400/30";
  if (rank === 3) return "bg-orange-700/25 text-orange-200 ring-1 ring-orange-600/30";
  return "border border-white/15 bg-white/5 text-zinc-400";
}

type LeaderboardTableProps = {
  rows: LeaderboardRow[];
};

export function LeaderboardTable({ rows }: LeaderboardTableProps) {
  if (rows.length === 0) {
    return (
      <p className="glass-card rounded-xl p-8 text-center text-sm text-zinc-400">
        No entries yet. Submit your solution to appear on the board.
      </p>
    );
  }

  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-4">Rank</th>
              <th className="px-5 py-4">Player</th>
              <th className="px-5 py-4 text-right">Quality</th>
              <th className="px-5 py-4 text-right">Cost</th>
              <th className="px-5 py-4 text-right">Cost score</th>
              <th className="px-5 py-4 text-right">Final</th>
              <th className="px-5 py-4">Model</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.rank}-${row.player}`}
                className={`border-b border-white/5 transition hover:bg-white/[0.03] ${
                  row.highlight ? "bg-cyan-500/[0.06]" : ""
                }`}
              >
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg font-mono text-sm font-semibold ${rankBadgeClass(row.rank)}`}
                  >
                    {row.rank}
                  </span>
                </td>
                <td className="px-5 py-4 font-medium">{row.player}</td>
                <td className="px-5 py-4 text-right font-mono text-zinc-300">
                  {row.qualityScore}
                </td>
                <td className="px-5 py-4 text-right font-mono text-zinc-400">
                  {formatCost(row.cost)}
                </td>
                <td className="px-5 py-4 text-right font-mono text-zinc-400">
                  {row.costScore}
                </td>
                <td className="px-5 py-4 text-right font-mono font-semibold text-cyan-400">
                  {row.finalScore.toFixed(1)}
                </td>
                <td className="px-5 py-4 text-zinc-400">{row.modelUsed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-white/10 md:hidden">
        {rows.map((row) => (
          <li
            key={`${row.rank}-${row.player}-m`}
            className={`px-4 py-4 ${row.highlight ? "bg-cyan-500/[0.06]" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm ${rankBadgeClass(row.rank)}`}
                >
                  #{row.rank}
                </span>
                <div>
                  <p className="font-medium">{row.player}</p>
                  <p className="text-xs text-zinc-500">{row.modelUsed}</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Q {row.qualityScore} · {formatCost(row.cost)} · Cost {row.costScore}
                  </p>
                </div>
              </div>
              <p className="font-mono text-lg font-bold text-cyan-400">
                {row.finalScore.toFixed(1)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
