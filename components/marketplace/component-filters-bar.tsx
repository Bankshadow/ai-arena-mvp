"use client";

import type { ComponentFilters, ComponentSortKey, ComponentType } from "@/lib/marketplace/types";
import { COMPONENT_TYPE_LABELS } from "@/lib/marketplace/types";
import { useTranslations } from "@/components/i18n/locale-provider";

type Props = {
  filters: ComponentFilters;
  sort: ComponentSortKey;
  onFiltersChange: (f: ComponentFilters) => void;
  onSortChange: (s: ComponentSortKey) => void;
};

export function ComponentFiltersBar({ filters, sort, onFiltersChange, onSortChange }: Props) {
  const f = useTranslations().marketplace.filters;

  return (
    <div className="glass-card flex flex-wrap gap-3 rounded-2xl p-4">
      <input
        type="search"
        placeholder={f.searchPlaceholder}
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
        <option value="">{f.allTypes}</option>
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
        {(Object.keys(f.sort) as ComponentSortKey[]).map((key) => (
          <option key={key} value={key}>
            {f.sort[key]}
          </option>
        ))}
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
        {f.tournamentTestedOnly}
      </label>
    </div>
  );
}
