"use client";

import type { ComponentFilters, ComponentSortKey, ComponentType } from "@/lib/marketplace/types";
import { COMPONENT_TYPE_LABELS } from "@/lib/marketplace/types";

type Props = {
  filters: ComponentFilters;
  sort: ComponentSortKey;
  onFiltersChange: (f: ComponentFilters) => void;
  onSortChange: (s: ComponentSortKey) => void;
};

export function ComponentFiltersBar({ filters, sort, onFiltersChange, onSortChange }: Props) {
  return (
    <div className="glass-card flex flex-wrap gap-3 rounded-2xl p-4">
      <input
        type="search"
        placeholder="Search components…"
        value={filters.search ?? ""}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
        className="min-w-[180px] flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
      />
      <select
        value={filters.type ?? ""}
        onChange={(e) =>
          onFiltersChange({
            ...filters,
            type: (e.target.value || undefined) as ComponentType | undefined,
          })
        }
        className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
      >
        <option value="">All types</option>
        {(Object.keys(COMPONENT_TYPE_LABELS) as ComponentType[]).map((t) => (
          <option key={t} value={t}>
            {COMPONENT_TYPE_LABELS[t]}
          </option>
        ))}
      </select>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as ComponentSortKey)}
        className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
      >
        <option value="arena_score">Arena Score</option>
        <option value="cost_efficiency">Cost efficiency</option>
        <option value="freshness">Freshness</option>
        <option value="popularity">Popularity</option>
        <option value="avg_score">Avg score</option>
      </select>
      <label className="flex items-center gap-2 text-sm text-zinc-400">
        <input
          type="checkbox"
          checked={filters.tournament_tested_only ?? false}
          onChange={(e) =>
            onFiltersChange({ ...filters, tournament_tested_only: e.target.checked || undefined })
          }
          className="rounded border-white/20"
        />
        Tournament-tested only
      </label>
    </div>
  );
}
