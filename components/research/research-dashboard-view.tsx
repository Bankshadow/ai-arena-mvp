"use client";

import Link from "next/link";
import {
  AlertCircle,
  BookOpen,
  Database,
  FileSearch,
  Lightbulb,
  Search,
  Sparkles,
} from "lucide-react";

import { ResearchShell } from "@/components/research/research-shell";
import { useResearch } from "@/components/research/research-provider";
import { SourceFreshnessBadge } from "@/components/research/source-freshness-badge";
import { TraceTimeline } from "@/components/research/trace-timeline";

export function ResearchDashboardView() {
  const { data, stats } = useResearch();
  const recentTrace = data.traceHistory[0] ?? data.traces[0];

  return (
    <ResearchShell
      title="Research dashboard"
      subtitle="Search AI ARENA’s private knowledge — tournament runs, memory, marketplace, forecasts, and tool logs — with evidence-backed answers."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Database} label="Searchable sources" value={String(stats.searchable_sources)} href="/research/sources" />
        <StatCard icon={FileSearch} label="Indexed records" value={String(stats.indexed_records)} href="/research/sources" />
        <StatCard icon={BookOpen} label="Evidence items" value={String(stats.evidence_items)} href="/research/evidence" />
        <StatCard icon={Sparkles} label="Research reports" value={String(stats.research_reports)} href="/research/reports" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="glass-card rounded-2xl border border-indigo-500/15 p-5">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Source freshness</p>
          <ul className="mt-4 space-y-2">
            {data.sources.filter((s) => s.enabled).slice(0, 6).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-zinc-300">{s.name}</span>
                <SourceFreshnessBadge status={s.freshness_status} />
              </li>
            ))}
          </ul>
          {stats.stale_sources > 0 && (
            <p className="mt-3 text-xs text-amber-400/90">
              {stats.stale_sources} source(s) aging or stale
            </p>
          )}
        </section>

        <section className="glass-card rounded-2xl border border-teal-500/15 p-5">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
            <AlertCircle className="size-4 text-amber-400" /> Knowledge gaps
          </p>
          <ul className="mt-4 space-y-3">
            {data.knowledgeGaps.map((g) => (
              <li key={g.id} className="rounded-lg border border-white/5 bg-black/20 px-3 py-2">
                <p className="text-sm font-medium text-zinc-200">{g.topic}</p>
                <p className="text-xs text-zinc-500">{g.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {recentTrace && (
        <section className="mt-6 glass-card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Recent research trace</p>
          <p className="mt-1 text-sm text-zinc-400">
            Deep Research Agent · {recentTrace.total_evidence_used}/{recentTrace.total_evidence_retrieved} evidence used
          </p>
          <div className="mt-4">
            <TraceTimeline trace={recentTrace} />
          </div>
        </section>
      )}

      <section className="mt-6 glass-card rounded-2xl p-5">
        <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
          <Lightbulb className="size-4 text-violet-400" /> Top evidence-backed recommendations
        </p>
        <ul className="mt-4 space-y-2">
          {data.recommendations.map((rec, i) => (
            <li key={i} className="flex gap-2 text-sm text-zinc-300">
              <span className="font-mono text-indigo-400">{i + 1}.</span>
              {rec}
            </li>
          ))}
        </ul>
      </section>

      <Link
        href="/research/query"
        className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/15 px-6 py-3 text-sm font-medium text-indigo-100 transition hover:bg-indigo-500/25"
      >
        <Search className="size-4" /> Ask a research question
      </Link>
    </ResearchShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Database;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="glass-card rounded-2xl border border-white/5 p-4 transition hover:border-indigo-500/30">
      <Icon className="size-5 text-teal-400" />
      <p className="mt-2 text-xs text-zinc-500">{label}</p>
      <p className="font-mono text-2xl text-white">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
