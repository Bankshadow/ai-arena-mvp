"use client";

import type { AgentCostProfile } from "@/lib/agent-hud/types";

export function CostProfilePanel({ profile }: { profile: AgentCostProfile }) {
  const rows = [
    { label: "Avg cost", value: `$${profile.avgCostUsd.toFixed(4)}` },
    { label: "Median", value: `$${profile.medianCostUsd.toFixed(4)}` },
    { label: "P95", value: `$${profile.p95CostUsd.toFixed(4)}` },
    { label: "Total spend", value: `$${profile.totalSpendUsd.toFixed(2)}` },
    { label: "Cost / quality pt", value: `$${profile.costPerQualityPoint.toFixed(5)}` },
    { label: "Tokens in (avg)", value: profile.tokenInAvg.toLocaleString() },
    { label: "Tokens out (avg)", value: profile.tokenOutAvg.toLocaleString() },
    { label: "Total tokens", value: profile.totalTokens.toLocaleString() },
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-zinc-500">Budget utilization</span>
        <span className="font-mono text-sm text-cyan-300">
          {Math.round(profile.budgetUtilization * 100)}%
        </span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500"
          style={{ width: `${profile.budgetUtilization * 100}%` }}
        />
      </div>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {rows.map((r) => (
          <div key={r.label} className="rounded-lg border border-white/5 bg-black/20 p-2.5">
            <dt className="text-[10px] uppercase tracking-wider text-zinc-500">{r.label}</dt>
            <dd className="mt-0.5 font-mono text-sm text-zinc-200">{r.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 font-mono text-xs capitalize text-fuchsia-300/80">
        Trend: {profile.trend}
      </p>
    </div>
  );
}
