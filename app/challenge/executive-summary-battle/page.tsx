import Link from "next/link";
import { Scale, Target, Trophy } from "lucide-react";

import { Nav } from "@/components/Nav";
import { StatCard } from "@/components/StatCard";

export const metadata = {
  title: "Executive Summary Battle #1 | AI ARENA",
  description: "Summarize a 20-page business report under $1 with maximum quality.",
};

const OUTPUT_REQUIREMENTS = [
  "Executive Summary",
  "Key Risks",
  "Recommendations",
];

const RULES = [
  "Free entry",
  "3 attempts per competitor",
  "Quality score must be at least 60",
  "Best score counts toward the leaderboard",
];

export default function ChallengeDetailPage() {
  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.12),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6">
        <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
          Challenge #001
        </span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Executive Summary Battle #1
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-zinc-400">
          Summarize a 20-page business report into board-ready output. Everyone receives the same
          input — win on quality per dollar, not biggest model budget.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <StatCard label="Cost limit" value="$1.00" />
          <StatCard label="Attempts" value="3" />
          <StatCard label="Scoring" value="80% Q + 20% Cost" />
        </div>

        <section className="glass-card mt-10 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Description</h2>
          <p className="mt-3 text-zinc-400 leading-relaxed">
            You receive a 20-page business report. Produce a concise executive summary, identify
            material risks, and deliver actionable recommendations. Optimize your prompt or
            multi-step workflow to minimize API spend while meeting quality thresholds.
          </p>
        </section>

        <section className="glass-card mt-6 rounded-2xl p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Target className="size-5 text-violet-400" />
            Input & output
          </h2>
          <p className="mt-3 text-sm text-zinc-400">
            <span className="font-medium text-zinc-200">Input:</span> 20-page business report
            (PDF)
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
            {RULES.map((rule) => (
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
              <p className="font-mono text-2xl font-bold text-violet-300">80%</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-6 py-4 text-center">
              <p className="text-xs text-zinc-500">Cost efficiency</p>
              <p className="font-mono text-2xl font-bold text-cyan-400">20%</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-zinc-500">
            Final Score = Quality Score × 0.8 + Cost Score × 0.2
          </p>
        </section>

        <section className="glass-card neon-glow mt-10 rounded-2xl p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Trophy className="size-5 text-amber-400" />
            Ready to compete?
          </h2>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/#waitlist"
              className="inline-flex justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-medium hover:bg-white/5"
            >
              Join Challenge
            </Link>
            <Link
              href="/submit"
              className="inline-flex justify-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-sm font-semibold text-black"
            >
              Submit Solution
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex justify-center rounded-full border border-violet-500/30 bg-violet-500/10 px-6 py-3 text-sm font-medium text-violet-300"
            >
              View Leaderboard
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
