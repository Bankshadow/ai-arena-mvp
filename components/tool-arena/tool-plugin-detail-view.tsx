"use client";

import Link from "next/link";
import { notFound } from "next/navigation";

import { PermissionBadge } from "@/components/tool-arena/permission-badge";
import { RiskBadge } from "@/components/tool-arena/risk-badge";
import { ToolArenaShell } from "@/components/tool-arena/tool-arena-shell";
import { useToolArena } from "@/components/tool-arena/tool-arena-provider";
import { getActionsForPlugin } from "@/lib/tool-arena/registry/mock-plugins";
import { MOCK_TOOL_STACKS } from "@/lib/tool-arena/store";
import { PERMISSION_LABELS, type PermissionLevel } from "@/lib/tool-arena/types";

type Props = { pluginId: string };

export function ToolPluginDetailView({ pluginId }: Props) {
  const { data, updatePlugin, setPermission } = useToolArena();
  const plugin = data.plugins.find((p) => p.id === pluginId);
  if (!plugin) notFound();

  const actions = getActionsForPlugin(pluginId);
  const auditLogs = data.audit_log.filter((l) => l.tool_plugin_id === pluginId).slice(0, 8);
  const stacks = MOCK_TOOL_STACKS.filter((s) => s.plugin_ids.includes(pluginId));

  return (
    <ToolArenaShell title={plugin.name} subtitle={plugin.description}>
      <Link href="/tools" className="text-sm text-zinc-500 hover:text-zinc-300">
        ← Tool registry
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="glass-card rounded-2xl p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Plugin overview
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <PermissionBadge level={plugin.permission_level} />
            <RiskBadge level={plugin.risk_level} />
            <span className="rounded-md border border-white/10 px-2 py-0.5 text-xs text-zinc-500">
              Auth: {plugin.auth_method}
            </span>
          </div>
          <p className="mt-4 text-sm text-zinc-400">
            Provider: <span className="text-zinc-200">{plugin.provider}</span> · Audits:{" "}
            {plugin.audit_count}
            {plugin.last_used_at && (
              <> · Last used {new Date(plugin.last_used_at).toLocaleDateString()}</>
            )}
          </p>

          <h3 className="mt-8 text-sm font-semibold uppercase text-zinc-500">Available actions</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-zinc-600">
                <tr>
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Kind</th>
                  <th className="pb-2">Risk</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((a) => (
                  <tr key={a.id} className="border-t border-white/5">
                    <td className="py-2">
                      <p className="font-medium text-zinc-200">{a.label}</p>
                      <p className="text-xs text-zinc-600">{a.name}</p>
                    </td>
                    <td className="py-2 capitalize text-zinc-400">{a.kind}</td>
                    <td className="py-2">
                      <RiskBadge level={a.risk_level} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass-card rounded-2xl p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Permission settings
          </h2>
          <p className="mt-2 text-xs text-zinc-600">Mock UI — resets on workflow version change.</p>
          <div className="mt-4 space-y-2">
            {(Object.keys(PERMISSION_LABELS) as PermissionLevel[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPermission(plugin.id, mode)}
                className={`block w-full rounded-lg border px-3 py-2 text-left text-sm ${
                  plugin.permission_level === mode
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-100"
                    : "border-white/10 text-zinc-400 hover:border-white/20"
                }`}
              >
                {PERMISSION_LABELS[mode]}
              </button>
            ))}
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={plugin.enabled}
              onChange={(e) => updatePlugin(plugin.id, { enabled: e.target.checked })}
            />
            Plugin enabled
          </label>
        </section>
      </div>

      <section className="mt-6 glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Risk analysis
        </h2>
        <p className="mt-3 text-sm text-zinc-400">
          Plugin ceiling: <RiskBadge level={plugin.risk_level} className="ml-2 inline-flex" />
        </p>
        <ul className="mt-3 list-inside list-disc text-sm text-zinc-500">
          <li>{plugin.write_actions.length} write action(s) — require permission gate in MVP</li>
          <li>Destructive actions disabled platform-wide in MVP</li>
          <li>
            {plugin.auth_method === "browser_session"
              ? "Browser session auth — OpenTabs adapter path (future)"
              : `Auth via ${plugin.auth_method}`}
          </li>
        </ul>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="glass-card rounded-2xl p-5">
          <h2 className="text-sm font-semibold uppercase text-zinc-400">Audit log</h2>
          {auditLogs.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-600">No audit entries for this plugin yet.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-xs">
              {auditLogs.map((log) => (
                <li key={log.id} className="rounded border border-white/5 px-2 py-1.5 font-mono text-zinc-500">
                  {log.action_name} · {log.status} · {log.dry_run ? "dry" : "live"}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="glass-card rounded-2xl p-5">
          <h2 className="text-sm font-semibold uppercase text-zinc-400">Example tool calls</h2>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-cyan-200/80">
            {JSON.stringify(
              {
                plugin: plugin.id,
                action: actions[0]?.name ?? "list",
                input: { mock: true, sandbox: true },
                dry_run: true,
              },
              null,
              2,
            )}
          </pre>
        </section>
      </div>

      <section className="mt-6 glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold uppercase text-zinc-400">
          Compatible marketplace stacks
        </h2>
        {stacks.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600">No stacks reference this plugin yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {stacks.map((s) => (
              <li key={s.id} className="rounded-lg border border-violet-500/20 px-3 py-2">
                <p className="font-medium text-zinc-200">{s.name}</p>
                <p className="text-xs text-zinc-500">
                  Success {(s.task_success_rate * 100).toFixed(0)}% · {s.action_sequence.join(" → ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </ToolArenaShell>
  );
}
