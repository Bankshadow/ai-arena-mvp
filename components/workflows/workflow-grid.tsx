"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";
import type { WorkflowCard } from "@/lib/data/mock-mvp";

type WorkflowGridProps = {
  workflows: WorkflowCard[];
  source: "database" | "mock";
};

export function WorkflowGrid({ workflows, source }: WorkflowGridProps) {
  const t = useTranslations();
  const w = t.workflows;
  const c = t.common;

  return (
    <>
      {source === "database" && (
        <p className="mt-2 text-xs text-emerald-400/90">{w.liveNote}</p>
      )}
      {source === "mock" && <p className="mt-2 text-xs text-zinc-500">{w.mockNote}</p>}

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {workflows.map((wf) => (
          <article key={wf.rank} className="glass-card neon-glow flex flex-col rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-0.5 font-mono text-xs text-violet-300">
                {w.rank(wf.rank)}
              </span>
              {wf.rank === 1 && <Sparkles className="size-5 text-amber-400" />}
            </div>
            <h2 className="mt-4 text-lg font-semibold">{wf.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{wf.strategySummary}</p>

            <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg border border-white/10 bg-black/20 py-2">
                <dt className="text-zinc-500">{c.model}</dt>
                <dd className="mt-0.5 font-medium text-zinc-200">{wf.modelUsed}</dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 py-2">
                <dt className="text-zinc-500">{c.cost}</dt>
                <dd className="mt-0.5 font-mono text-cyan-400">{wf.cost}</dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 py-2">
                <dt className="text-zinc-500">{c.quality}</dt>
                <dd className="mt-0.5 font-mono text-violet-300">{wf.qualityScore}</dd>
              </div>
            </dl>

            <h3 className="mt-5 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {w.workflowSteps}
            </h3>
            <ol className="mt-2 flex-1 space-y-2">
              {wf.steps.map((step, i) => (
                <li key={step} className="flex gap-2 text-sm text-zinc-300">
                  <span className="font-mono text-xs text-cyan-500/80">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-zinc-500">
        <Link href="/leaderboard" className="text-cyan-400 hover:underline">
          {w.viewLeaderboard}
        </Link>
        {" · "}
        <Link href="/submit" className="text-violet-400 hover:underline">
          {w.submitWorkflow}
        </Link>
      </p>
    </>
  );
}
