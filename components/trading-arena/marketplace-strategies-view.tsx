"use client";

import Link from "next/link";

import { TradingDisclaimerBanner } from "@/components/trading-arena/disclaimer-banner";
import { useTradingArena } from "@/components/trading-arena/trading-arena-provider";
import { Nav } from "@/components/Nav";
import type { StrategyMarketplaceCandidate } from "@/lib/trading-arena/types";

export function MarketplaceStrategiesView() {
  const { data } = useTradingArena();
  const candidates: StrategyMarketplaceCandidate[] = data.marketplace_candidates;

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,197,94,0.08),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-25" />
      <Nav />
      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-wider text-emerald-400/80">
          Strategy marketplace
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Tournament-tested trading strategies</h1>
        <p className="mt-2 max-w-2xl text-zinc-400">
          Listings backed by simulated backtest evidence from Trading Strategy Arena rounds.
        </p>

        <div className="mt-6">
          <TradingDisclaimerBanner />
        </div>

        {candidates.length === 0 ? (
          <p className="mt-12 text-center text-zinc-600">
            No strategy candidates yet.{" "}
            <Link href="/trading-arena" className="text-amber-400 hover:underline">
              Run Trading Arena
            </Link>
          </p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {candidates.map((c) => (
              <article
                key={c.id}
                id={c.listing_slug}
                className="glass-card rounded-2xl border border-emerald-500/15 p-5"
              >
                <p className="text-xs uppercase text-emerald-400/80">{c.status}</p>
                <h2 className="mt-2 text-lg font-semibold">{c.title}</h2>
                <p className="mt-2 text-sm text-zinc-400">{c.backtest_evidence_summary}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <span>
                    Arena score{" "}
                    <span className="font-mono text-amber-300">{c.arena_score.toFixed(1)}</span>
                  </span>
                  <span>
                    Sharpe <span className="font-mono">{c.sharpe.toFixed(2)}</span>
                  </span>
                  <span>
                    Max DD{" "}
                    <span className="font-mono">{(c.max_drawdown * 100).toFixed(1)}%</span>
                  </span>
                </div>
                <Link
                  href={`/trading-arena/strategies/${c.strategy_id}`}
                  className="mt-4 inline-block text-sm text-emerald-400 hover:underline"
                >
                  View strategy detail →
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
