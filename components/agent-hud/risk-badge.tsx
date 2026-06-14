"use client";

import { cn } from "@/lib/utils";
import type { AgentRiskLevel } from "@/lib/agent-hud/types";

const STYLES: Record<AgentRiskLevel, string> = {
  low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  high: "border-orange-500/30 bg-orange-500/10 text-orange-200",
  critical: "border-rose-500/40 bg-rose-500/15 text-rose-200",
};

export function RiskBadge({ level, className }: { level: AgentRiskLevel; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        STYLES[level],
        className,
      )}
    >
      {level}
    </span>
  );
}
