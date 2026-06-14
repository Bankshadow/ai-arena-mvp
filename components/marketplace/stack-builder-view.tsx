"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Download, Layers, Trash2, AlertTriangle } from "lucide-react";

import { AddToStackButton } from "@/components/marketplace/add-to-stack-button";
import { ComponentTypeBadge } from "@/components/marketplace/component-type-badge";
import {
  getComponentById,
  getMockComponentCatalog,
} from "@/lib/marketplace/mock-catalog";
import {
  useStackStoreInstance,
  useWorkflowStack,
} from "@/components/marketplace/stack-provider";
import { Nav } from "@/components/Nav";
import {
  downloadFilename,
  exportStack,
} from "@/lib/marketplace/stack-export";
import { applyStackEstimates } from "@/lib/marketplace/stack-estimator";
import { validateStack } from "@/lib/marketplace/stack-validator";
import type { StackExportFormat } from "@/lib/marketplace/types";

const EXPORT_FORMATS: { id: StackExportFormat; label: string }[] = [
  { id: "json", label: "JSON config" },
  { id: "markdown", label: "Markdown spec" },
  { id: "cursor", label: "Cursor prompt" },
  { id: "claude-code", label: "Claude Code setup" },
];

export function StackBuilderView() {
  const { stack, removeComponent, clearStack, refresh } = useWorkflowStack();
  const store = useStackStoreInstance();
  const [search, setSearch] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  const browseList = useMemo(() => {
    const q = search.toLowerCase();
    return getMockComponentCatalog().filter(
      (c) =>
        !stack.components.some((s) => s.component_id === c.id) &&
        (!q || c.title.toLowerCase().includes(q) || c.type.includes(q)),
    );
  }, [search, stack.components]);

  const resolvedStack = useMemo(() => {
    const warnings = validateStack(stack);
    return applyStackEstimates({ ...stack, compatibility_warnings: warnings });
  }, [stack]);

  const handleExport = useCallback(
    (format: StackExportFormat) => {
      const content = exportStack(format, resolvedStack);
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadFilename(format, resolvedStack);
      a.click();
      URL.revokeObjectURL(url);
      setExportOpen(false);
    },
    [resolvedStack],
  );

  const handleSave = () => {
    const saved = store.saveStack(resolvedStack.name);
    store.saveDraft(resolvedStack);
    setSavedSlug(saved.slug);
    refresh();
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.1),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400/80">
          Stack Builder
        </p>
        <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold">
          <Layers className="size-8 text-violet-400" />
          Compose your workflow stack
        </h1>
        <p className="mt-2 max-w-2xl text-zinc-400">
          Browse tournament-tested components, check compatibility, estimate cost and quality, then
          export to JSON, Markdown, Cursor, or Claude Code — like{" "}
          <a href="https://aitmpl.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
            aitmpl.com Stack Builder
          </a>
          , with AI ARENA benchmark proof.
        </p>

        {savedSlug && (
          <p className="mt-4 text-sm text-emerald-400">
            Stack saved ·{" "}
            <Link href={`/stacks/${savedSlug}`} className="underline">
              View /stacks/{savedSlug}
            </Link>
          </p>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* Browse */}
          <section className="glass-card rounded-2xl p-4 lg:col-span-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Browse
            </h2>
            <input
              type="search"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-3 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            />
            <ul className="mt-3 max-h-[420px] space-y-2 overflow-y-auto">
              {browseList.slice(0, 20).map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-black/20 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-200">{c.title}</p>
                    <ComponentTypeBadge type={c.type} small />
                  </div>
                  <AddToStackButton component={c} variant="icon" />
                </li>
              ))}
            </ul>
          </section>

          {/* Stack canvas */}
          <section className="glass-card rounded-2xl p-4 lg:col-span-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Your stack ({resolvedStack.components.length})
              </h2>
              {resolvedStack.components.length > 0 && (
                <button
                  type="button"
                  onClick={clearStack}
                  className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                >
                  <Trash2 className="size-3.5" /> Clear
                </button>
              )}
            </div>
            <input
              value={resolvedStack.name}
              onChange={(e) => {
                store.saveDraft({ ...resolvedStack, name: e.target.value });
                refresh();
              }}
              className="mt-3 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm font-medium"
            />
            {resolvedStack.components.length === 0 ? (
              <p className="mt-8 text-center text-sm text-zinc-600">
                Stack is empty — add components from the browse panel.
              </p>
            ) : (
              <ol className="mt-4 space-y-2">
                {resolvedStack.components.map((entry, idx) => {
                  const c = getComponentById(entry.component_id);
                  if (!c) return null;
                  return (
                    <li
                      key={entry.component_id}
                      className="flex items-center gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 px-3 py-3"
                    >
                      <span className="font-mono text-xs text-zinc-600">{idx + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{c.title}</p>
                        <p className="text-xs text-zinc-500">
                          {entry.role_in_stack} · Arena {c.arena_score.total}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeComponent(entry.component_id)}
                        className="text-zinc-600 hover:text-red-400"
                        aria-label="Remove"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          {/* Estimates + export */}
          <section className="glass-card rounded-2xl p-4 lg:col-span-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Estimates
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-zinc-600">Est. cost / run</dt>
                <dd className="font-mono text-lg text-emerald-400">
                  ${resolvedStack.estimated_cost_usd.toFixed(4)}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-600">Est. quality</dt>
                <dd className="font-mono text-lg text-cyan-300">
                  {resolvedStack.estimated_quality_score}/100
                </dd>
              </div>
            </dl>

            {resolvedStack.compatibility_warnings.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="flex items-center gap-1 text-xs uppercase text-amber-400">
                  <AlertTriangle className="size-3.5" /> Warnings
                </p>
                {resolvedStack.compatibility_warnings.map((w, i) => (
                  <p
                    key={i}
                    className={`rounded-lg border px-2 py-1.5 text-xs ${
                      w.severity === "error"
                        ? "border-red-500/30 bg-red-500/10 text-red-200"
                        : w.severity === "warning"
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                          : "border-white/10 text-zinc-500"
                    }`}
                  >
                    {w.message}
                  </p>
                ))}
              </div>
            )}

            <div className="mt-6 space-y-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={resolvedStack.components.length === 0}
                className="w-full rounded-xl border border-violet-500/40 bg-violet-500/15 py-2 text-sm text-violet-100 disabled:opacity-40"
              >
                Save stack
              </button>
              <div className="relative">
                <button
                  type="button"
                  disabled={resolvedStack.components.length === 0}
                  onClick={() => setExportOpen((o) => !o)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 py-2 text-sm text-cyan-200 disabled:opacity-40"
                >
                  <Download className="size-4" /> Export
                </button>
                {exportOpen && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-white/10 bg-[#0a0a0a] py-1 shadow-xl">
                    {EXPORT_FORMATS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleExport(f.id)}
                        className="block w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-white/5"
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
