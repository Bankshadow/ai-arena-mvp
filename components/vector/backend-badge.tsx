export function BackendBadge({ backend }: { backend: string }) {
  const styles: Record<string, string> = {
    mock: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
    zvec: "bg-teal-500/15 text-teal-200 border-teal-500/30",
    pgvector: "bg-violet-500/15 text-violet-200 border-violet-500/30",
    milvus: "bg-amber-500/15 text-amber-200 border-amber-500/30",
  };
  return (
    <span
      className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${styles[backend] ?? styles.mock}`}
    >
      {backend}
    </span>
  );
}
