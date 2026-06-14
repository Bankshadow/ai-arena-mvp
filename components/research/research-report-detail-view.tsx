"use client";

import Link from "next/link";

import { ConfidenceBadge } from "@/components/research/confidence-badge";
import { EvidenceTable } from "@/components/research/evidence-table";
import { ResearchShell } from "@/components/research/research-shell";
import { useResearch } from "@/components/research/research-provider";
import type { ResearchReport } from "@/lib/research/types";

export function ResearchReportDetailView({ report }: { report: ResearchReport }) {
  const { data } = useResearch();
  const evidence = data.evidence.filter((e) => report.evidence_ids.includes(e.id));
  const sections = [...report.sections].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <ResearchShell title={report.title} subtitle={report.question}>
      <div className="flex flex-wrap items-center gap-3">
        <ConfidenceBadge score={report.confidence_score} />
        <span className="text-xs text-zinc-500">
          {new Date(report.created_at).toLocaleDateString()} · Deep Research Agent
        </span>
      </div>

      <section className="mt-6 glass-card rounded-2xl p-5">
        <p className="text-xs uppercase text-zinc-500">Methodology</p>
        <p className="mt-2 text-sm text-zinc-300">{report.methodology}</p>
      </section>

      <div className="mt-6 space-y-4">
        {sections.map((sec) => (
          <section key={sec.id} className="glass-card rounded-2xl p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-300">
              {sec.title}
            </h2>
            <div className="mt-3 whitespace-pre-wrap text-sm text-zinc-300">{sec.content}</div>
          </section>
        ))}
      </div>

      <section className="mt-6 glass-card rounded-2xl p-5">
        <p className="text-xs uppercase text-zinc-500">Evidence</p>
        <div className="mt-4">
          <EvidenceTable items={evidence} />
        </div>
      </section>

      <section className="mt-6 glass-card rounded-2xl p-5">
        <p className="text-xs uppercase text-zinc-500">Recommendations</p>
        <ul className="mt-3 list-inside list-disc text-sm text-zinc-300">
          {report.recommendations.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <section className="mt-6 glass-card rounded-2xl p-5">
        <p className="text-xs uppercase text-zinc-500">Limitations</p>
        <ul className="mt-3 list-inside list-disc text-sm text-zinc-500">
          {report.limitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>

      {report.related_component_slugs.length > 0 && (
        <section className="mt-6 glass-card rounded-2xl border border-teal-500/15 p-5">
          <p className="text-xs uppercase text-zinc-500">Related marketplace components</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {report.related_component_slugs.map((slug) => (
              <Link
                key={slug}
                href={`/marketplace/${slug}`}
                className="rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-sm text-teal-200 hover:bg-teal-500/20"
              >
                {slug}
              </Link>
            ))}
          </ul>
        </section>
      )}
    </ResearchShell>
  );
}
