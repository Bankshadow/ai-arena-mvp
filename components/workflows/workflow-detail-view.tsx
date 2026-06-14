"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy, GitBranch } from "lucide-react";

import { Nav } from "@/components/Nav";
import type { WorkflowDetail } from "@/lib/workflows/catalog";

type Props = { workflow: WorkflowDetail };

export function WorkflowDetailView({ workflow }: Props) {
  const [copied, setCopied] = useState<"prompt" | "bundle" | null>(null);

  async function copy(text: string, kind: "prompt" | "bundle") {
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  }

  function downloadBundle() {
    const blob = new Blob([workflow.exportBundle], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflow.slug}-workflow.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.1),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6">
        <Link href="/workflows" className="text-sm text-cyan-400 hover:underline">
          ← All workflows
        </Link>
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-cyan-400/80">
          MVP20-21 · Workflow detail
        </p>
        <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold">
          <GitBranch className="size-8 text-violet-400" />
          {workflow.title}
        </h1>
        <p className="mt-3 text-zinc-400">{workflow.strategySummary}</p>

        <dl className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
          <div className="glass-card rounded-xl py-3">
            <dt className="text-xs text-zinc-500">Model</dt>
            <dd className="mt-1 font-medium">{workflow.modelUsed}</dd>
          </div>
          <div className="glass-card rounded-xl py-3">
            <dt className="text-xs text-zinc-500">Cost</dt>
            <dd className="mt-1 font-mono text-cyan-400">{workflow.cost}</dd>
          </div>
          <div className="glass-card rounded-xl py-3">
            <dt className="text-xs text-zinc-500">Quality</dt>
            <dd className="mt-1 font-mono text-violet-300">{workflow.qualityScore}</dd>
          </div>
        </dl>

        <section className="mt-8 glass-card rounded-2xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Steps</h2>
          <ol className="mt-3 space-y-2">
            {workflow.steps.map((step, i) => (
              <li key={step} className="flex gap-2 text-sm text-zinc-300">
                <span className="font-mono text-xs text-cyan-500/80">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-6 glass-card rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Prompt template
            </h2>
            <button
              type="button"
              onClick={() => copy(workflow.promptTemplate, "prompt")}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
            >
              {copied === "prompt" ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              {copied === "prompt" ? "Copied" : "Clone prompt"}
            </button>
          </div>
          <pre className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-4 text-xs text-zinc-300">
            {workflow.promptTemplate}
          </pre>
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => copy(workflow.exportBundle, "bundle")}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-2.5 text-sm text-violet-200 hover:bg-violet-500/20"
          >
            {copied === "bundle" ? <Check className="size-4" /> : <Copy className="size-4" />}
            Copy export bundle
          </button>
          <button
            type="button"
            onClick={downloadBundle}
            className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-sm text-cyan-200 hover:bg-cyan-500/20"
          >
            Download .md
          </button>
          <Link
            href="/arena"
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
          >
            Test in Arena →
          </Link>
        </div>
      </main>
    </div>
  );
}
