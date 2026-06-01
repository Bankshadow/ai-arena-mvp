import Link from "next/link";
import { AlertCircle, Trophy } from "lucide-react";

import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { Podium } from "@/components/leaderboard/podium";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";
import {
  formatLeaderboardUpdatedAt,
  getLeaderboardByChallengeSlug,
} from "@/lib/queries/leaderboard";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  let data = null;
  let dbError: string | null = null;

  try {
    data = await getLeaderboardByChallengeSlug(DEFAULT_CHALLENGE_SLUG);
    if (!data) {
      dbError = "Challenge not found. Run npm run db:seed.";
    }
  } catch {
    dbError =
      "Leaderboard unavailable — set DATABASE_URL and run npm run db:push.";
  }

  const entries = data?.entries ?? [];
  const challengeName = data?.challengeName ?? "Executive Summary Battle #1";
  const updatedLabel = data
    ? formatLeaderboardUpdatedAt(data.updatedAt)
    : "Unavailable";

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]"
        aria-hidden
      />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" aria-hidden />

      <SiteHeader backHref="/challenge/executive-summary-battle" backLabel="Back to challenge" />

      <main className="relative mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary/80">
              Rankings
            </p>
            <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              <Trophy className="size-8 text-amber-400/90" />
              Leaderboard
            </h1>
            <p className="text-muted-foreground">{challengeName}</p>
            {data && data.totalScored > 0 && (
              <p className="text-xs text-muted-foreground">
                {data.totalScored} scored submission{data.totalScored === 1 ? "" : "s"} ·{" "}
                {entries.length} player{entries.length === 1 ? "" : "s"} on board
              </p>
            )}
          </div>
          <Badge variant="outline" className="w-fit font-mono text-[10px] uppercase tracking-wider">
            {updatedLabel}
          </Badge>
        </div>

        {dbError && (
          <Card className="mt-8 border-destructive/30 bg-destructive/5">
            <CardContent className="flex gap-3 p-4 text-sm">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
              <p>{dbError}</p>
            </CardContent>
          </Card>
        )}

        {!dbError && (
          <>
            <div className="mt-10">
              <Podium entries={entries} />
            </div>
            <LeaderboardTable entries={entries} />
          </>
        )}

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button variant="outline" asChild>
            <Link href="/challenge/executive-summary-battle">View challenge</Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href="/submit">Submit your entry</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
