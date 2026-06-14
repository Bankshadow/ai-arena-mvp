"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Layers } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { ComponentProofCard } from "@/components/marketplace/component-proof-card";
import { ComponentFiltersBar } from "@/components/marketplace/component-filters-bar";
import { MarketplaceSemanticSearch } from "@/components/vector/marketplace-semantic-search";
import { useWorkflowStack } from "@/components/marketplace/stack-provider";
import { Nav } from "@/components/Nav";
import { fillTemplate } from "@/lib/i18n/helpers";
import { filterComponents } from "@/lib/marketplace/mock-catalog";
import type { ComponentFilters, ComponentSortKey, ComponentType } from "@/lib/marketplace/types";

export function ComponentLibraryView() {
  const t = useTranslations();
  const lib = t.marketplace.library;
  const searchParams = useSearchParams();
  const { count } = useWorkflowStack();

  const initialFilters: ComponentFilters = useMemo(
    () => ({
      type: (searchParams.get("type") as ComponentType) || undefined,
      category: searchParams.get("category") || undefined,
      tournament_tested_only: searchParams.get("tested") === "1",
    }),
    [searchParams],
  );

  const [filters, setFilters] = useState<ComponentFilters>(initialFilters);
  const [sort, setSort] = useState<ComponentSortKey>("arena_score");

  const components = useMemo(() => filterComponents(filters, sort), [filters, sort]);

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.08),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400/80">
              {lib.eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{lib.title}</h1>
            <p className="mt-2 max-w-2xl text-zinc-500">{lib.description}</p>
            <p className="mt-1 text-sm text-zinc-600">
              {fillTemplate(lib.matchCount, { count: String(components.length) })}
            </p>
          </div>
          <Link
            href="/stack-builder"
            className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-200"
          >
            <Layers className="size-4" />
            {fillTemplate(lib.stackLink, { count: String(count) })}
          </Link>
        </div>

        <div className="mt-6">
          <MarketplaceSemanticSearch />
        </div>

        <div className="mt-6">
          <ComponentFiltersBar
            filters={filters}
            sort={sort}
            onFiltersChange={setFilters}
            onSortChange={setSort}
          />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {components.map((c) => (
            <ComponentProofCard key={c.id} component={c} />
          ))}
        </div>

        {components.length === 0 && (
          <p className="mt-12 text-center text-zinc-600">{lib.empty}</p>
        )}
      </main>
    </div>
  );
}
