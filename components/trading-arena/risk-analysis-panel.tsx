import type { StrategyRiskReview } from "@/lib/trading-arena/types";

export function RiskAnalysisPanel({ review }: { review: StrategyRiskReview }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-300">{review.summary}</p>
      <div className="flex flex-wrap gap-2">
        <Badge ok={review.max_drawdown_ok} label="Drawdown OK" />
        <Badge ok={review.leverage_ok} label="Leverage OK" />
        <span className="rounded bg-white/5 px-2 py-1 text-xs text-zinc-400">
          Tail risk {review.tail_risk_score.toFixed(1)}/10
        </span>
        <span className="rounded bg-white/5 px-2 py-1 text-xs text-zinc-400">
          Exit discipline {review.exit_discipline_score.toFixed(1)}/10
        </span>
      </div>
      {review.findings.length > 0 && (
        <ul className="list-inside list-disc text-sm text-amber-200/80">
          {review.findings.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`rounded px-2 py-1 text-xs ${
        ok ? "bg-emerald-500/15 text-emerald-200" : "bg-red-500/15 text-red-200"
      }`}
    >
      {label}
    </span>
  );
}
