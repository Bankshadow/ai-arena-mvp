import Link from "next/link";
import { GitBranch, Sparkles } from "lucide-react";

import type { WorkflowCard } from "@/lib/data/mock-mvp";

type WorkflowGridProps = {
  workflows: WorkflowCard[];
  source: "database" | "mock";
};

export function WorkflowGrid({ workflows, source }: WorkflowGridProps) {
  return (
    <>
      {source === "database" && (
        <p className="mt-2 text-xs text-emerald-400/90">Live top workflows from scored submissions</p>
      )}
      {source === "mock" && (
        <p className="mt-2 text-xs text-zinc-500">
          Demo workflows — connect DATABASE_URL and score submissions to populate from real entries
        </p>
      )}

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {workflows.map((wf) => (
          <article key={wf.rank} className="glass-card neon-glow flex flex-col rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-0.5 font-mono text-xs text-violet-300">
                Rank #{wf.rank}
              </span>
              {wf.rank === 1 && <Sparkles className="size-5 text-amber-400" />}
            </div>
            <h2 className="mt-4 text-lg font-semibold">{wf.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{wf.strategySummary}</p>

            <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg border border-white/10 bg-black/20 py-2">
                <dt className="text-zinc-500">Model</dt>
                <dd className="mt-0.5 font-medium text-zinc-200">{wf.modelUsed}</dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 py-2">
                <dt className="text-zinc-500">Cost</dt>
                <dd className="mt-0.5 font-mono text-cyan-400">{wf.cost}</dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 py-2">
                <dt className="text-zinc-500">Quality</dt>
                <dd className="mt-0.5 font-mono text-violet-300">{wf.qualityScore}</dd>
              </div>
            </dl>

            <h3 className="mt-5 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Workflow steps
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
          View full leaderboard
        </Link>
        {" · "}
        <Link href="/submit" className="text-violet-400 hover:underline">
          Submit your workflow
        </Link>
      </p>
    </>
  );
}
