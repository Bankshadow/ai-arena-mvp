import type { VectorIndexHealth } from "@/lib/vector/types";

export function IndexHealthBadge({ health }: { health: VectorIndexHealth }) {
  const styles: Record<VectorIndexHealth, string> = {
    healthy: "bg-emerald-500/15 text-emerald-200",
    degraded: "bg-amber-500/15 text-amber-200",
    empty: "bg-zinc-700/50 text-zinc-400",
    rebuilding: "bg-indigo-500/15 text-indigo-200 animate-pulse",
  };
  return (
    <span className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase ${styles[health]}`}>
      {health}
    </span>
  );
}
