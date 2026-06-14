"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles } from "lucide-react";

import { BackendBadge } from "@/components/vector/backend-badge";
import { SimilarityBar } from "@/components/vector/similarity-bar";
import { useVector } from "@/components/vector/vector-provider";
import { MARKETPLACE_SAMPLE_QUERIES } from "@/lib/vector/mock-documents";
import type { MarketplaceSemanticSearchResult } from "@/lib/vector/types";

export function MarketplaceSemanticSearch() {
  const { searchMarketplace } = useVector();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MarketplaceSemanticSearchResult | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      setResult(await searchMarketplace(query.trim()));
    } finally {
      setLoading(false);
    }
  }

  function runSample(q: string) {
    setQuery(q);
    setLoading(true);
    searchMarketplace(q)
      .then(setResult)
      .finally(() => setLoading(false));
  }

  return (
    <section className="glass-card rounded-2xl border border-violet-500/20 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-violet-300/80">
          <Sparkles className="size-4" /> Semantic search
        </p>
        <BackendBadge backend="mock" />
      </div>
      <p className="mt-1 text-sm text-zinc-500">
        Find tournament-tested components by intent — not just tags.
      </p>

      <form onSubmit={handleSearch} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. low-cost PDF summary workflow"
          className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl border border-violet-500/40 bg-violet-500/15 px-5 py-2.5 text-sm text-violet-100 disabled:opacity-50"
        >
          {loading ? "Searching…" : "Semantic search"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {MARKETPLACE_SAMPLE_QUERIES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => runSample(q)}
            className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-zinc-500 hover:border-violet-500/30 hover:text-zinc-300"
          >
            {q}
          </button>
        ))}
      </div>

      {result && result.hits.length > 0 && (
        <ul className="mt-6 space-y-3">
          {result.hits.map((hit) => (
            <li
              key={hit.slug}
              className="rounded-xl border border-white/5 bg-black/25 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <Link
                  href={`/marketplace/${hit.slug}`}
                  className="font-medium text-zinc-100 hover:text-violet-300"
                >
                  {hit.title}
                </Link>
                <span className="font-mono text-xs text-violet-300">
                  battle {(hit.battle_score).toFixed(0)}
                </span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <SimilarityBar score={hit.similarity_score} />
                <div className="flex gap-4 text-xs text-zinc-500">
                  <span>Win {(hit.win_rate * 100).toFixed(0)}%</span>
                  <span>Cost ${hit.avg_cost_usd.toFixed(4)}</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                {hit.evidence_links.map((link) => (
                  <Link key={link} href={link} className="text-emerald-400 hover:underline">
                    Evidence
                  </Link>
                ))}
                <Link href="/stack-builder" className="text-violet-400 hover:underline">
                  Add to stack
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {result && result.hits.length === 0 && (
        <p className="mt-4 text-sm text-zinc-600">No semantic matches — try a sample query.</p>
      )}
    </section>
  );
}
