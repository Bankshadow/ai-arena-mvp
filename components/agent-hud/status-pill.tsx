"use client";

import { cn } from "@/lib/utils";
import type { AgentHudStatus } from "@/lib/agent-hud/types";

const STYLES: Record<AgentHudStatus, string> = {
  idle: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  running: "border-cyan-500/40 bg-cyan-500/15 text-cyan-200",
  paused: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  error: "border-rose-500/40 bg-rose-500/15 text-rose-200",
  offline: "border-zinc-600/30 bg-zinc-800/50 text-zinc-500",
};

const DOT: Record<AgentHudStatus, string> = {
  idle: "bg-zinc-400",
  running: "bg-cyan-400 animate-pulse",
  paused: "bg-amber-400",
  error: "bg-rose-400 animate-pulse",
  offline: "bg-zinc-600",
};

export function StatusPill({ status, className }: { status: AgentHudStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs capitalize",
        STYLES[status],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", DOT[status])} />
      {status}
    </span>
  );
}
