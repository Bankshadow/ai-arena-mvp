"use client";

import { useState } from "react";
import Link from "next/link";

import { ConfidenceBadge } from "@/components/research/confidence-badge";
import { EvidenceTable } from "@/components/research/evidence-table";
import { ResearchShell } from "@/components/research/research-shell";
import { useResearch } from "@/components/research/research-provider";
import { TraceTimeline } from "@/components/research/trace-timeline";
import { SAMPLE_QUESTIONS } from "@/lib/research/mock-data";
import type { ResearchQueryResult } from "@/lib/research/types";

export function ResearchQueryView() {
  const { runQuery } = useResearch();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchQueryResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await runQuery(question.trim());
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  function askSample(q: string) {
    setQuestion(q);
    setLoading(true);
    runQuery(q)
      .then(setResult)
      .finally(() => setLoading(false));
  }

  return (
    <ResearchShell
      title="Research query"
      subtitle="Ask questions over tournament data, marketplace evidence, memory articles, forecasts, and tool logs — mock retrieval with full traceability."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a research question…"
          className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl border border-indigo-500/40 bg-indigo-500/15 px-6 py-3 text-sm text-indigo-100 disabled:opacity-50"
        >
          {loading ? "Researching…" : "Run research"}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {SAMPLE_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => askSample(q)}
            className="rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-left text-xs text-zinc-400 hover:border-indigo-500/30 hover:text-zinc-200"
          >
            {q}
          </button>
        ))}
      </div>

      {!result && !loading && (
        <p className="mt-10 text-center text-sm text-zinc-600">
          No query yet — pick a sample question or type your own.
        </p>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          <section className="glass-card rounded-2xl border border-indigo-500/20 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs uppercase text-zinc-500">Direct answer</p>
              {result.query.confidence_score != null && (
                <ConfidenceBadge score={result.query.confidence_score} />
              )}
            </div>
            <p className="mt-3 text-zinc-100">{result.query.answer_summary}</p>
          </section>

          <section className="glass-card rounded-2xl p-5">
            <p className="text-xs uppercase text-zinc-500">Evidence table</p>
            <div className="mt-4">
              <EvidenceTable items={result.evidence} />
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="glass-card rounded-2xl p-5">
              <p className="text-xs uppercase text-zinc-500">Source links</p>
              <ul className="mt-3 space-y-2">
                {result.evidence.map((e) => (
                  <li key={e.id}>
                    <Link href={e.deep_link} className="text-sm text-teal-400 hover:underline">
                      {e.title} →
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="glass-card rounded-2xl p-5">
              <p className="text-xs uppercase text-zinc-500">Limitations</p>
              <ul className="mt-3 list-inside list-disc text-sm text-zinc-400">
                {result.query.limitations.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <p className="mt-4 text-xs uppercase text-zinc-500">Suggested follow-ups</p>
              <ul className="mt-2 space-y-1">
                {result.query.follow_up_questions.map((f) => (
                  <li key={f}>
                    <button
                      type="button"
                      onClick={() => askSample(f)}
                      className="text-left text-sm text-indigo-300 hover:underline"
                    >
                      {f}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="glass-card rounded-2xl p-5">
            <p className="text-xs uppercase text-zinc-500">Research trace timeline</p>
            <div className="mt-4">
              <TraceTimeline trace={result.trace} />
            </div>
          </section>
        </div>
      )}
    </ResearchShell>
  );
}
