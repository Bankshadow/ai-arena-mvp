"use client";

import { ResearchShell } from "@/components/research/research-shell";
import { useResearch } from "@/components/research/research-provider";
import { IndexingStatusBadge, SourceFreshnessBadge } from "@/components/research/source-freshness-badge";
import { KNOWLEDGE_SOURCE_LABELS } from "@/lib/research/types";

export function ResearchSourcesView() {
  const { data } = useResearch();

  return (
    <ResearchShell
      title="Knowledge source registry"
      subtitle="Searchable corpora across tournaments, marketplace, memory, forecasts, and tool logs — adapter-ready for pgvector and Milvus."
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-zinc-500">
              <th className="pb-2 pr-3">Source</th>
              <th className="pb-2 pr-3">Type</th>
              <th className="pb-2 pr-3">Enabled</th>
              <th className="pb-2 pr-3">Indexing</th>
              <th className="pb-2 pr-3">Records</th>
              <th className="pb-2 pr-3">Reliability</th>
              <th className="pb-2 pr-3">Freshness</th>
              <th className="pb-2">Last indexed</th>
            </tr>
          </thead>
          <tbody>
            {data.sources.map((s) => (
              <tr key={s.id} className="border-b border-white/5">
                <td className="py-3 pr-3">
                  <p className="font-medium text-zinc-200">{s.name}</p>
                  <p className="text-xs text-zinc-600">{s.description.slice(0, 60)}…</p>
                </td>
                <td className="py-3 pr-3 text-xs text-zinc-400">
                  {KNOWLEDGE_SOURCE_LABELS[s.source_type]}
                </td>
                <td className="py-3 pr-3">
                  <span
                    className={`text-xs ${s.enabled ? "text-emerald-400" : "text-zinc-600"}`}
                  >
                    {s.enabled ? "Yes" : "No"}
                  </span>
                </td>
                <td className="py-3 pr-3">
                  <IndexingStatusBadge status={s.indexing_status} />
                </td>
                <td className="py-3 pr-3 font-mono text-zinc-300">{s.record_count}</td>
                <td className="py-3 pr-3 font-mono text-indigo-300">
                  {(s.reliability_score * 100).toFixed(0)}%
                </td>
                <td className="py-3 pr-3">
                  <SourceFreshnessBadge status={s.freshness_status} />
                </td>
                <td className="py-3 text-xs text-zinc-500">
                  {s.last_indexed_at
                    ? new Date(s.last_indexed_at).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ResearchShell>
  );
}
