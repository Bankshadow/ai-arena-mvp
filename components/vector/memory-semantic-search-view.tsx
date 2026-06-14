"use client";

import Link from "next/link";
import { useState } from "react";

import { BackendBadge } from "@/components/vector/backend-badge";
import { SimilarityBar } from "@/components/vector/similarity-bar";
import { useVector } from "@/components/vector/vector-provider";
import { MemoryShell } from "@/components/memory/memory-shell";
import { MEMORY_SAMPLE_QUERIES } from "@/lib/vector/mock-documents";
import { VECTOR_SOURCE_LABELS } from "@/lib/vector/types";
import type { MemorySemanticSearchResult } from "@/lib/vector/types";

export function MemorySemanticSearchView() {
  const { searchMemory } = useVector();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MemorySemanticSearchResult | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      setResult(await searchMemory(query.trim()));
    } finally {
      setLoading(false);
    }
  }

  function runSample(q: string) {
    setQuery(q);
    setLoading(true);
    searchMemory(q)
      .then(setResult)
      .finally(() => setLoading(false));
  }

  return (
    <MemoryShell
      title="Semantic memory search"
      subtitle="Vector search across agent memory, tournament memory, research evidence, marketplace components, and constitutions — mock embeddings, adapter-ready."
    >
      <div className="mb-4 flex items-center gap-2">
        <BackendBadge backend="mock" />
        <span className="text-xs text-zinc-500">384-dim mock embeddings · cosine similarity</span>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Semantic search…"
          className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-6 py-3 text-sm text-emerald-100 disabled:opacity-50"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {MEMORY_SAMPLE_QUERIES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => runSample(q)}
            className="rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-zinc-400 hover:border-emerald-500/30"
          >
            {q}
          </button>
        ))}
      </div>

      {!result && !loading && (
        <p className="mt-12 text-center text-sm text-zinc-600">
          Search agent lessons, tournament memory, evidence, marketplace components, or constitutions.
        </p>
      )}

      {result && (
        <div className="mt-8 space-y-4">
          <p className="text-xs text-zinc-500">
            {result.hits.length} hits · {result.latency_ms}ms ·{" "}
            {result.collections_searched.length} collections
          </p>
          {result.hits.map((h) => (
            <article
              key={h.document.id}
              className="glass-card rounded-2xl border border-emerald-500/10 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-lg font-medium text-zinc-100">{h.document.title}</h2>
                <span className="rounded bg-slate-500/20 px-2 py-0.5 text-[10px] uppercase text-slate-300">
                  {VECTOR_SOURCE_LABELS[h.document.source_type]}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-400">{h.document.content.slice(0, 200)}…</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <SimilarityBar score={h.similarity_score} />
                <div className="text-xs">
                  <span className="text-zinc-600">Confidence </span>
                  <span className="font-mono text-emerald-300">
                    {(h.document.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {h.document.tags.map((t) => (
                  <span key={t} className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-zinc-500">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-mono text-zinc-600">source: {h.document.source_id}</span>
                <Link href={h.document.deep_link} className="text-emerald-400 hover:underline">
                  Open source →
                </Link>
              </div>
              {h.document.recommended_action && (
                <p className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-200/90">
                  {h.document.recommended_action}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </MemoryShell>
  );
}
