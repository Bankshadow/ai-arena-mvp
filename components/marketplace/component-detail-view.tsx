"use client";

import Link from "next/link";
import { useCallback } from "react";
import { ArrowLeft, Download, Layers } from "lucide-react";

import { AddToStackButton } from "@/components/marketplace/add-to-stack-button";
import { ArenaScoreBadge } from "@/components/marketplace/arena-score-badge";
import { ComponentMetricsBar } from "@/components/marketplace/component-metrics-bar";
import { ComponentStatusBadge } from "@/components/marketplace/component-status-badge";
import { ComponentTypeBadge } from "@/components/marketplace/component-type-badge";
import { EvidenceTable } from "@/components/marketplace/evidence-table";
import { TournamentTestedBadge } from "@/components/marketplace/tournament-tested-badge";
import { Nav } from "@/components/Nav";
import { downloadComponentFile } from "@/lib/marketplace/component-export";
import { getComponentById } from "@/lib/marketplace/mock-catalog";
import { battleScore } from "@/lib/marketplace/proof-status";
import type { MarketplaceComponent } from "@/lib/marketplace/types";

type Props = { component: MarketplaceComponent };

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="glass-card scroll-mt-24 rounded-2xl border border-white/10 p-5 sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ComponentDetailView({ component }: Props) {
  const p = component.proof;
  const score = battleScore(component);

  const handleExport = useCallback(
    (format: "json" | "markdown") => {
      downloadComponentFile(component, format);
    },
    [component],
  );

  const navLinks = [
    { href: "#overview", label: "Overview" },
    { href: "#battle-proof", label: "Battle Proof" },
    { href: "#metrics", label: "Metrics" },
    { href: "#evidence", label: "Evidence" },
    { href: "#judge-notes", label: "Judge Notes" },
    { href: "#weaknesses", label: "Weaknesses" },
    { href: "#compatible-stack", label: "Compatible Stack" },
    { href: "#export", label: "Export" },
  ];

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.12),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6">
        <Link
          href="/components"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300"
        >
          <ArrowLeft className="size-4" /> All components
        </Link>

        <header id="overview" className="mt-6 scroll-mt-24">
          <div className="flex flex-wrap gap-2">
            <ComponentTypeBadge type={component.type} />
            <ComponentStatusBadge status={component.proof_status} />
            {component.tournament_tested && <TournamentTestedBadge />}
            <span className="rounded-full border border-white/10 px-2 py-1 font-mono text-xs text-zinc-500">
              {component.version}
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {component.title}
          </h1>
          <p className="mt-3 max-w-3xl text-zinc-400">{component.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
              <p className="text-[10px] uppercase text-emerald-400/80">Battle score</p>
              <p className="font-mono text-2xl text-emerald-300">{score.toFixed(0)}/100</p>
            </div>
            <ArenaScoreBadge score={component.arena_score} />
            <AddToStackButton component={component} />
            <Link
              href="/stack-builder"
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200"
            >
              <Layers className="size-3.5" /> Open Stack Builder
            </Link>
          </div>

          <nav className="mt-8 flex flex-wrap gap-2">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-zinc-500 hover:border-violet-500/30 hover:text-violet-200"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </header>

        <div className="mt-8 space-y-6">
          <Section id="battle-proof" title="Battle Proof">
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Win rate" value={`${(p.win_rate * 100).toFixed(0)}%`} />
              <Stat label="Avg cost" value={`$${p.avg_cost_usd.toFixed(4)}`} />
              <Stat label="Avg tokens" value={p.avg_tokens.toLocaleString()} />
              <Stat label="Avg latency" value={`${p.avg_latency_ms}ms`} />
              <Stat label="Tested runs" value={String(p.tournament_runs)} />
              <Stat label="Evidence rows" value={String(component.evidence_count)} />
              <Stat label="Source tournament" value={component.source_tournament_id ?? "—"} />
              <Stat label="Source round" value={component.source_round ? `R${component.source_round}` : "—"} />
            </dl>
            <p className="mt-4 text-sm text-zinc-400">
              <span className="text-zinc-500">Best use case:</span> {component.best_use_case}
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Compatible providers: {component.compatible_providers.join(", ")}
            </p>
            {p.benchmark_history.length > 0 && (
              <div className="mt-6">
                <p className="text-xs uppercase text-zinc-500">Score trend</p>
                <div className="mt-2 flex h-20 items-end gap-1">
                  {p.benchmark_history.map((b) => (
                    <div
                      key={b.round}
                      className="flex-1 rounded-t bg-gradient-to-t from-violet-600/50 to-cyan-500/50"
                      style={{ height: `${Math.max(18, b.score)}%` }}
                      title={`Round ${b.round}: ${b.score}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </Section>

          <Section id="metrics" title="Performance Metrics">
            <ComponentMetricsBar score={component.arena_score} highlight="battle" />
            <p className="mt-4 font-mono text-xs text-zinc-600">
              Arena Score composite: {component.arena_score.total}/100
            </p>
          </Section>

          <Section id="evidence" title="Tournament Evidence">
            <EvidenceTable evidence={component.evidence} />
          </Section>

          <Section id="judge-notes" title="Judge Notes">
            <ul className="space-y-3">
              {component.judge_notes.map((note) => (
                <li
                  key={note.id}
                  className="rounded-xl border border-white/5 bg-black/25 px-4 py-3 text-sm"
                >
                  <p className="font-medium text-violet-300">{note.dimension}</p>
                  <p className="mt-1 text-zinc-400">{note.note}</p>
                  {note.score_delta != null && (
                    <p className="mt-1 font-mono text-xs text-zinc-600">
                      Δ score {note.score_delta > 0 ? "+" : ""}
                      {note.score_delta}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="weaknesses" title="Known Weaknesses">
            <ul className="list-inside list-disc space-y-2 text-sm text-amber-100/90">
              {component.failure_cases.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </Section>

          <Section id="compatible-stack" title="Compatible Stack">
            {component.compatible_stack_component_ids.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Pair with a judge rubric and router from the{" "}
                <Link href="/components" className="text-cyan-400 hover:underline">
                  component library
                </Link>
                .
              </p>
            ) : (
              <ul className="space-y-2">
                {component.compatible_stack_component_ids.map((id) => {
                  const peer = getComponentById(id);
                  if (!peer) return null;
                  return (
                    <li key={id}>
                      <Link
                        href={`/components/${id}`}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm hover:border-violet-500/30"
                      >
                        <span className="text-zinc-200">{peer.title}</span>
                        <ComponentTypeBadge type={peer.type} small />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          <Section id="export" title="Export Options">
            <p className="text-sm text-zinc-500">
              Download benchmark proof and install notes for Cursor, Claude Code, or your repo.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleExport("json")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm hover:border-cyan-500/40"
              >
                <Download className="size-4" /> JSON config
              </button>
              <button
                type="button"
                onClick={() => handleExport("markdown")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm hover:border-cyan-500/40"
              >
                <Download className="size-4" /> Markdown spec
              </button>
              <AddToStackButton component={component} />
            </div>
            <pre className="mt-4 overflow-x-auto rounded-lg border border-white/5 bg-black/40 p-4 text-xs text-zinc-500">
              {component.payload_preview}
            </pre>
          </Section>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
      <dt className="text-[10px] uppercase text-zinc-600">{label}</dt>
      <dd className="mt-1 font-mono text-sm text-zinc-200">{value}</dd>
    </div>
  );
}
