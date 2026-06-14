import Link from "next/link";

import type { EvidenceItem } from "@/lib/research/types";
import { KNOWLEDGE_SOURCE_LABELS } from "@/lib/research/types";

export function EvidenceCard({ item, reportTitle }: { item: EvidenceItem; reportTitle?: string }) {
  return (
    <article className="rounded-xl border border-white/5 bg-black/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-medium text-zinc-200">{item.title}</h3>
        <span className="rounded bg-indigo-500/15 px-2 py-0.5 text-[10px] uppercase text-indigo-200">
          {KNOWLEDGE_SOURCE_LABELS[item.source_type]}
        </span>
      </div>
      <p className="mt-2 text-sm text-zinc-400">{item.summary}</p>
      <blockquote className="mt-2 border-l-2 border-teal-500/40 pl-3 text-xs italic text-zinc-500">
        {item.quote_or_excerpt}
      </blockquote>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <ScorePill label="Relevance" value={item.relevance_score} />
        <ScorePill label="Confidence" value={item.confidence_score} />
        <ScorePill label="Freshness" value={item.freshness_score} />
        <ScorePill label="Reliability" value={item.reliability_score} />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-xs text-violet-300">
          Composite {(item.composite_score * 100).toFixed(0)}%
        </span>
        <div className="flex gap-3 text-xs">
          {reportTitle && item.used_in_report_id && (
            <Link href={`/research/reports/${item.used_in_report_id}`} className="text-indigo-400 hover:underline">
              Report: {reportTitle.slice(0, 24)}…
            </Link>
          )}
          <Link href={item.deep_link} className="text-teal-400 hover:underline">
            Source record
          </Link>
        </div>
      </div>
    </article>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded bg-white/5 px-2 py-1">
      <p className="text-zinc-600">{label}</p>
      <p className="font-mono text-zinc-300">{(value * 100).toFixed(0)}%</p>
    </div>
  );
}
