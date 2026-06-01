import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCost, type LeaderboardEntry } from "@/lib/data/leaderboard";
import { cn } from "@/lib/utils";

function rankStyles(rank: number) {
  if (rank === 1) {
    return {
      row: "bg-amber-500/[0.07] hover:bg-amber-500/10",
      badge: "bg-amber-500/25 text-amber-200 ring-1 ring-amber-500/40",
      player: "text-amber-100",
    };
  }
  if (rank === 2) {
    return {
      row: "bg-zinc-400/[0.06] hover:bg-zinc-400/10",
      badge: "bg-zinc-400/20 text-zinc-200 ring-1 ring-zinc-400/30",
      player: "text-zinc-100",
    };
  }
  if (rank === 3) {
    return {
      row: "bg-orange-700/[0.08] hover:bg-orange-700/12",
      badge: "bg-orange-700/25 text-orange-200 ring-1 ring-orange-600/30",
      player: "text-orange-100",
    };
  }
  return {
    row: "hover:bg-muted/30",
    badge: "border border-border bg-muted/30 text-muted-foreground",
    player: "text-foreground",
  };
}

type LeaderboardTableProps = {
  entries: LeaderboardEntry[];
};

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <Card className="border-border/80 bg-card/40">
        <CardHeader className="text-center">
          <CardTitle className="text-lg">No scores yet</CardTitle>
          <CardDescription>
            Be the first on the board. Submit your entry and the AI Judge will score it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
          <Button asChild className="rounded-full">
            <Link href="/submit">Submit your entry</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 bg-card/40">
      <CardHeader className="border-b border-border/60 pb-4">
        <CardTitle className="text-lg">Full standings</CardTitle>
        <CardDescription>
          Best scored attempt per player — 80% quality + 20% cost efficiency
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Player</th>
                <th className="px-6 py-4 text-right">Quality score</th>
                <th className="px-6 py-4 text-right">Cost</th>
                <th className="px-6 py-4 text-right">Final score</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const styles = rankStyles(entry.rank);
                return (
                  <tr
                    key={`${entry.rank}-${entry.player}`}
                    className={cn("border-b border-border/60 transition-colors", styles.row)}
                  >
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex h-8 w-8 items-center justify-center rounded-lg font-mono text-sm font-semibold",
                          styles.badge
                        )}
                      >
                        {entry.rank}
                      </span>
                    </td>
                    <td className={cn("px-6 py-4 font-medium", styles.player)}>
                      {entry.player}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                      {entry.qualityScore}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                      {formatCost(entry.cost)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-base font-semibold text-primary">
                      {entry.finalScore.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <ul className="divide-y divide-border md:hidden">
          {entries.map((entry) => {
            const styles = rankStyles(entry.rank);
            const isTopThree = entry.rank <= 3;
            return (
              <li
                key={`${entry.rank}-${entry.player}`}
                className={cn(
                  "px-4 py-4",
                  styles.row,
                  isTopThree && "border-l-2 border-l-primary/50"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-semibold",
                        styles.badge
                      )}
                    >
                      #{entry.rank}
                    </span>
                    <div>
                      <p className={cn("font-medium", styles.player)}>{entry.player}</p>
                      <p className="text-xs text-muted-foreground">
                        Quality {entry.qualityScore} · {formatCost(entry.cost)}
                      </p>
                    </div>
                  </div>
                  <p className="font-mono text-lg font-bold text-primary">
                    {entry.finalScore.toFixed(1)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
