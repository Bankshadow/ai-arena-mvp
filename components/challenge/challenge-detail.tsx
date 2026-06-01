import type { ReactNode } from "react";
import Link from "next/link";
import { Download, GitBranch, Scale, Target, Trophy, Users } from "lucide-react";

import { Nav } from "@/components/Nav";
import { StatCard } from "@/components/StatCard";
import type { ChallengePageData } from "@/lib/queries/challenge-page";

const OUTPUT_REQUIREMENTS = [
  "Executive Summary",
  "Key Risks",
  "Recommendations",
];

function statusStyles(status: string) {
  if (status === "open") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }
  if (status === "closed") {
    return "border-zinc-500/30 bg-zinc-500/10 text-zinc-400";
  }
  return "border-amber-500/30 bg-amber-500/10 text-amber-300";
}

type ChallengeDetailProps = {
  data: ChallengePageData;
};

export function ChallengeDetail({ data }: ChallengeDetailProps) {
  const { view } = data;
  const qualityPct = Math.round(parseFloat(view.scoringFormula.breakdown[0]?.weight ?? "80"));
  const costPct = Math.round(parseFloat(view.scoringFormula.breakdown[1]?.weight ?? "20"));

  const joinHref = view.isOpen ? "/submit" : "/#waitlist";
  const joinLabel = view.isOpen ? "Submit entry" : "Join waitlist";

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.12),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
            Challenge #001
          </span>
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusStyles(view.status)}`}
          >
            {data.statusLabel}
          </span>
          {data.dbAvailable && (
            <span className="text-xs text-zinc-500">Live stats from database</span>
          )}
        </div>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{view.name}</h1>
        <p className="mt-2 text-lg text-violet-300/90">{view.tagline}</p>
        <p className="mt-4 text-lg leading-relaxed text-zinc-400">{view.description}</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Cost limit" value={`$${view.costLimitUsd.toFixed(2)}`} />
          <StatCard label="Attempts" value={String(view.attempts)} />
          <StatCard label="Scoring" value={`${qualityPct}% Q + ${costPct}% Cost`} />
          <StatCard label="Deadline" value={view.deadlineLabel} />
        </div>

        {data.dbAvailable && (
          <div className="glass-card mt-6 grid gap-px overflow-hidden rounded-2xl sm:grid-cols-3">
            <StatBlock
              icon={<Users className="size-4 text-cyan-400" />}
              label="Submissions"
              value={String(data.submissionCount)}
            />
            <StatBlock
              icon={<Users className="size-4 text-violet-400" />}
              label="Players"
              value={String(data.uniquePlayers)}
            />
            <StatBlock
              icon={<Trophy className="size-4 text-amber-400" />}
              label="Scored"
              value={String(data.scoredCount)}
            />
          </div>
        )}

        <section className="glass-card mt-10 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Description</h2>
          <p className="mt-3 text-zinc-400 leading-relaxed">{view.description}</p>
          {view.inputFileUrl && (
            <a
              href={view.inputFileUrl}
              className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
            >
              <Download className="size-4" />
              Download challenge input (PDF)
            </a>
          )}
        </section>

        <section className="glass-card mt-6 rounded-2xl p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Target className="size-5 text-violet-400" />
            Input & output
          </h2>
          <p className="mt-3 text-sm text-zinc-400">
            <span className="font-medium text-zinc-200">Input:</span> {view.input}
          </p>
          <p className="mt-4 text-sm font-medium text-zinc-300">Output requirements:</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-zinc-400">
            {OUTPUT_REQUIREMENTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="glass-card mt-6 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Rules</h2>
          <ul className="mt-3 space-y-2">
            {view.rules.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-sm text-zinc-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                {rule}
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-card mt-6 rounded-2xl p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Scale className="size-5 text-cyan-400" />
            Scoring
          </h2>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="rounded-xl border border-white/10 bg-black/20 px-6 py-4 text-center">
              <p className="text-xs text-zinc-500">Quality</p>
              <p className="font-mono text-2xl font-bold text-violet-300">{qualityPct}%</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-6 py-4 text-center">
              <p className="text-xs text-zinc-500">Cost efficiency</p>
              <p className="font-mono text-2xl font-bold text-cyan-400">{costPct}%</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-zinc-500">{view.scoringFormula.summary}</p>
        </section>

        <section className="glass-card neon-glow mt-10 rounded-2xl p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Trophy className="size-5 text-amber-400" />
            Ready to compete?
          </h2>
          {!view.isOpen && (
            <p className="mt-2 text-sm text-amber-300/90">
              Submissions open when status is <strong>Open now</strong>. Run{" "}
              <code className="text-cyan-400">npm run challenge:open</code> after seeding the DB.
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={joinHref}
              className={
                view.isOpen
                  ? "inline-flex justify-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-sm font-semibold text-black"
                  : "inline-flex justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-medium hover:bg-white/5"
              }
            >
              {joinLabel}
            </Link>
            <Link
              href="/submit"
              className="inline-flex justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-6 py-3 text-sm font-medium text-cyan-300"
            >
              Submit Solution
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex justify-center rounded-full border border-violet-500/30 bg-violet-500/10 px-6 py-3 text-sm font-medium text-violet-300"
            >
              View Leaderboard
            </Link>
            <Link
              href="/workflows"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-zinc-300 hover:bg-white/5"
            >
              <GitBranch className="size-4" />
              Workflow Library
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatBlock({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-black/20 px-5 py-4">
      {icon}
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="font-mono text-lg font-semibold text-zinc-100">{value}</p>
      </div>
    </div>
  );
}
