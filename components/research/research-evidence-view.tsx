"use client";

import { useMemo, useState } from "react";

import { EvidenceCard } from "@/components/research/evidence-card";
import { ResearchShell } from "@/components/research/research-shell";
import { useResearch } from "@/components/research/research-provider";
import { KNOWLEDGE_SOURCE_LABELS, type KnowledgeSourceType } from "@/lib/research/types";

export function ResearchEvidenceView() {
  const { data } = useResearch();
  const [filter, setFilter] = useState<KnowledgeSourceType | "all">("all");

  const reportById = useMemo(() => {
    const map = new Map<string, string>();
    data.reports.forEach((r) => map.set(r.id, r.title));
    return map;
  }, [data.reports]);

  const items =
    filter === "all"
      ? data.evidence
      : data.evidence.filter((e) => e.source_type === filter);

  const sourceTypes = [...new Set(data.evidence.map((e) => e.source_type))];

  return (
    <ResearchShell
      title="Evidence library"
      subtitle="Structured evidence records with relevance, confidence, freshness, and reliability scores — linked to reports and source records."
    >
      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="All" />
        {sourceTypes.map((t) => (
          <FilterChip
            key={t}
            active={filter === t}
            onClick={() => setFilter(t)}
            label={KNOWLEDGE_SOURCE_LABELS[t]}
          />
        ))}
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-center text-sm text-zinc-600">
          No evidence items — run a research query to retrieve evidence.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <EvidenceCard
              key={item.id}
              item={item}
              reportTitle={
                item.used_in_report_id
                  ? reportById.get(item.used_in_report_id)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </ResearchShell>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs ${
        active
          ? "bg-indigo-500/20 text-indigo-200"
          : "border border-white/10 text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {label}
    </button>
  );
}
