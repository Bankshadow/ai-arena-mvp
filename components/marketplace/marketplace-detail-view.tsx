"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Copy, ShoppingBag } from "lucide-react";

import { Nav } from "@/components/Nav";
import type { MarketplaceListingRow } from "@/lib/supabase/types";

type Props = { slug: string };

export function MarketplaceDetailView({ slug }: Props) {
  const [listing, setListing] = useState<MarketplaceListingRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/marketplace/${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: MarketplaceListingRow | null) => setListing(data))
      .finally(() => setLoading(false));
  }, [slug]);

  async function copyPrompt() {
    if (!listing?.prompt_template) return;
    await navigator.clipboard.writeText(listing.prompt_template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <Shell>
        <p className="text-sm text-zinc-500">Loading…</p>
      </Shell>
    );
  }

  if (!listing) {
    return (
      <Shell>
        <p className="text-sm text-zinc-500">Listing not found.</p>
        <Link href="/marketplace" className="mt-4 inline-block text-cyan-400 hover:underline">
          ← Back to marketplace
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <Link href="/marketplace" className="text-sm text-cyan-400 hover:underline">
        ← Marketplace
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">{listing.title}</h1>
      <p className="mt-2 text-zinc-400">{listing.challenge_title}</p>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
        <Stat label="Agent" value={listing.agent_name} />
        <Stat label="Score" value={`${listing.marketplace_score}/10`} mono />
        <Stat label="Price" value={`$${Number(listing.suggested_price_usd).toFixed(2)}`} mono accent />
        <Stat label="Status" value={listing.status} />
      </dl>

      <section className="mt-8 glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Workflow steps</h2>
        <ol className="mt-3 space-y-2">
          {listing.workflow_steps.map((step, i) => (
            <li key={step} className="flex gap-2 text-sm text-zinc-300">
              <span className="font-mono text-xs text-violet-400">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      {listing.prompt_template && (
        <section className="mt-6 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Prompt template
            </h2>
            <button
              type="button"
              onClick={copyPrompt}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
            >
              <Copy className="size-3.5" />
              {copied ? "Copied" : "Clone"}
            </button>
          </div>
          <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-4 text-xs text-zinc-300">
            {listing.prompt_template}
          </pre>
        </section>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/workflows"
          className="rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-2.5 text-sm text-violet-200"
        >
          Browse workflow library
        </Link>
        <Link
          href="/arena"
          className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-sm text-cyan-200"
        >
          Test in Arena
        </Link>
      </div>
    </Shell>
  );
}

function Stat({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="glass-card rounded-xl p-3">
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd
        className={`mt-1 capitalize ${mono ? "font-mono" : ""} ${accent ? "text-emerald-400" : "text-zinc-200"}`}
      >
        {value}
      </dd>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(167,139,250,0.12),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />
      <main className="relative mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400/80">
          <ShoppingBag className="mr-1 inline size-3.5" />
          MVP19 · Listing
        </p>
        {children}
      </main>
    </div>
  );
}
