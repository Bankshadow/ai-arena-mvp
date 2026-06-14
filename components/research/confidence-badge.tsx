export function ConfidenceBadge({ score, label = "Confidence" }: { score: number; label?: string }) {
  const pct = Math.round(score * 100);
  const tone =
    pct >= 80 ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/30" :
    pct >= 65 ? "bg-indigo-500/20 text-indigo-200 border-indigo-500/30" :
    "bg-amber-500/20 text-amber-200 border-amber-500/30";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${tone}`}>
      {label} {pct}%
    </span>
  );
}
