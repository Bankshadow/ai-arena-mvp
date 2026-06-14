"use client";

import Link from "next/link";

import { MemoryShell } from "@/components/memory/memory-shell";
import { useMemory } from "@/components/memory/memory-provider";
import { ARTICLE_TYPE_LABELS } from "@/lib/memory/types";

export function MemoryArticlesView() {
  const { kb } = useMemory();
  const articles = [...kb.articles].sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <MemoryShell title="Knowledge articles" subtitle="Structured lessons compiled from tournament data.">
      <div className="glass-card overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Round</th>
              <th className="px-4 py-3 text-right">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <Link href={`/memory/articles/${a.id}`} className="font-medium text-zinc-200 hover:text-cyan-300">
                    {a.title}
                  </Link>
                  <p className="text-xs text-zinc-600">{a.summary.slice(0, 80)}…</p>
                </td>
                <td className="px-4 py-3 text-xs text-violet-300">{ARTICLE_TYPE_LABELS[a.article_type]}</td>
                <td className="px-4 py-3 font-mono text-zinc-500">{a.round}</td>
                <td className="px-4 py-3 text-right font-mono text-emerald-400">
                  {(a.confidence * 100).toFixed(0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MemoryShell>
  );
}
