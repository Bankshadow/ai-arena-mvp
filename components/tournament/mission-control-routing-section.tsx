"use client";

import type { TournamentRoutingMeta } from "@/lib/tournament/routing/types";
import { RoutingDashboard } from "@/components/tournament/routing/routing-dashboard";

type ProviderCard = {
  id: string;
  label: string;
  status: "active" | "configurable" | "disabled" | "not_configured";
  message: string;
};

const DEMO_PROVIDERS: ProviderCard[] = [
  {
    id: "mock",
    label: "Mock Provider",
    status: "active",
    message: "Active — default demo runtime for mission control",
  },
  {
    id: "groq",
    label: "Groq",
    status: "configurable",
    message: "Configurable via Admin → Tournament engine settings",
  },
  {
    id: "claude",
    label: "Claude / GPT",
    status: "disabled",
    message: "Disabled for mock mode — optional in hybrid runtime",
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    status: "not_configured",
    message: "Not configured",
  },
];

const STATUS_LABELS: Record<ProviderCard["status"], string> = {
  active: "Active",
  configurable: "Configurable",
  disabled: "Disabled",
  not_configured: "Not configured",
};

const STATUS_STYLE: Record<ProviderCard["status"], string> = {
  active: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300",
  configurable: "border-cyan-500/30 bg-cyan-500/5 text-cyan-300",
  disabled: "border-zinc-700 bg-zinc-900/40 text-zinc-500",
  not_configured: "border-white/10 bg-black/20 text-zinc-500",
};

type Props = {
  routing: TournamentRoutingMeta | undefined;
  groqAvailable?: boolean;
};

export function MissionControlRoutingSection({ routing, groqAvailable }: Props) {
  const guard = routing?.guard;

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Provider status
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {DEMO_PROVIDERS.map((p) => {
            const status =
              p.id === "groq" && groqAvailable ? ("configurable" as const) : p.status;
            return (
              <div key={p.id} className={`rounded-xl border p-4 ${STATUS_STYLE[status]}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{p.label}</span>
                  <span className="text-[10px] uppercase">{STATUS_LABELS[status]}</span>
                </div>
                <p className="mt-2 text-xs opacity-80">{p.message}</p>
              </div>
            );
          })}
        </div>

        {guard && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <MiniStat label="Est. API calls" value={String(guard.apiCallCount)} />
            <MiniStat
              label="Est. tokens"
              value={`${(guard.estimatedInputTokens + guard.estimatedOutputTokens).toLocaleString()}`}
            />
            <MiniStat label="Est. cost" value={`$${((guard.estimatedInputTokens + guard.estimatedOutputTokens) * 0.000002).toFixed(3)}`} />
            <MiniStat
              label="Savings vs all-Claude"
              value={`$${(routing?.costSavedEstimateUsd ?? 0).toFixed(2)}`}
            />
            <MiniStat label="Rate limit risk" value={guard.riskLevel} highlight={guard.riskLevel !== "low"} />
          </div>
        )}
      </section>

      <RoutingDashboard routing={routing} />
    </div>
  );
}

function MiniStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <p className="text-[10px] uppercase text-zinc-500">{label}</p>
      <p className={`mt-1 font-mono text-sm ${highlight ? "text-amber-300" : "text-zinc-200"}`}>
        {value}
      </p>
    </div>
  );
}
