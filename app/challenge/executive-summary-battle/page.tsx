import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  CircleDollarSign,
  FileText,
  Scale,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

import { ChallengeHeader } from "@/components/challenge/challenge-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";
import {
  buildChallengeView,
  challengeStatusLabel,
} from "@/lib/challenges/view-model";
import { getChallengeBySlug } from "@/lib/queries/challenges";
import { getChallengeSubmissionStats } from "@/lib/queries/stats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Executive Summary Battle #1 | AI ARENA",
  description:
    "Summarize a 20-page PDF under $1. Compete on quality and cost efficiency in AI ARENA's first challenge.",
};

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <Card className="border-border/80 bg-card/50">
      <CardContent className="flex items-start gap-3 p-4 sm:p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/30">
          <Icon className="size-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-sm font-semibold leading-snug text-foreground sm:text-base">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function ExecutiveSummaryBattlePage() {
  let challenge = buildChallengeView(null);
  let submissionCount = 0;
  let uniquePlayers = 0;

  try {
    const dbChallenge = await getChallengeBySlug(DEFAULT_CHALLENGE_SLUG);
    challenge = buildChallengeView(dbChallenge);
    if (dbChallenge) {
      const stats = await getChallengeSubmissionStats(dbChallenge.id);
      submissionCount = stats.submissionCount;
      uniquePlayers = stats.uniqueSubmitters;
    }
  } catch {
    // fallback to static view
  }

  const statusLabel = challengeStatusLabel(challenge.status);
  const participantsLabel =
    submissionCount > 0
      ? `${submissionCount} submission${submissionCount === 1 ? "" : "s"} · ${uniquePlayers} player${uniquePlayers === 1 ? "" : "s"}`
      : "Be the first to submit";

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]"
        aria-hidden
      />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-40" aria-hidden />

      <ChallengeHeader />

      <main className="relative mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">
                CHALLENGE-001
              </Badge>
              <Badge
                className={
                  challenge.isOpen
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/10"
                }
              >
                {statusLabel}
              </Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              {challenge.name}
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">{challenge.tagline}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={CircleDollarSign} label="Cost limit" value={challenge.costLimit} />
          <StatCard icon={Calendar} label="Deadline" value={challenge.deadlineLabel} />
          <StatCard icon={Trophy} label="Prize pool" value={challenge.prizePool.total} />
          <StatCard icon={Users} label="Activity" value={participantsLabel} />
        </div>

        {challenge.inputFileUrl && (
          <p className="mt-4 text-sm">
            <a
              href={challenge.inputFileUrl}
              className="font-medium text-primary hover:underline"
              download
            >
              Download challenge PDF →
            </a>
          </p>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            <Card className="border-border/80 bg-card/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="size-5 text-primary" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">{challenge.description}</p>
                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Input
                    </dt>
                    <dd className="mt-1 text-sm font-medium">{challenge.input}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Attempts
                    </dt>
                    <dd className="mt-1 text-sm font-medium">{challenge.attempts}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card/40">
              <CardHeader>
                <CardTitle className="text-xl">Rules</CardTitle>
                <CardDescription>
                  Same constraints for every competitor — skill decides the outcome.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {challenge.rules.map((rule, i) => (
                    <li
                      key={rule}
                      className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border bg-muted/30 font-mono text-xs text-foreground">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{rule}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Scale className="size-5 text-primary" />
                  Scoring formula
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm font-medium text-foreground">
                  {challenge.scoringFormula.label}
                </p>
                <div className="flex flex-wrap gap-3">
                  {challenge.scoringFormula.breakdown.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg border border-border bg-muted/20 px-4 py-3"
                    >
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="mt-0.5 font-mono text-lg font-semibold text-primary">
                        {item.weight}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {challenge.scoringFormula.summary}
                </p>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card className="border-primary/20 bg-gradient-to-b from-primary/10 to-card/40 shadow-lg shadow-primary/5">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Join the battle</CardTitle>
                <CardDescription>
                  {challenge.isOpen
                    ? "Challenge is open — submit your workflow now."
                    : "We are selecting the first 50 beta challengers for this cohort."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  {challenge.isOpen ? (
                    <Button className="w-full rounded-full" size="lg" asChild>
                      <Link href="/submit">Submit entry</Link>
                    </Button>
                  ) : (
                    <Button className="w-full rounded-full" size="lg" asChild>
                      <Link href="/#waitlist">Join Beta Waitlist</Link>
                    </Button>
                  )}
                  <Button className="w-full rounded-full" variant="outline" size="lg" asChild>
                    <Link href="/leaderboard">View leaderboard</Link>
                  </Button>
                </div>
                <Separator />
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Cost limit</span>
                    <span className="text-right font-medium">{challenge.costLimit}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Deadline</span>
                    <span className="text-right font-medium">{challenge.deadlineLabel}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Prize pool</span>
                    <span className="font-mono font-semibold text-primary">
                      {challenge.prizePool.total}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="size-4 text-amber-400" />
                  Prize pool
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-2xl font-semibold">{challenge.prizePool.total}</p>
                <ul className="mt-4 space-y-2">
                  {challenge.prizePool.distribution.map((tier) => (
                    <li
                      key={tier.place}
                      className="flex justify-between text-sm text-muted-foreground"
                    >
                      <span>{tier.place}</span>
                      <span className="font-medium text-foreground">{tier.amount}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
