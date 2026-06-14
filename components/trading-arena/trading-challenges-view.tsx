"use client";

import { TradingArenaShell } from "@/components/trading-arena/trading-arena-shell";
import { TradingDisclaimerBanner } from "@/components/trading-arena/disclaimer-banner";
import { useTradingArena } from "@/components/trading-arena/trading-arena-provider";

export function TradingChallengesView() {
  const { data, selectChallenge } = useTradingArena();

  return (
    <TradingArenaShell title="Trading challenges" subtitle="Browse active and archived strategy challenges.">
      <TradingDisclaimerBanner compact />
      <div className="grid gap-4 sm:grid-cols-2">
        {data.challenges.map((c) => (
          <article key={c.id} className="glass-card rounded-2xl p-5">
            <p className="text-xs uppercase text-amber-400/80">{c.asset_class}</p>
            <h2 className="mt-2 font-semibold text-zinc-100">{c.title}</h2>
            <p className="mt-2 text-sm text-zinc-400">{c.brief}</p>
            <p className="mt-3 text-xs text-zinc-600">
              {c.universe.join(", ")} · {c.start_date} → {c.end_date}
            </p>
            <button
              type="button"
              onClick={() => selectChallenge(c.id)}
              className="mt-4 rounded-lg border border-amber-500/30 px-3 py-1.5 text-xs text-amber-200 hover:bg-amber-500/10"
            >
              Set as current challenge
            </button>
          </article>
        ))}
      </div>
    </TradingArenaShell>
  );
}
