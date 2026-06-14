"use client";

import Link from "next/link";
import { useState } from "react";
import { RefreshCw, Search } from "lucide-react";

import { BackendBadge } from "@/components/vector/backend-badge";
import { CollectionCard } from "@/components/vector/collection-card";
import { SimilarityBar } from "@/components/vector/similarity-bar";
import { VectorShell } from "@/components/vector/vector-shell";
import { useVector } from "@/components/vector/vector-provider";
import { VECTOR_SOURCE_LABELS } from "@/lib/vector/types";
import type { VectorSearchResult } from "@/lib/vector/types";

export function VectorsDashboardView() {
  const { collections, data, ready, search, rebuildIndex } = useVector();
  const [sampleQuery, setSampleQuery] = useState("low-cost summary workflow");
  const [sampleResult, setSampleResult] = useState<VectorSearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [lastJob, setLastJob] = useState<string | null>(null);

  const totalDocs = collections.reduce((s, c) => s + c.document_count, 0);

  async function runSampleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    try {
      setSampleResult(await search(sampleQuery));
    } finally {
      setSearching(false);
    }
  }

  async function handleRebuild() {
    setRebuilding(true);
    try {
      const job = await rebuildIndex();
      setLastJob(job.message);
    } finally {
      setRebuilding(false);
    }
  }

  return (
    <VectorShell
      title="Vector data core"
      subtitle="Local-first semantic index — mock adapter today, Zvec / pgvector / Milvus adapters ready for production."
    >
      <section className="glass-card rounded-2xl border border-emerald-500/20 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">Vector backend status</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <BackendBadge backend="mock" />
              <span className="text-sm text-emerald-200/90">MockVectorAdapter active</span>
            </div>
            <p className="mt-2 text-xs text-zinc-600">
              Zvec · pgvector · Milvus stubs available — not linked
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xl text-emerald-100">{totalDocs}</p>
            <p className="text-xs text-zinc-500">indexed documents</p>
          </div>
        </div>
      </section>

      {!ready ? (
        <p className="mt-8 text-sm text-zinc-600">Initializing vector index…</p>
      ) : (
        <>
          <section className="mt-8">
            <p className="mb-4 text-xs uppercase tracking-wider text-zinc-500">Collections</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {collections.map((c) => (
                <CollectionCard key={c.name} collection={c} />
              ))}
            </div>
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="glass-card rounded-2xl p-5">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                <Search className="size-4 text-emerald-400" /> Sample search
              </p>
              <form onSubmit={runSampleSearch} className="mt-4 flex gap-2">
                <input
                  value={sampleQuery}
                  onChange={(e) => setSampleQuery(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
                  placeholder="Search all collections…"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 text-sm text-emerald-100 disabled:opacity-50"
                >
                  {searching ? "…" : "Search"}
                </button>
              </form>
              {sampleResult && (
                <ul className="mt-4 space-y-3">
                  {sampleResult.hits.slice(0, 5).map((h) => (
                    <li key={h.document.id} className="rounded-lg border border-white/5 bg-black/20 p-3">
                      <p className="text-sm font-medium text-zinc-200">{h.document.title}</p>
                      <p className="text-xs text-zinc-500">
                        {VECTOR_SOURCE_LABELS[h.document.source_type]} · {h.document.source_id}
                      </p>
                      <div className="mt-2">
                        <SimilarityBar score={h.similarity_score} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="glass-card rounded-2xl p-5">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                <RefreshCw className="size-4 text-slate-400" /> Index jobs
              </p>
              <button
                type="button"
                disabled={rebuilding}
                onClick={handleRebuild}
                className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100 disabled:opacity-50"
              >
                <RefreshCw className={`size-4 ${rebuilding ? "animate-spin" : ""}`} />
                {rebuilding ? "Rebuilding…" : "Rebuild index (mock)"}
              </button>
              {lastJob && <p className="mt-2 text-xs text-emerald-400/90">{lastJob}</p>}
              <ul className="mt-4 space-y-2">
                {data.jobs.length === 0 ? (
                  <li className="text-sm text-zinc-600">No index jobs yet</li>
                ) : (
                  data.jobs.slice(0, 5).map((j) => (
                    <li
                      key={j.id}
                      className="rounded-lg border border-white/5 px-3 py-2 text-xs text-zinc-400"
                    >
                      <span className="font-mono text-emerald-300">{j.action}</span> · {j.collection} ·{" "}
                      {j.status} · {j.documents_processed} docs
                    </li>
                  ))
                )}
              </ul>
            </section>
          </div>

          <Link
            href="/memory/search"
            className="mt-8 inline-flex items-center gap-2 text-sm text-emerald-400 hover:underline"
          >
            Open semantic memory search →
          </Link>
        </>
      )}
    </VectorShell>
  );
}
