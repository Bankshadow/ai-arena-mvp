"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";

import { Nav } from "@/components/Nav";
import type { MarketplaceListingRow } from "@/lib/supabase/types";

export function MarketplaceListView() {
  const [listings, setListings] = useState<MarketplaceListingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/marketplace")
      .then((r) => r.json())
      .then((d: { listings?: MarketplaceListingRow[] }) => setListings(d.listings ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(167,139,250,0.12),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400/80">
          MVP19 · Marketplace
        </p>
        <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold">
          <ShoppingBag className="size-8 text-emerald-400" />
          Workflow marketplace
        </h1>
        <p className="mt-2 text-zinc-400">
          Tournament winners promoted to reusable workflow listings — review, clone, and deploy.
        </p>

        <div className="mt-8 glass-card overflow-hidden rounded-2xl">
          {loading ? (
            <p className="p-8 text-center text-sm text-zinc-500">Loading listings…</p>
          ) : listings.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              <p className="text-sm">No listings yet.</p>
              <Link href="/tournament" className="mt-3 inline-block text-cyan-400 hover:underline">
                Run tournament to seed marketplace →
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3 text-right">Score</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((row) => (
                  <tr key={row.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <Link href={`/marketplace/${row.slug}`} className="font-medium text-zinc-200 hover:text-cyan-300">
                        {row.title}
                      </Link>
                      <p className="text-xs text-zinc-500">{row.challenge_title}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{row.agent_name}</td>
                    <td className="px-4 py-3 text-right font-mono text-amber-300">
                      {row.marketplace_score}/10
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400">
                      ${Number(row.suggested_price_usd).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 capitalize text-zinc-400">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
