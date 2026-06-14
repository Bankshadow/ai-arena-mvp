"use client";

import Link from "next/link";

import { ConfidenceBadge } from "@/components/research/confidence-badge";
import { ResearchShell } from "@/components/research/research-shell";
import { useResearch } from "@/components/research/research-provider";
import { REPORT_KIND_LABELS } from "@/lib/research/types";

export function ResearchReportsView() {
  const { data } = useResearch();

  return (
    <ResearchShell
      title="Research reports"
      subtitle="Evidence-backed reports generated from tournament telemetry, memory, marketplace, and forecasting data."
    >
      {data.reports.length === 0 ? (
        <p className="text-sm text-zinc-600">
          No reports yet — run a research query or wait for scheduled report generation.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.reports.map((report) => (
            <Link
              key={report.id}
              href={`/research/reports/${report.id}`}
              className="glass-card block rounded-2xl border border-white/5 p-5 transition hover:border-indigo-500/30"
            >
              <p className="text-xs uppercase text-indigo-400/80">
                {REPORT_KIND_LABELS[report.kind]}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-zinc-100">{report.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-500">{report.question}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <ConfidenceBadge score={report.confidence_score} />
                <span className="text-xs text-zinc-600">
                  {report.evidence_ids.length} evidence items
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </ResearchShell>
  );
}
