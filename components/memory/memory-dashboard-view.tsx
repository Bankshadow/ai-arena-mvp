"use client";

import Link from "next/link";
import { BookOpen, FileText, Lightbulb, Shield, Sparkles } from "lucide-react";

import { MemoryShell } from "@/components/memory/memory-shell";
import { useMemory } from "@/components/memory/memory-provider";
import { ARTICLE_TYPE_LABELS } from "@/lib/memory/types";

export function MemoryDashboardView() {
  const { kb } = useMemory();
  const recent = [...kb.articles].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);
  const pending = kb.proposals.filter((p) => p.status === "pending_review").length;
  const health = kb.lastLintReport?.health_score ?? "—";

  return (
    <MemoryShell
      title="Knowledge base dashboard"
      subtitle="AI ARENA learns from every tournament — lessons, articles, and constitution proposals accumulate here."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Articles" value={String(kb.articles.length)} href="/memory/articles" />
        <StatCard icon={Lightbulb} label="Agent lessons" value={String(kb.lessons.length)} href="/memory/articles" />
        <StatCard icon={FileText} label="Daily logs" value={String(kb.logs.length)} />
        <StatCard icon={Shield} label="Health score" value={String(health)} href="/memory/lint" />
      </div>

      {pending > 0 && (
        <Link
          href="/constitution/proposals"
          className="mt-6 block rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
        >
          {pending} constitution update proposal{pending > 1 ? "s" : ""} pending review →
        </Link>
      )}

      <section className="mt-10 glass-card rounded-2xl p-5">
        <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
          <Sparkles className="size-4 text-violet-400" /> Recent knowledge articles
        </p>
        <ul className="mt-4 space-y-3">
          {recent.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3 last:border-0">
              <div>
                <Link href={`/memory/articles/${a.id}`} className="font-medium text-zinc-200 hover:text-cyan-300">
                  {a.title}
                </Link>
                <p className="text-xs text-zinc-500">
                  {ARTICLE_TYPE_LABELS[a.article_type]} · Round {a.round} ·{" "}
                  {(a.confidence * 100).toFixed(0)}% confidence
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Latest compile runs</h2>
        {kb.compileRuns.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600">No compile runs yet — run a tournament or use /memory/compile</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-zinc-400">
            {kb.compileRuns.slice(0, 3).map((r) => (
              <li key={r.id}>
                Round {r.round}: {r.articles_created} articles, {r.lessons_updated} lessons · {r.status}
              </li>
            ))}
          </ul>
        )}
      </section>
    </MemoryShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="glass-card rounded-2xl p-4 transition hover:border-cyan-500/30">
      <Icon className="size-5 text-cyan-400" />
      <p className="mt-2 text-xs text-zinc-500">{label}</p>
      <p className="font-mono text-2xl text-white">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
