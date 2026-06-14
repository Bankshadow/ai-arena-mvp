import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/tool-arena/types";
import { RISK_LABELS } from "@/lib/tool-arena/types";

const STYLES: Record<RiskLevel, string> = {
  low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  high: "border-rose-500/40 bg-rose-500/10 text-rose-300",
};

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        STYLES[level],
        className,
      )}
    >
      {RISK_LABELS[level]} risk
    </span>
  );
}
