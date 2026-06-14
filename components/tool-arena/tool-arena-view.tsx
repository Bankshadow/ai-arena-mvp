"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Play,
  Shield,
  Terminal,
  Trophy,
  Zap,
} from "lucide-react";

import { PermissionBadge, PermissionStatusPill } from "@/components/tool-arena/permission-badge";
import { RiskBadge } from "@/components/tool-arena/risk-badge";
import { ToolArenaShell } from "@/components/tool-arena/tool-arena-shell";
import { useToolArena } from "@/components/tool-arena/tool-arena-provider";
import { getToolChallenge } from "@/lib/tool-arena/registry/mock-challenges";
import { permissionStatusLabel } from "@/lib/tool-arena/permissions/policy";
import type { ToolCallLog } from "@/lib/tool-arena/types";

export function ToolArenaView() {
  const { data, runRound, busy, toggleDryRun } = useToolArena();
  const { state, plugins, challenges } = data;
  const challenge =
    getToolChallenge(state.selected_challenge_id ?? "") ?? challenges[0];
  const verification = state.execution_results.find(
    (e) => e.verification_notes.includes("Verification Agent"),
  );
  const latestLogs = state.call_logs.slice(-12).reverse();

  return (
    <ToolArenaShell
      title="Tool Arena control room"
      subtitle="Agents compete on real-world workflow tasks using mock tools — permission gates, audit logs, and verification. No external API calls."
    >
      {/* 1. Status */}
      <section className="glass-card rounded-2xl border border-amber-500/20 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-amber-400/80">
              Tool Arena status
            </p>
            <p className="mt-1 text-lg text-zinc-100">
              Round {state.round} · Phase{" "}
              <span className="text-cyan-300">{state.phase}</span>
              {state.sandbox && (
                <span className="ml-2 rounded bg-cyan-500/15 px-2 py-0.5 text-xs text-cyan-200">
                  Sandbox
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={toggleDryRun}
              className={`rounded-lg border px-3 py-2 text-sm ${
                state.dry_run
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                  : "border-white/10 text-zinc-400"
              }`}
            >
              Dry-run {state.dry_run ? "ON" : "OFF"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={runRound}
              className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/15 px-4 py-2 text-sm font-medium text-amber-100 disabled:opacity-50"
            >
              <Play className="size-4" />
              {busy ? "Running…" : "Run Tool Arena round"}
            </button>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* 2. Challenge */}
        <section className="glass-card rounded-2xl p-5">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
            <Zap className="size-4 text-amber-400" /> Current challenge
          </p>
          {challenge ? (
            <>
              <h2 className="mt-2 text-lg font-semibold text-zinc-100">{challenge.title}</h2>
              <p className="mt-2 text-sm text-zinc-400">{challenge.brief}</p>
              <p className="mt-3 text-xs text-zinc-600">
                Difficulty: {challenge.difficulty} · {challenge.required_plugins.join(", ")}
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm text-zinc-600">No challenge selected.</p>
          )}
        </section>

        {/* 3. Permissions */}
        <section className="glass-card rounded-2xl p-5">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
            <Shield className="size-4 text-emerald-400" /> Required tools & permissions
          </p>
          <ul className="mt-4 space-y-2">
            {(challenge?.required_plugins ?? []).map((pid) => {
              const plugin = plugins.find((p) => p.id === pid);
              if (!plugin) return null;
              const status = permissionStatusLabel(plugin, true);
              return (
                <li
                  key={pid}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/5 bg-black/20 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-200">{plugin.name}</span>
                    <PermissionBadge level={plugin.permission_level} />
                    <RiskBadge level={plugin.risk_level} />
                  </div>
                  <PermissionStatusPill label={status.label} tone={status.tone} />
                </li>
              );
            })}
          </ul>
          <Link href="/tools" className="mt-4 inline-block text-xs text-cyan-400 hover:underline">
            Configure tools →
          </Link>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* 4. Agent timeline */}
        <section className="glass-card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Agent action timeline</p>
          {state.active_runs.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-600">Run a round to see agent plans.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {state.active_runs.map((run) => (
                <li key={run.id} className="border-l-2 border-cyan-500/40 pl-3">
                  <p className="font-medium text-zinc-200">{run.agent_name}</p>
                  <p className="text-xs text-zinc-500">{run.plan_summary}</p>
                  <p className="text-xs text-zinc-600">
                    {run.tool_call_count} calls · {run.status}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 5. Tool call trace */}
        <section className="glass-card rounded-2xl p-5">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
            <Terminal className="size-4 text-cyan-400" /> Tool call trace
          </p>
          {latestLogs.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-600">No tool calls yet.</p>
          ) : (
            <div className="mt-4 max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-zinc-600">
                  <tr>
                    <th className="pb-2">Action</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">ms</th>
                  </tr>
                </thead>
                <tbody>
                  {latestLogs.map((log) => (
                    <CallTraceRow key={log.id} log={log} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* 6. Safety & audit */}
        <section className="glass-card rounded-2xl border border-amber-500/15 p-5">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-400/90">
            <AlertTriangle className="size-4" /> Safety & audit panel
          </p>
          {state.pending_approvals.length > 0 && (
            <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              {state.pending_approvals.length} call(s) awaiting approval (mock gate)
            </p>
          )}
          <p className="mt-3 text-sm text-zinc-400">
            Audit entries: {data.audit_log.length} · Destructive actions: disabled in MVP
          </p>
          <ul className="mt-3 space-y-1 text-xs text-zinc-500">
            <li>✓ All plugins default off until enabled</li>
            <li>✓ Write actions respect permission mode</li>
            <li>✓ Dry-run available for tournament sandbox</li>
          </ul>
        </section>

        {/* 7. Verification */}
        <section className="glass-card rounded-2xl p-5">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
            <CheckCircle2 className="size-4 text-emerald-400" /> Verification results
          </p>
          {verification ? (
            <div className="mt-4">
              <p className="text-sm text-zinc-300">{verification.verification_notes}</p>
              <p className="mt-2 font-mono text-2xl text-emerald-400">
                {verification.checks_passed}/{verification.checks_total}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-600">
              Verification Agent runs after competitor agents complete a round.
            </p>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* 8. Leaderboard */}
        <section className="glass-card rounded-2xl p-5">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
            <Trophy className="size-4 text-amber-400" /> Tool Arena leaderboard
          </p>
          {state.leaderboard.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-600">Run a round to rank agents.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {state.leaderboard.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2"
                >
                  <span className="text-zinc-300">
                    #{s.rank} {s.agent_name}
                  </span>
                  <span className="font-mono text-cyan-300">{s.total_score.toFixed(1)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 9. Marketplace candidates */}
        <section className="glass-card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            Marketplace candidate tool stacks
          </p>
          {state.marketplace_candidates.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-600">
              Top runs seed tool workflow stacks for the marketplace.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {state.marketplace_candidates.slice(0, 4).map((c) => (
                <li key={c.id} className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2">
                  <p className="font-medium text-zinc-200">{c.title}</p>
                  <p className="text-xs text-zinc-500">
                    Success {(c.task_success_rate * 100).toFixed(0)}% · Safety{" "}
                    {(c.safety_score * 100).toFixed(0)}% · {c.avg_tool_calls} calls
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Challenge picker */}
      <section className="mt-6 glass-card rounded-2xl p-5">
        <p className="text-xs uppercase tracking-wider text-zinc-500">Select challenge</p>
        <ChallengePicker />
      </section>
    </ToolArenaShell>
  );
}

function ChallengePicker() {
  const { data, selectChallenge } = useToolArena();
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {data.challenges.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => selectChallenge(c.id)}
          className={`rounded-lg border px-3 py-2 text-left text-sm ${
            data.state.selected_challenge_id === c.id
              ? "border-amber-500/40 bg-amber-500/10 text-amber-100"
              : "border-white/10 text-zinc-400 hover:border-white/20"
          }`}
        >
          {c.title}
        </button>
      ))}
    </div>
  );
}

function CallTraceRow({ log }: { log: ToolCallLog }) {
  const statusColor =
    log.status === "success" || log.status === "dry_run"
      ? "text-emerald-400"
      : log.status === "pending"
        ? "text-amber-400"
        : log.status === "denied"
          ? "text-rose-400"
          : "text-zinc-400";
  return (
    <tr className="border-t border-white/5">
      <td className="py-2 font-mono text-zinc-400">
        {log.tool_plugin_id}.{log.action_name}
        {log.dry_run && <span className="ml-1 text-emerald-600">dry</span>}
      </td>
      <td className={`py-2 ${statusColor}`}>{log.status}</td>
      <td className="py-2 text-zinc-600">{log.latency_ms}</td>
    </tr>
  );
}
