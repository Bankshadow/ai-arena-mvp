"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { MemoryShell } from "@/components/memory/memory-shell";
import { useMemory } from "@/components/memory/memory-provider";
import { ARTICLE_TYPE_LABELS } from "@/lib/memory/types";
import type { MemoryArticle } from "@/lib/memory/types";

export function MemoryArticleDetailView({ article }: { article: MemoryArticle }) {
  const { kb } = useMemory();
  const links = kb.links.filter(
    (l) => l.from_article_id === article.id || l.to_article_id === article.id,
  );

  return (
    <MemoryShell title={article.title} subtitle={ARTICLE_TYPE_LABELS[article.article_type]}>
      <Link href="/memory/articles" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300">
        <ArrowLeft className="size-4" /> All articles
      </Link>

      <div className="mt-6 space-y-6">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-cyan-500/30 px-2 py-0.5 text-xs text-cyan-300">
            Round {article.round}
          </span>
          <span className="rounded-full border border-emerald-500/30 px-2 py-0.5 font-mono text-xs text-emerald-300">
            {(article.confidence * 100).toFixed(0)}% confidence
          </span>
          {article.tags.map((t) => (
            <span key={t} className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-zinc-500">
              {t}
            </span>
          ))}
        </div>

        <section className="glass-card rounded-2xl p-5">
          <h2 className="text-xs uppercase text-zinc-500">Summary</h2>
          <p className="mt-2 text-zinc-300">{article.summary}</p>
        </section>

        <section className="glass-card rounded-2xl p-5">
          <h2 className="text-xs uppercase text-zinc-500">Body</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-400">{article.body}</p>
        </section>

        {article.agent_ids.length > 0 && (
          <section className="glass-card rounded-2xl p-5">
            <h2 className="text-xs uppercase text-zinc-500">Linked agents</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {article.agent_ids.map((id) => (
                <Link
                  key={id}
                  href={`/agents/${id}/memory`}
                  className="rounded-lg border border-violet-500/30 px-3 py-1 text-sm text-violet-200 hover:bg-violet-500/10"
                >
                  {id} memory →
                </Link>
              ))}
            </div>
          </section>
        )}

        {links.length > 0 && (
          <section className="glass-card rounded-2xl p-5">
            <h2 className="text-xs uppercase text-zinc-500">Evidence links</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {links.map((l) => {
                const otherId = l.from_article_id === article.id ? l.to_article_id : l.from_article_id;
                const other = kb.articles.find((a) => a.id === otherId);
                return (
                  <li key={l.id} className="text-zinc-400">
                    <span className="text-amber-400">{l.link_type}</span> →{" "}
                    {other ? (
                      <Link href={`/memory/articles/${other.id}`} className="text-cyan-400 hover:underline">
                        {other.title}
                      </Link>
                    ) : (
                      otherId
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </MemoryShell>
  );
}
