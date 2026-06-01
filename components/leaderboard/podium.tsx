import { Crown, Medal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCost, type LeaderboardEntry } from "@/lib/data/leaderboard";
import { cn } from "@/lib/utils";

const PODIUM_STYLES: Record<
  1 | 2 | 3,
  { card: string; badge: string; height: string; glow: string }
> = {
  1: {
    card: "border-amber-500/40 bg-gradient-to-b from-amber-500/15 to-card/60",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    height: "md:mt-0",
    glow: "shadow-amber-500/10 shadow-lg",
  },
  2: {
    card: "border-zinc-400/30 bg-gradient-to-b from-zinc-400/10 to-card/60",
    badge: "bg-zinc-400/20 text-zinc-200 border-zinc-400/30",
    height: "md:mt-8",
    glow: "shadow-zinc-500/5 shadow-md",
  },
  3: {
    card: "border-orange-600/30 bg-gradient-to-b from-orange-700/10 to-card/60",
    badge: "bg-orange-700/20 text-orange-300 border-orange-600/30",
    height: "md:mt-12",
    glow: "shadow-orange-900/10 shadow-md",
  },
};

function PodiumCard({ entry, place }: { entry: LeaderboardEntry; place: 1 | 2 | 3 }) {
  const styles = PODIUM_STYLES[place];
  const orderClass =
    place === 1 ? "order-1 md:order-2" : place === 2 ? "order-2 md:order-1" : "order-3";

  return (
    <Card
      className={cn(
        "relative flex-1 border transition-transform hover:scale-[1.02]",
        styles.card,
        styles.height,
        styles.glow,
        orderClass
      )}
    >
      {place === 1 && (
        <Crown className="absolute -top-3 left-1/2 size-6 -translate-x-1/2 text-amber-400" />
      )}
      <CardContent className="flex flex-col items-center p-5 pt-6 text-center sm:p-6">
        <Badge variant="outline" className={cn("mb-3 font-mono", styles.badge)}>
          #{entry.rank}
        </Badge>
        <p className="text-lg font-semibold tracking-tight">{entry.player}</p>
        <p className="mt-1 font-mono text-2xl font-bold text-primary">
          {entry.finalScore.toFixed(1)}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">Final score</p>
        <dl className="mt-4 grid w-full grid-cols-2 gap-2 text-xs">
          <div className="rounded-md border border-border/60 bg-background/40 px-2 py-1.5">
            <dt className="text-muted-foreground">Quality</dt>
            <dd className="font-mono font-medium">{entry.qualityScore}</dd>
          </div>
          <div className="rounded-md border border-border/60 bg-background/40 px-2 py-1.5">
            <dt className="text-muted-foreground">Cost</dt>
            <dd className="font-mono font-medium">{formatCost(entry.cost)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

type PodiumProps = {
  entries: LeaderboardEntry[];
};

export function Podium({ entries }: PodiumProps) {
  const first = entries.find((e) => e.rank === 1);
  const second = entries.find((e) => e.rank === 2);
  const third = entries.find((e) => e.rank === 3);

  if (!first) return null;

  return (
    <div className="mb-10">
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Medal className="size-4 text-primary" />
        <span>Top performers</span>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-3">
        {second && <PodiumCard entry={second} place={2} />}
        <PodiumCard entry={first} place={1} />
        {third && <PodiumCard entry={third} place={3} />}
      </div>
    </div>
  );
}
