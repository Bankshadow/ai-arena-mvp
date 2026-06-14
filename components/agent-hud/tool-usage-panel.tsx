"use client";

import type { AgentModelUsageSnapshot, AgentToolUsageSnapshot } from "@/lib/agent-hud/types";

export function ToolUsagePanel({ usage }: { usage: AgentToolUsageSnapshot }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-white/5 bg-black/20 p-2">
          <p className="text-[10px] uppercase text-zinc-500">Calls</p>
          <p className="font-mono text-lg text-cyan-300">{usage.totalCalls}</p>
        </div>
        <div className="rounded-lg border border-white/5 bg-black/20 p-2">
          <p className="text-[10px] uppercase text-zinc-500">Success</p>
          <p className="font-mono text-lg text-emerald-300">
            {Math.round(usage.successRate * 100)}%
          </p>
        </div>
        <div className="rounded-lg border border-white/5 bg-black/20 p-2">
          <p className="text-[10px] uppercase text-zinc-500">Avg latency</p>
          <p className="font-mono text-lg text-zinc-200">{usage.avgLatencyMs}ms</p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">Top tools</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-zinc-500">
                <th className="pb-2 pr-4">Tool</th>
                <th className="pb-2 pr-4">Calls</th>
                <th className="pb-2">Success</th>
              </tr>
            </thead>
            <tbody>
              {usage.topTools.map((t) => (
                <tr key={t.toolId} className="border-b border-white/5">
                  <td className="py-2 pr-4 text-zinc-300">{t.name}</td>
                  <td className="py-2 pr-4 font-mono text-zinc-400">{t.calls}</td>
                  <td className="py-2 font-mono text-emerald-300/90">
                    {Math.round(t.successRate * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">Action trace</p>
        <ul className="space-y-1.5">
          {usage.recentTrace.map((t) => (
            <li
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-white/5 bg-black/20 px-2 py-1.5 font-mono text-xs"
            >
              <span className="text-zinc-300">
                {t.tool}.{t.action}
              </span>
              <span
                className={
                  t.status === "ok"
                    ? "text-emerald-400"
                    : t.status === "error"
                      ? "text-rose-400"
                      : "text-zinc-500"
                }
              >
                {t.status} · {t.latencyMs}ms
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ModelUsagePanel({ usage }: { usage: AgentModelUsageSnapshot }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-400">{usage.routingPolicy}</p>
      <div className="space-y-2">
        {usage.providers.map((p) => (
          <div key={`${p.provider}-${p.model}`} className="rounded-lg border border-white/10 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-zinc-200">
                {p.provider} · <span className="font-mono text-cyan-300">{p.model}</span>
              </p>
              <span className="font-mono text-xs text-fuchsia-300">{p.sharePct}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                style={{ width: `${p.sharePct}%` }}
              />
            </div>
            <p className="mt-2 font-mono text-[10px] text-zinc-500">
              {p.runs} runs · ${p.avgCostUsd.toFixed(4)} avg · {p.avgLatencyMs}ms
            </p>
          </div>
        ))}
      </div>
      <p className="font-mono text-xs text-zinc-500">Fallback invocations: {usage.fallbackCount}</p>
    </div>
  );
}
