"use client";

import { RefreshCw } from "lucide-react";

import { ActivityStream } from "@/components/agent-hud/activity-stream";
import { AgentHudCard } from "@/components/agent-hud/agent-hud-card";
import { AgentHudShell } from "@/components/agent-hud/agent-hud-shell";
import { useAgentHud } from "@/components/agent-hud/agent-hud-provider";
import type {
  AgentHudProvider,
  AgentHudStatus,
  AgentHudType,
  AgentRiskLevel,
} from "@/lib/agent-hud/types";

export function AgentHudOverviewView() {
  const { filters, setFilters, resetFilters, refresh, getOverview } = useAgentHud();
  const { profiles, stats, recentActivity } = getOverview();

  return (
    <AgentHudShell
      title="Agent fleet observability"
      subtitle="Hermes-inspired control room for agent health, cost, memory, and risk. Mock data only — structured for future Supabase Realtime."
    >
      {/* Stats strip */}
      <section className="glass-card rounded-2xl border border-fuchsia-500/20 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Agents</p>
              <p className="font-mono text-2xl text-white">{stats.total}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Running</p>
              <p className="font-mono text-2xl text-cyan-300">{stats.running}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">At risk</p>
              <p className="font-mono text-2xl text-rose-300">{stats.atRisk}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Avg health</p>
              <p className="font-mono text-2xl text-fuchsia-300">{stats.avgHealth}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="flex items-center gap-2 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-100 hover:bg-fuchsia-500/20"
          >
            <RefreshCw className="size-4" /> Refresh mock data
          </button>
        </div>
      </section>

      {/* Filters */}
      <section className="mt-6 glass-card rounded-2xl border border-white/10 p-4">
        <p className="mb-3 font-mono text-xs uppercase tracking-wider text-zinc-500">Filters</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="block text-xs text-zinc-400">
            Agent type
            <select
              value={filters.agentType}
              onChange={(e) => setFilters({ agentType: e.target.value as AgentHudType | "all" })}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-sm text-zinc-200"
            >
              <option value="all">All</option>
              <option value="competitor">Competitor</option>
              <option value="judge">Judge</option>
              <option value="specialist">Specialist</option>
              <option value="research">Research</option>
              <option value="tool">Tool</option>
            </select>
          </label>
          <label className="block text-xs text-zinc-400">
            Status
            <select
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value as AgentHudStatus | "all" })}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-sm text-zinc-200"
            >
              <option value="all">All</option>
              <option value="idle">Idle</option>
              <option value="running">Running</option>
              <option value="paused">Paused</option>
              <option value="error">Error</option>
              <option value="offline">Offline</option>
            </select>
          </label>
          <label className="block text-xs text-zinc-400">
            Risk level
            <select
              value={filters.riskLevel}
              onChange={(e) => setFilters({ riskLevel: e.target.value as AgentRiskLevel | "all" })}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-sm text-zinc-200"
            >
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </label>
          <label className="block text-xs text-zinc-400">
            Provider
            <select
              value={filters.provider}
              onChange={(e) =>
                setFilters({ provider: e.target.value as AgentHudProvider | "all" })
              }
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-sm text-zinc-200"
            >
              <option value="all">All</option>
              <option value="anthropic">Anthropic</option>
              <option value="openai">OpenAI</option>
              <option value="groq">Groq</option>
              <option value="google">Google</option>
              <option value="multi">Multi</option>
              <option value="mock">Mock</option>
            </select>
          </label>
          <label className="block text-xs text-zinc-400">
            Min health ({filters.minHealthScore})
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={filters.minHealthScore}
              onChange={(e) => setFilters({ minHealthScore: Number(e.target.value) })}
              className="mt-2 w-full accent-fuchsia-500"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="mt-3 text-xs text-zinc-500 hover:text-zinc-300"
        >
          Reset filters
        </button>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="mb-4 font-mono text-xs uppercase tracking-wider text-zinc-500">
            Agent fleet ({profiles.length})
          </p>
          {profiles.length === 0 ? (
            <p className="text-zinc-500">No agents match filters.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {profiles.map((p) => (
                <AgentHudCard key={p.id} profile={p} />
              ))}
            </div>
          )}
        </div>
        <div>
          <section className="glass-card rounded-2xl border border-white/10 p-4">
            <p className="mb-3 font-mono text-xs uppercase tracking-wider text-cyan-400/80">
              Recent activity
            </p>
            <ActivityStream events={recentActivity} limit={8} />
          </section>
        </div>
      </div>
    </AgentHudShell>
  );
}
