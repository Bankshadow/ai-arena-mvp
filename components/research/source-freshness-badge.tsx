import type { FreshnessStatus, IndexingStatus } from "@/lib/research/types";

export function SourceFreshnessBadge({ status }: { status: FreshnessStatus }) {
  const styles: Record<FreshnessStatus, string> = {
    fresh: "bg-emerald-500/15 text-emerald-200",
    aging: "bg-amber-500/15 text-amber-200",
    stale: "bg-red-500/15 text-red-200",
    unknown: "bg-zinc-700/50 text-zinc-400",
  };
  return (
    <span className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase ${styles[status]}`}>
      {status}
    </span>
  );
}

export function IndexingStatusBadge({ status }: { status: IndexingStatus }) {
  const styles: Record<IndexingStatus, string> = {
    ready: "bg-teal-500/15 text-teal-200",
    indexing: "bg-indigo-500/15 text-indigo-200 animate-pulse",
    pending: "bg-zinc-600/30 text-zinc-400",
    stale: "bg-amber-500/15 text-amber-200",
    failed: "bg-red-500/15 text-red-200",
    disabled: "bg-zinc-800 text-zinc-600",
  };
  return (
    <span className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase ${styles[status]}`}>
      {status}
    </span>
  );
}
