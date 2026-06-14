import type { MarketplaceCandidate } from "@/lib/tournament/types";

type Props = { candidates: MarketplaceCandidate[] };

export function MarketplaceSeedPanel({ candidates }: Props) {
  return (
    <section className="glass-card overflow-hidden rounded-2xl">
      <div className="border-b border-white/10 px-5 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          8 · Marketplace seed data
        </h3>
        <p className="text-xs text-zinc-500">Future workflow listings from tournament winners</p>
      </div>

      {candidates.length === 0 ? (
        <p className="p-8 text-center text-sm text-zinc-600">No seeds yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-white/5 text-left text-[10px] uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-2.5">Agent</th>
                <th className="px-4 py-2.5">Challenge</th>
                <th className="px-4 py-2.5 text-right">Mkt score</th>
                <th className="px-4 py-2.5 text-right">Price</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id} className="border-t border-white/5">
                  <td className="px-4 py-3 font-medium text-zinc-200">{c.agentName}</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{c.challengeTitle}</td>
                  <td className="px-4 py-3 text-right font-mono text-amber-300">
                    {c.marketplaceScore}/10
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-400">
                    ${c.suggestedPriceUsd.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function StatusPill({ status }: { status: MarketplaceCandidate["status"] }) {
  const styles = {
    seed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    review: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    listed: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}
