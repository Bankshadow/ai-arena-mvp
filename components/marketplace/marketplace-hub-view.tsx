"use client";

import Link from "next/link";
import { Layers, ShoppingBag } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { ComponentProofCard } from "@/components/marketplace/component-proof-card";
import { MarketplaceSemanticSearch } from "@/components/vector/marketplace-semantic-search";
import { useWorkflowStack } from "@/components/marketplace/stack-provider";
import { Nav } from "@/components/Nav";
import { fillTemplate } from "@/lib/i18n/helpers";
import {
  getBestJudgeRubrics,
  getFeaturedProofComponents,
  getHighestQualityAgents,
  getLowestCostWinners,
  getModelRoutingPolicies,
  getRecentlyTestedComponents,
  getTopBattleTestedWorkflows,
} from "@/lib/marketplace/catalog-sections";
import { getMockComponentCatalog } from "@/lib/marketplace/mock-catalog";

function ProofSection({
  title,
  href,
  viewAllLabel,
  components,
}: {
  title: string;
  href?: string;
  viewAllLabel: string;
  components: ReturnType<typeof getMockComponentCatalog>;
}) {
  if (components.length === 0) return null;
  return (
    <section className="mt-12">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">{title}</h2>
        {href && (
          <Link href={href} className="text-xs text-cyan-400 hover:underline">
            {viewAllLabel}
          </Link>
        )}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {components.map((c) => (
          <ComponentProofCard key={c.id} component={c} compact />
        ))}
      </div>
    </section>
  );
}

export function MarketplaceHubView() {
  const t = useTranslations();
  const m = t.marketplace.hub;
  const { count } = useWorkflowStack();
  const total = getMockComponentCatalog().length;
  const tested = getMockComponentCatalog().filter((c) => c.tournament_tested).length;
  const featured = getFeaturedProofComponents();

  const flowSteps = [
    { label: m.flowSteps.tournament, href: "/tournament" },
    { label: m.flowSteps.proof, href: "/components" },
    { label: m.flowSteps.component, href: "/components" },
    { label: m.flowSteps.stack, href: "/stack-builder" },
    { label: m.flowSteps.export, href: "/stack-builder" },
  ];

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(167,139,250,0.14),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400/80">{m.eyebrow}</p>
        <h1 className="mt-3 flex items-center gap-3 text-3xl font-semibold leading-tight sm:text-4xl">
          <ShoppingBag className="size-8 shrink-0 text-emerald-400" />
          {m.title}
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-zinc-400">{m.description}</p>

        <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-[11px] text-zinc-500">
          {flowSteps.map((step, i, arr) => (
            <span key={step.label} className="flex items-center gap-2">
              <Link
                href={step.href}
                className="rounded-md border border-white/10 px-2 py-1 hover:border-cyan-500/40 hover:text-cyan-300"
              >
                {step.label}
              </Link>
              {i < arr.length - 1 && <span className="text-zinc-700">→</span>}
            </span>
          ))}
        </div>

        <div className="mt-8">
          <MarketplaceSemanticSearch />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/components"
            className="rounded-xl border border-violet-500/40 bg-violet-500/15 px-5 py-2.5 text-sm font-medium text-violet-100 hover:bg-violet-500/25"
          >
            {m.browseAll}
          </Link>
          <Link
            href="/stack-builder"
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-5 py-2.5 text-sm text-cyan-200 hover:bg-cyan-500/20"
          >
            <Layers className="size-4" />
            {m.stackBuilder} {count > 0 && `(${count})`}
          </Link>
          <Link
            href="/tournament"
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-zinc-400 hover:text-white"
          >
            {m.watchTournaments}
          </Link>
        </div>

        <p className="mt-6 font-mono text-xs text-zinc-600">
          {fillTemplate(m.stats, { total: String(total), tested: String(tested) })}
        </p>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-400/90">
            {m.featured}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <ComponentProofCard key={c.id} component={c} />
            ))}
          </div>
        </section>

        <ProofSection
          title={m.sections.topWorkflows}
          href="/components?type=workflow_template"
          viewAllLabel={m.viewAll}
          components={getTopBattleTestedWorkflows(4)}
        />
        <ProofSection
          title={m.sections.lowestCost}
          href="/components?sort=cost"
          viewAllLabel={m.viewAll}
          components={getLowestCostWinners(4)}
        />
        <ProofSection
          title={m.sections.highestQuality}
          href="/components?type=agent_constitution"
          viewAllLabel={m.viewAll}
          components={getHighestQualityAgents(4)}
        />
        <ProofSection
          title={m.sections.bestRubrics}
          href="/components?type=judge_rubric"
          viewAllLabel={m.viewAll}
          components={getBestJudgeRubrics(4)}
        />
        <ProofSection
          title={m.sections.routingPolicies}
          href="/components?type=model_router"
          viewAllLabel={m.viewAll}
          components={getModelRoutingPolicies(4)}
        />
        <ProofSection
          title={m.sections.recentlyTested}
          href="/components?tested=1"
          viewAllLabel={m.viewAll}
          components={getRecentlyTestedComponents(6)}
        />
      </main>
    </div>
  );
}
