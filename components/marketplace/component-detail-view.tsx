"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AddToStackButton } from "@/components/marketplace/add-to-stack-button";
import { ArenaScoreBadge } from "@/components/marketplace/arena-score-badge";
import { ComponentProofPanel } from "@/components/marketplace/component-proof-panel";
import { ComponentTypeBadge } from "@/components/marketplace/component-type-badge";
import { TournamentTestedBadge } from "@/components/marketplace/tournament-tested-badge";
import { Nav } from "@/components/Nav";
import type { MarketplaceComponent } from "@/lib/marketplace/types";

type Props = { component: MarketplaceComponent };

export function ComponentDetailView({ component }: Props) {
  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.1),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6">
        <Link
          href="/components"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300"
        >
          <ArrowLeft className="size-4" /> All components
        </Link>

        <header className="mt-6">
          <div className="flex flex-wrap gap-2">
            <ComponentTypeBadge type={component.type} />
            {component.tournament_tested && <TournamentTestedBadge />}
            <span className="rounded-full border border-white/10 px-2 py-1 font-mono text-xs text-zinc-500">
              {component.version}
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-semibold">{component.title}</h1>
          <p className="mt-3 text-zinc-400">{component.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <ArenaScoreBadge score={component.arena_score} />
            <AddToStackButton component={component} />
            <span className="font-mono text-sm text-emerald-400">
              ${component.suggested_price_usd.toFixed(2)} suggested
            </span>
          </div>
        </header>

        <div className="mt-8 space-y-6">
          <ComponentProofPanel component={component} />

          <section className="glass-card rounded-2xl p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Payload preview
            </h2>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-white/5 bg-black/40 p-4 text-xs text-zinc-400">
              {component.payload_preview}
            </pre>
          </section>

          <section className="glass-card rounded-2xl p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Install notes
            </h2>
            <p className="mt-2 text-sm text-zinc-400">{component.install_notes}</p>
            <h3 className="mt-4 text-xs uppercase text-zinc-500">Usage examples</h3>
            <ul className="mt-2 list-inside list-disc text-sm text-zinc-400">
              {component.usage_examples.map((ex) => (
                <li key={ex}>{ex}</li>
              ))}
            </ul>
          </section>

          <section className="glass-card rounded-2xl p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Compatibility
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Providers: {component.compatible_providers.join(", ")} · IDEs:{" "}
              {component.compatible_ides.join(", ")}
            </p>
            {component.source_tournament_id && (
              <Link href="/tournament" className="mt-3 inline-block text-sm text-cyan-400 hover:underline">
                View source tournament →
              </Link>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
