export function SimilarityBar({ score, label = "Similarity" }: { score: number; label?: string }) {
  const pct = Math.round(score * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] text-zinc-500">
        <span>{label}</span>
        <span className="font-mono text-emerald-300">{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-slate-500 via-emerald-500 to-teal-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
