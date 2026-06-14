"use client";

import type { AgentActivityEvent } from "@/lib/agent-hud/types";

const SEV: Record<AgentActivityEvent["severity"], string> = {
  info: "border-l-cyan-500/60",
  success: "border-l-emerald-500/60",
  warning: "border-l-amber-500/60",
  error: "border-l-rose-500/60",
};

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ActivityStream({
  events,
  limit = 12,
}: {
  events: AgentActivityEvent[];
  limit?: number;
}) {
  const items = events.slice(0, limit);

  if (items.length === 0) {
    return <p className="text-sm text-zinc-500">No activity recorded.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((e) => (
        <li
          key={e.id}
          className={`rounded-lg border border-white/5 border-l-2 bg-black/20 px-3 py-2 ${SEV[e.severity]}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="text-sm font-medium text-zinc-200">{e.title}</p>
            <time className="font-mono text-[10px] text-zinc-500">{fmtTime(e.createdAt)}</time>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">{e.detail}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-fuchsia-400/70">
            {e.type.replace(/_/g, " ")}
          </p>
        </li>
      ))}
    </ul>
  );
}
