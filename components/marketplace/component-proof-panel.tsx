import { ArenaScoreBadge } from "@/components/marketplace/arena-score-badge";
import { TournamentTestedBadge } from "@/components/marketplace/tournament-tested-badge";
import type { MarketplaceComponent } from "@/lib/marketplace/types";

type Props = { component: MarketplaceComponent };

export function ComponentProofPanel({ component }: Props) {
  const p = component.proof;
  const s = component.arena_score;

  return (
    <section className="glass-card rounded-2xl border border-emerald-500/20 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-emerald-400/80">
            Tournament performance proof
          </p>
          {component.tournament_tested && (
            <div className="mt-2">
              <TournamentTestedBadge />
            </div>
          )}
        </div>
        <ArenaScoreBadge score={s} />
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Win rate" value={`${(p.win_rate * 100).toFixed(0)}%`} />
        <Stat label="Avg score" value={`${p.avg_score.toFixed(0)}/100`} />
        <Stat label="Avg cost" value={`$${p.avg_cost_usd.toFixed(4)}`} />
        <Stat label="Avg tokens" value={p.avg_tokens.toLocaleString()} />
        <Stat label="Tournament runs" value={String(p.tournament_runs)} />
        <Stat label="Best category" value={p.best_category} />
        <Stat label="Worst category" value={p.worst_category} />
        <Stat label="Last run" value={new Date(p.last_tournament_at).toLocaleDateString()} />
      </dl>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase text-zinc-500">Arena Score breakdown</p>
          <ul className="mt-2 space-y-1 text-xs text-zinc-400">
            <li>Battle {s.battle} · Cost {s.cost_efficiency} · Reliable {s.reliability}</li>
            <li>Reusable {s.reusability} · Enterprise {s.enterprise_readiness}</li>
            <li>Popular {s.popularity} · Fresh {s.freshness} · Compatible {s.compatibility}</li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase text-zinc-500">Recommended use cases</p>
          <ul className="mt-2 list-inside list-disc text-sm text-zinc-400">
            {p.recommended_use_cases.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </div>
      </div>

      {p.benchmark_history.length > 0 && (
        <div className="mt-6">
          <p className="text-xs uppercase text-zinc-500">Benchmark history</p>
          <div className="mt-2 flex h-16 items-end gap-1">
            {p.benchmark_history.map((b) => (
              <div
                key={b.round}
                className="flex-1 rounded-t bg-gradient-to-t from-violet-600/40 to-cyan-500/40"
                style={{ height: `${Math.max(20, b.score)}%` }}
                title={`Round ${b.round}: ${b.score}`}
              />
            ))}
          </div>
          <p className="mt-1 text-[10px] text-zinc-600">Score by tournament round (mock)</p>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
      <dt className="text-[10px] uppercase text-zinc-600">{label}</dt>
      <dd className="mt-1 font-mono text-sm text-zinc-200">{value}</dd>
    </div>
  );
}
