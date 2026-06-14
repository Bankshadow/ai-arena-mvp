"use client";

import type { AgentPerformancePoint } from "@/lib/agent-hud/types";

export function PerformanceTimeline({ points }: { points: AgentPerformancePoint[] }) {
  if (points.length === 0) return null;

  const maxScore = Math.max(...points.map((p) => p.score), 100);
  const minScore = Math.min(...points.map((p) => p.score), 0);
  const range = maxScore - minScore || 1;

  return (
    <div>
      <div className="flex h-32 items-end gap-1 sm:gap-2">
        {points.map((p) => {
          const h = ((p.score - minScore) / range) * 100;
          return (
            <div key={p.at} className="group flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-gradient-to-t from-fuchsia-600/40 to-cyan-400/80 transition group-hover:from-fuchsia-500/60 group-hover:to-cyan-300"
                style={{ height: `${Math.max(8, h)}%` }}
                title={`${p.label}: ${p.score}`}
              />
              <span className="font-mono text-[9px] text-zinc-500">{p.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
        {points.slice(-3).map((p) => (
          <div key={p.at} className="rounded border border-white/5 bg-black/20 px-2 py-1.5">
            <p className="text-zinc-500">{p.label}</p>
            <p className="font-mono text-cyan-300">{p.score.toFixed(1)}</p>
            <p className="font-mono text-zinc-500">${p.costUsd.toFixed(4)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
