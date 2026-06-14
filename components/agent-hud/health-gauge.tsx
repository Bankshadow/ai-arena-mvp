"use client";

import { HEALTH_WEIGHTS } from "@/lib/agent-hud/health/score";
import type { AgentHealthComponents } from "@/lib/agent-hud/types";

function barColor(pct: number): string {
  if (pct >= 80) return "from-emerald-400 to-cyan-400";
  if (pct >= 60) return "from-cyan-400 to-violet-400";
  return "from-amber-400 to-rose-400";
}

function componentPct(value: number, max: number): number {
  return Math.round((value / max) * 100);
}

const ROWS: { key: keyof AgentHealthComponents; label: string; max: number }[] = [
  { key: "performanceStability", label: "Performance stability", max: HEALTH_WEIGHTS.performanceStability },
  { key: "costEfficiency", label: "Cost efficiency", max: HEALTH_WEIGHTS.costEfficiency },
  { key: "memoryFreshness", label: "Memory freshness", max: HEALTH_WEIGHTS.memoryFreshness },
  { key: "errorRate", label: "Error rate (inverse)", max: HEALTH_WEIGHTS.errorRate },
  { key: "toolReliability", label: "Tool reliability", max: HEALTH_WEIGHTS.toolReliability },
  { key: "constitutionMaturity", label: "Constitution maturity", max: HEALTH_WEIGHTS.constitutionMaturity },
  { key: "recentAnomalyPenalty", label: "Anomaly penalty", max: HEALTH_WEIGHTS.recentAnomalyPenaltyMax },
];

export function HealthGauge({
  score,
  components,
  compact,
}: {
  score: number;
  components?: AgentHealthComponents;
  compact?: boolean;
}) {
  const ringPct = score;
  const stroke = score >= 80 ? "#34d399" : score >= 60 ? "#22d3ee" : "#fb7185";

  return (
    <div className={compact ? "flex items-center gap-4" : "space-y-4"}>
      <div className="relative mx-auto flex size-28 items-center justify-center">
        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2.5"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={stroke}
            strokeWidth="2.5"
            strokeDasharray={`${ringPct}, 100`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute text-center">
          <p className="font-mono text-2xl font-semibold text-white">{score}</p>
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">health</p>
        </div>
      </div>

      {components && !compact && (
        <div className="space-y-2">
          {ROWS.map((row) => {
            const val = components[row.key];
            const isPenalty = row.key === "recentAnomalyPenalty";
            const pct = componentPct(val, row.max);
            return (
              <div key={row.key}>
                <div className="mb-0.5 flex justify-between text-xs">
                  <span className="text-zinc-400">{row.label}</span>
                  <span className="font-mono text-zinc-500">
                    {isPenalty ? `−${val.toFixed(1)}` : `${val.toFixed(1)} / ${row.max}`}
                  </span>
                </div>
                {!isPenalty && (
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${barColor(pct)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
