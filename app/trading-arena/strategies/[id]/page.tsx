"use client";

import Link from "next/link";
import { use } from "react";

import { TradingStrategyDetailView } from "@/components/trading-arena/trading-strategy-detail-view";
import { TradingArenaShell } from "@/components/trading-arena/trading-arena-shell";
import { useTradingArena } from "@/components/trading-arena/trading-arena-provider";
import type { TradingStrategy } from "@/lib/trading-arena/types";

export default function TradingStrategyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data } = useTradingArena();
  const strategy = data.strategies.find((s: TradingStrategy) => s.id === id);

  if (!strategy) {
    return (
      <TradingArenaShell title="Strategy not found" subtitle="">
        <p className="text-zinc-400">
          Run a Trading Arena round first, then open a strategy from the control room or leaderboard.
        </p>
        <Link href="/trading-arena" className="mt-4 inline-block text-amber-400 hover:underline">
          ← Trading Arena
        </Link>
      </TradingArenaShell>
    );
  }

  return <TradingStrategyDetailView strategy={strategy} />;
}
