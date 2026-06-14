"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { PermissionBadge } from "@/components/tool-arena/permission-badge";
import { RiskBadge } from "@/components/tool-arena/risk-badge";
import { ToolArenaShell } from "@/components/tool-arena/tool-arena-shell";
import { useToolArena } from "@/components/tool-arena/tool-arena-provider";
import {
  CATEGORY_LABELS,
  type PermissionLevel,
  type RiskLevel,
  type ToolCategory,
} from "@/lib/tool-arena/types";

export function ToolRegistryView() {
  const { data } = useToolArena();
  const [category, setCategory] = useState<ToolCategory | "all">("all");
  const [risk, setRisk] = useState<RiskLevel | "all">("all");
  const [permission, setPermission] = useState<PermissionLevel | "all">("all");
  const [enabledOnly, setEnabledOnly] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return data.plugins.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (risk !== "all" && p.risk_level !== risk) return false;
      if (permission !== "all" && p.permission_level !== permission) return false;
      if (enabledOnly && !p.enabled) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [data.plugins, category, risk, permission, enabledOnly, search]);

  return (
    <ToolArenaShell
      title="Tool registry"
      subtitle="Plugins and integrations for Tool Arena — default permission off. Mock-only in MVP."
    >
      <div className="glass-card rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="search"
            placeholder="Search plugins…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-[200px] flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
          />
          <FilterSelect
            label="Category"
            value={category}
            onChange={(v) => setCategory(v as ToolCategory | "all")}
            options={[
              ["all", "All"],
              ...Object.entries(CATEGORY_LABELS).map(([k, v]) => [k, v]),
            ]}
          />
          <FilterSelect
            label="Risk"
            value={risk}
            onChange={(v) => setRisk(v as RiskLevel | "all")}
            options={[
              ["all", "All"],
              ["low", "Low"],
              ["medium", "Medium"],
              ["high", "High"],
            ]}
          />
          <FilterSelect
            label="Permission"
            value={permission}
            onChange={(v) => setPermission(v as PermissionLevel | "all")}
            options={[
              ["all", "All"],
              ["off", "Off"],
              ["ask", "Ask"],
              ["auto_read", "Auto read"],
              ["auto_safe", "Auto safe"],
              ["auto_all", "Auto all"],
            ]}
          />
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={enabledOnly}
              onChange={(e) => setEnabledOnly(e.target.checked)}
            />
            Enabled only
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-zinc-600">No plugins match filters.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((plugin) => (
            <article
              key={plugin.id}
              className="glass-card flex flex-col rounded-2xl border border-white/5 p-5 transition hover:border-cyan-500/25"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-lg font-semibold text-zinc-100">{plugin.name}</h2>
                {!plugin.enabled && (
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] uppercase text-zinc-500">
                    Disabled
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-zinc-600">{CATEGORY_LABELS[plugin.category]}</p>
              <p className="mt-3 flex-1 text-sm text-zinc-400">{plugin.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <PermissionBadge level={plugin.permission_level} />
                <RiskBadge level={plugin.risk_level} />
              </div>
              <p className="mt-3 text-xs text-zinc-600">
                {plugin.read_actions.length} read · {plugin.write_actions.length} write ·{" "}
                {plugin.audit_count} audits
              </p>
              <Link
                href={`/tools/${plugin.id}`}
                className="mt-4 block rounded-lg border border-cyan-500/30 bg-cyan-500/10 py-2 text-center text-sm text-cyan-200 hover:bg-cyan-500/15"
              >
                View detail
              </Link>
            </article>
          ))}
        </div>
      )}
    </ToolArenaShell>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[][];
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-300"
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}
