"use client";

import Link from "next/link";

import { MemoryShell } from "@/components/memory/memory-shell";
import { useMemory } from "@/components/memory/memory-provider";
import { getAgentMemorySummary } from "@/lib/memory/agent-lessons";
import { LESSON_TYPE_LABELS } from "@/lib/memory/types";
import { COMPETITOR_AGENTS } from "@/lib/tournament/agents";

type Props = { agentId: string };

export function AgentMemoryView({ agentId }: Props) {
  const { kb } = useMemory();
  const agent = COMPETITOR_AGENTS.find((a) => a.id === agentId);
  const summary = getAgentMemorySummary(agentId, kb.lessons);
  const articles = kb.articles.filter((a) => a.agent_ids.includes(agentId));

  return (
    <MemoryShell
      title={`${agent?.name ?? agentId} — Agent memory`}
      subtitle="Lessons extracted from tournament runs: strengths, weaknesses, failure modes, recommended changes."
    >
      <Link href={`/agents/${agentId}`} className="text-sm text-zinc-500 hover:text-zinc-300">
        ← Agent profile (MVP1)
      </Link>
      <Link href="/tournament" className="ml-4 text-sm text-cyan-400 hover:underline">
        Tournament engine
      </Link>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <LessonSection title="Strengths" items={summary.strengths} color="emerald" />
        <LessonSection title="Weaknesses" items={summary.weaknesses} color="amber" />
        <LessonSection title="Failure modes" items={summary.failure_modes} color="rose" />
        <LessonSection title="Recommended changes" items={summary.recommended_changes} color="violet" />
      </div>

      {articles.length > 0 && (
        <section className="mt-8 glass-card rounded-2xl p-5">
          <h2 className="text-sm font-semibold uppercase text-zinc-400">Related articles</h2>
          <ul className="mt-3 space-y-2">
            {articles.map((a) => (
              <li key={a.id}>
                <Link href={`/memory/articles/${a.id}`} className="text-cyan-400 hover:underline">
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {summary.all.length === 0 && (
        <p className="mt-8 text-center text-zinc-600">
          No lessons yet — run a tournament loop to compile agent memory.
        </p>
      )}
    </MemoryShell>
  );
}

function LessonSection({
  title,
  items,
  color,
}: {
  title: string;
  items: { id: string; title: string; content: string; lesson_type: string; confidence: number }[];
  color: string;
}) {
  const border = {
    emerald: "border-emerald-500/20",
    amber: "border-amber-500/20",
    rose: "border-rose-500/20",
    violet: "border-violet-500/20",
  }[color] ?? "border-white/10";

  return (
    <section className={`glass-card rounded-2xl border ${border} p-5`}>
      <h2 className="text-sm font-semibold uppercase text-zinc-400">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-600">None recorded</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((l) => (
            <li key={l.id} className="rounded-lg bg-black/20 px-3 py-2 text-sm">
              <p className="font-medium text-zinc-200">{l.title}</p>
              <p className="text-xs text-zinc-500">{l.content}</p>
              <p className="mt-1 text-[10px] text-zinc-600">
                {LESSON_TYPE_LABELS[l.lesson_type as keyof typeof LESSON_TYPE_LABELS]} ·{" "}
                {(l.confidence * 100).toFixed(0)}%
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
