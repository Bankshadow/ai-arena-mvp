"use client";

import Link from "next/link";
import { Layers, ShoppingBag, Sparkles } from "lucide-react";

import { ComponentCard } from "@/components/marketplace/component-card";
import { ComponentTypeBadge } from "@/components/marketplace/component-type-badge";
import { MarketplaceSemanticSearch } from "@/components/vector/marketplace-semantic-search";
import { useWorkflowStack } from "@/components/marketplace/stack-provider";
import { Nav } from "@/components/Nav";
import {
  COMPONENT_CATEGORIES,
  getFeaturedComponents,
  getMockComponentCatalog,
  getTrendingComponents,
} from "@/lib/marketplace/mock-catalog";
import type { ComponentType } from "@/lib/marketplace/types";

const FEATURED_TYPES: ComponentType[] = [
  "agent_constitution",
  "workflow_template",
  "model_router",
  "setup_pack",
];

export function MarketplaceHubView() {
  const { count } = useWorkflowStack();
  const featured = getFeaturedComponents(4);
  const trending = getTrendingComponents(6);
  const total = getMockComponentCatalog().length;
  const tested = getMockComponentCatalog().filter((c) => c.tournament_tested).length;

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(167,139,250,0.14),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400/80">
          Tournament-tested marketplace
        </p>
        <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
          <ShoppingBag className="size-8 text-emerald-400" />
          Install proven AI workflow components
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Browse tournament-tested agents, rubrics, routers, and setup packs — then compose a stack
          and export to Cursor or Claude Code. Inspired by component catalogs like{" "}
          <a
            href="https://aitmpl.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          >
            aitmpl.com
          </a>
          , with benchmark proof from AI ARENA tournaments.
        </p>

        <div className="mt-8">
          <MarketplaceSemanticSearch />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/components"
            className="rounded-xl border border-violet-500/40 bg-violet-500/15 px-5 py-2.5 text-sm font-medium text-violet-100 hover:bg-violet-500/25"
          >
            Browse all components
          </Link>
          <Link
            href="/stack-builder"
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-5 py-2.5 text-sm text-cyan-200 hover:bg-cyan-500/20"
          >
            <Layers className="size-4" />
            Stack Builder {count > 0 && `(${count})`}
          </Link>
          <Link
            href="/tournament"
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-zinc-400 hover:text-white"
          >
            Watch tournaments →
          </Link>
        </div>

        <p className="mt-6 font-mono text-xs text-zinc-600">
          {total} components · {tested} tournament-tested
        </p>

        <section className="mt-10">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
            <Sparkles className="size-4 text-amber-400" /> Featured tournament winners
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((c) => (
              <ComponentCard key={c.id} component={c} compact />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Browse by type
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {FEATURED_TYPES.map((t) => (
              <Link
                key={t}
                href={`/components?type=${t}`}
                className="transition hover:opacity-80"
              >
                <ComponentTypeBadge type={t} />
              </Link>
            ))}
            <Link
              href="/components"
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-500 hover:text-zinc-300"
            >
              View all types →
            </Link>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Trending</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trending.map((c) => (
              <ComponentCard key={c.id} component={c} />
            ))}
          </div>
        </section>

        <section className="mt-12 glass-card rounded-2xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Categories
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {COMPONENT_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/components?category=${cat}`}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm capitalize text-zinc-400 hover:border-violet-500/30 hover:text-violet-200"
              >
                {cat.replace(/-/g, " ")}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
