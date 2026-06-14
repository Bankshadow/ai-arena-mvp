"use client";

import type { AgentCorrection, AgentMistake } from "@/lib/agent-hud/types";

export function MistakesPanel({
  mistakes,
  corrections,
}: {
  mistakes: AgentMistake[];
  corrections: AgentCorrection[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <h3 className="mb-2 text-sm font-medium text-zinc-300">Mistakes</h3>
        <ul className="space-y-2">
          {mistakes.map((m) => (
            <li
              key={m.id}
              className="rounded-lg border border-white/10 bg-black/20 p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-zinc-200">{m.title}</p>
                <span
                  className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase ${
                    m.resolved
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-rose-500/15 text-rose-300"
                  }`}
                >
                  {m.resolved ? "resolved" : "open"}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">{m.description}</p>
              <p className="mt-2 font-mono text-[10px] text-zinc-500">
                {m.category} · impact {m.impactScore}/10
              </p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium text-zinc-300">Corrections</h3>
        <ul className="space-y-2">
          {corrections.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/5 p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-zinc-200">{c.title}</p>
                <span className="font-mono text-[10px] uppercase text-fuchsia-300/80">
                  {c.outcome}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">{c.action}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
