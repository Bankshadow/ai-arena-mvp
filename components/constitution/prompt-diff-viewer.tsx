"use client";

import type { PromptDiff } from "@/lib/constitution/types";

const CHANGE_STYLES = {
  added: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  removed: "border-red-500/40 bg-red-500/10 text-red-200",
  modified: "border-amber-500/40 bg-amber-500/10 text-amber-200",
};

type Props = {
  diff: PromptDiff | null;
  loading?: boolean;
};

export function PromptDiffViewer({ diff, loading }: Props) {
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 text-sm text-zinc-500">Computing diff…</div>
    );
  }

  if (!diff) {
    return (
      <div className="glass-card rounded-2xl p-6 text-sm text-zinc-600">
        Select two versions to compare operating spec changes.
      </div>
    );
  }

  const added = diff.changes.filter((c) => c.changeType === "added").length;
  const removed = diff.changes.filter((c) => c.changeType === "removed").length;
  const modified = diff.changes.filter((c) => c.changeType === "modified").length;

  return (
    <section className="glass-card overflow-hidden rounded-2xl border border-violet-500/20">
      <div className="border-b border-white/10 bg-gradient-to-r from-violet-500/10 to-cyan-500/5 px-5 py-4">
        <p className="font-mono text-xs uppercase tracking-wider text-violet-400/80">
          Prompt diff viewer
        </p>
        <h3 className="mt-1 text-lg font-semibold text-white">
          {diff.agentName} · {diff.fromVersion} → {diff.toVersion}
        </h3>
        <p className="mt-1 text-sm text-zinc-500">{diff.summary}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-emerald-500/30 px-2 py-0.5 text-emerald-300">
            +{added} added
          </span>
          <span className="rounded-full border border-red-500/30 px-2 py-0.5 text-red-300">
            −{removed} removed
          </span>
          <span className="rounded-full border border-amber-500/30 px-2 py-0.5 text-amber-300">
            ~{modified} modified
          </span>
        </div>
      </div>

      <div className="max-h-[420px] space-y-3 overflow-y-auto p-5">
        {diff.changes.length === 0 ? (
          <p className="text-sm text-zinc-600">No differences between these versions.</p>
        ) : (
          diff.changes.map((change, i) => (
            <div
              key={`${change.field}-${i}`}
              className={`rounded-xl border p-4 ${CHANGE_STYLES[change.changeType]}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{change.fieldLabel}</span>
                <span className="text-xs uppercase opacity-80">{change.changeType}</span>
              </div>
              {change.before && (
                <p className="mt-2 text-xs text-zinc-400 line-through opacity-70">{change.before}</p>
              )}
              {change.after && (
                <p className="mt-2 text-sm text-zinc-200">{change.after}</p>
              )}
              <p className="mt-3 text-xs text-zinc-400">
                <span className="text-cyan-400/80">Expected:</span> {change.expectedImpact}
              </p>
              {change.actualImpact && (
                <p className="mt-1 text-xs text-violet-300">
                  <span className="text-violet-400/80">Tournament impact:</span> {change.actualImpact}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
