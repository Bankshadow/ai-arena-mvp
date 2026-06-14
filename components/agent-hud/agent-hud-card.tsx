"use client";

import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";

import { HealthGauge } from "@/components/agent-hud/health-gauge";
import { RiskBadge } from "@/components/agent-hud/risk-badge";
import { StatusPill } from "@/components/agent-hud/status-pill";
import type { AgentHudProfile } from "@/lib/agent-hud/types";

function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function AgentHudCard({ profile }: { profile: AgentHudProfile }) {
  return (
    <Link
      href={`/agents/${profile.id}/hud`}
      className="group glass-card block rounded-2xl border border-fuchsia-500/15 p-4 transition hover:border-fuchsia-500/35 hover:bg-fuchsia-500/5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-zinc-100 group-hover:text-white">{profile.name}</h3>
            <StatusPill status={profile.status} />
            <RiskBadge level={profile.riskLevel} />
          </div>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-fuchsia-400/70">
            {profile.agentType} · {profile.constitutionVersion}
          </p>
        </div>
        <HealthGauge score={profile.healthScore} compact />
      </div>

      {profile.currentTask && (
        <p className="mt-3 truncate text-sm text-cyan-200/90">{profile.currentTask}</p>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
        <div>
          <dt className="text-zinc-500">Provider</dt>
          <dd className="font-mono text-zinc-300">
            {profile.primaryProvider}/{profile.primaryModel}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Win rate</dt>
          <dd className="font-mono text-emerald-300">{Math.round(profile.winRate * 100)}%</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Avg score</dt>
          <dd className="font-mono text-violet-300">{profile.averageScore.toFixed(1)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Avg cost</dt>
          <dd className="font-mono text-cyan-300">${profile.averageCostUsd.toFixed(4)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Tokens</dt>
          <dd className="font-mono text-zinc-300">{(profile.totalTokens / 1000).toFixed(0)}k</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Memory</dt>
          <dd className="font-mono text-zinc-300">{Math.round(profile.memoryFreshness * 100)}%</dd>
        </div>
      </dl>

      {profile.riskAlerts.length > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-2 py-1.5">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-rose-400" />
          <p className="text-xs text-rose-200/90">{profile.riskAlerts[0]}</p>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
        <span>Last active {fmtRelative(profile.lastActiveAt)}</span>
        <span className="flex items-center gap-0.5 text-fuchsia-300/80 group-hover:text-fuchsia-200">
          HUD <ChevronRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}
