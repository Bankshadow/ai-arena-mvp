"use client";

import { MemoryShell } from "@/components/memory/memory-shell";
import { useMemory } from "@/components/memory/memory-provider";

export function MemoryLintView() {
  const { kb, runLint } = useMemory();
  const report = kb.lastLintReport;

  return (
    <MemoryShell
      title="Knowledge health check"
      subtitle="Lint the knowledge base for broken links, orphans, stale lessons, and missing evidence."
    >
      <button
        type="button"
        onClick={runLint}
        className="rounded-xl border border-violet-500/40 bg-violet-500/15 px-5 py-2 text-sm text-violet-100"
      >
        Run lint check
      </button>

      {report ? (
        <div className="mt-8 space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs uppercase text-zinc-500">Health score</p>
            <p className="font-mono text-4xl text-cyan-300">{report.health_score}/100</p>
            <p className="mt-2 text-sm text-zinc-400">{report.summary}</p>
          </div>
          <ul className="space-y-2">
            {report.issues.map((issue) => (
              <li
                key={`${issue.code}-${issue.entity_id}`}
                className={`rounded-xl border px-4 py-3 text-sm ${
                  issue.severity === "error"
                    ? "border-red-500/30 bg-red-500/10 text-red-200"
                    : issue.severity === "warning"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                      : "border-white/10 text-zinc-500"
                }`}
              >
                <span className="font-mono text-xs uppercase opacity-70">{issue.code}</span>
                <p className="mt-1">{issue.message}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-8 text-zinc-600">Run lint to check knowledge base health.</p>
      )}
    </MemoryShell>
  );
}
