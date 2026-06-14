"use client";

import Link from "next/link";

import { TradingArenaShell } from "@/components/trading-arena/trading-arena-shell";
import { TradingDisclaimerBanner } from "@/components/trading-arena/disclaimer-banner";
import { useTradingArena } from "@/components/trading-arena/trading-arena-provider";

export function TradingLeaderboardView() {
  const { data } = useTradingArena();
  const ranked = [...data.scores].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));

  return (
    <TradingArenaShell title="Strategy leaderboard" subtitle="Ranked by total arena score (simulated backtests).">
      <TradingDisclaimerBanner compact />
      {ranked.length === 0 ? (
        <p className="text-zinc-600">No scores yet — run a Trading Arena round.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-zinc-500">
                <th className="pb-2 pr-4">Rank</th>
                <th className="pb-2 pr-4">Strategy</th>
                <th className="pb-2 pr-4">Agent</th>
                <th className="pb-2 pr-4">Total</th>
                <th className="pb-2 pr-4">Sharpe</th>
                <th className="pb-2 pr-4">Max DD</th>
                <th className="pb-2">Link</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((s) => {
                const m = data.metrics.find((x) => x.strategy_id === s.strategy_id);
                const strat = data.strategies.find((x) => x.id === s.strategy_id);
                return (
                  <tr key={s.id} className="border-b border-white/5">
                    <td className="py-3 pr-4 font-mono text-amber-400">#{s.rank}</td>
                    <td className="py-3 pr-4 text-zinc-200">{strat?.spec.title.slice(0, 40) ?? s.strategy_id}</td>
                    <td className="py-3 pr-4">{s.agent_name}</td>
                    <td className="py-3 pr-4 font-mono text-emerald-300">{s.breakdown.total.toFixed(1)}</td>
                    <td className="py-3 pr-4 font-mono">{m?.sharpe.toFixed(2) ?? "—"}</td>
                    <td className="py-3 pr-4 font-mono">{m ? `${(m.max_drawdown * 100).toFixed(1)}%` : "—"}</td>
                    <td className="py-3">
                      <Link href={`/trading-arena/strategies/${s.strategy_id}`} className="text-amber-400 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </TradingArenaShell>
  );
}
