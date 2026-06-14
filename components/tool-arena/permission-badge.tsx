import { cn } from "@/lib/utils";
import type { PermissionLevel } from "@/lib/tool-arena/types";
import { PERMISSION_LABELS } from "@/lib/tool-arena/types";

const STYLES: Record<PermissionLevel, string> = {
  off: "border-zinc-600/40 bg-zinc-800/40 text-zinc-400",
  ask: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  auto_read: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
  auto_safe: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  auto_all: "border-violet-500/40 bg-violet-500/10 text-violet-200",
};

export function PermissionBadge({
  level,
  className,
}: {
  level: PermissionLevel;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        STYLES[level],
        className,
      )}
    >
      {PERMISSION_LABELS[level]}
    </span>
  );
}

export function PermissionStatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "ok" | "warn" | "blocked";
}) {
  const styles = {
    ok: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    warn: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    blocked: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  };
  return (
    <span className={cn("rounded-md border px-2 py-0.5 text-xs", styles[tone])}>{label}</span>
  );
}
