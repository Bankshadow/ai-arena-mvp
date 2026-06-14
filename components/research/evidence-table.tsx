import Link from "next/link";

import type { EvidenceItem } from "@/lib/research/types";
import { KNOWLEDGE_SOURCE_LABELS } from "@/lib/research/types";

export function EvidenceTable({ items }: { items: EvidenceItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-600">No evidence retrieved.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs text-zinc-500">
            <th className="pb-2 pr-3">Title</th>
            <th className="pb-2 pr-3">Source</th>
            <th className="pb-2 pr-3">Relevance</th>
            <th className="pb-2 pr-3">Confidence</th>
            <th className="pb-2 pr-3">Composite</th>
            <th className="pb-2">Link</th>
          </tr>
        </thead>
        <tbody>
          {items.map((e) => (
            <tr key={e.id} className="border-b border-white/5">
              <td className="py-3 pr-3">
                <p className="font-medium text-zinc-200">{e.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{e.summary}</p>
              </td>
              <td className="py-3 pr-3 text-xs text-zinc-400">
                {KNOWLEDGE_SOURCE_LABELS[e.source_type]}
              </td>
              <td className="py-3 pr-3 font-mono text-teal-300">
                {(e.relevance_score * 100).toFixed(0)}%
              </td>
              <td className="py-3 pr-3 font-mono text-indigo-300">
                {(e.confidence_score * 100).toFixed(0)}%
              </td>
              <td className="py-3 pr-3 font-mono text-violet-300">
                {(e.composite_score * 100).toFixed(0)}%
              </td>
              <td className="py-3">
                <Link href={e.deep_link} className="text-xs text-teal-400 hover:underline">
                  Open source
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
