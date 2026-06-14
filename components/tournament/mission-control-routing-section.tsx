"use client";

import { useTranslations } from "@/components/i18n/locale-provider";
import {
  translateProviderCardStatus,
  translateRiskLevel,
} from "@/lib/i18n/helpers";
import type { TournamentRoutingMeta } from "@/lib/tournament/routing/types";
import { RoutingDashboard } from "@/components/tournament/routing/routing-dashboard";

type ProviderCard = {
  id: string;
  label: string;
  status: "active" | "configurable" | "disabled" | "not_configured";
  message: string;
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
  premiumAvailable?: boolean;
};

export function MissionControlRoutingSection({
  routing,
  groqAvailable,
  premiumAvailable,
}: Props) {
  const t = useTranslations();
  const tr = t.tournament.routing;
  const guard = routing?.guard;

  const providers: ProviderCard[] = [
    {
      id: "mock",
      label: tr.providers.mock.label,
      status: "active",
      message: tr.providers.mock.message,
    },
    {
      id: "groq",
      label: tr.providers.groq.label,
      status: groqAvailable ? "configurable" : "configurable",
      message: groqAvailable ? tr.providers.groq.messageAvailable : tr.providers.groq.message,
    },
    {
      id: "claude",
      label: tr.providers.claude.label,
      status: premiumAvailable ? "configurable" : "disabled",
      message: premiumAvailable ? tr.providers.claude.messageAvailable : tr.providers.claude.message,
    },
    {
      id: "openrouter",
      label: tr.providers.openrouter.label,
      status: "not_configured",
      message: tr.providers.openrouter.message,
    },
  ];

  const estCostUsd =
    guard?.estimatedCostUsd ??
    (guard
      ? (guard.estimatedInputTokens + guard.estimatedOutputTokens) * 0.000002
      : 0);

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          {tr.providerStatus}
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {providers.map((p) => {
            const status =
              p.id === "groq" && groqAvailable ? ("configurable" as const) : p.status;
            return (
              <div key={p.id} className={`rounded-xl border p-4 ${STATUS_STYLE[status]}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{p.label}</span>
                  <span className="text-[10px] uppercase">
                    {translateProviderCardStatus(status, t)}
                  </span>
                </div>
                <p className="mt-2 text-xs opacity-80">{p.message}</p>
              </div>
            );
          })}
        </div>

        {guard && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <MiniStat label={tr.stats.estApiCalls} value={String(guard.apiCallCount)} />
            <MiniStat
              label={tr.stats.estTokens}
              value={`${(guard.estimatedInputTokens + guard.estimatedOutputTokens).toLocaleString()}`}
            />
            <MiniStat label={tr.stats.estCost} value={`$${estCostUsd.toFixed(3)}`} />
            <MiniStat
              label={tr.stats.savingsVsClaude}
              value={`$${(routing?.costSavedEstimateUsd ?? 0).toFixed(2)}`}
            />
            <MiniStat
              label={tr.stats.rateLimitRisk}
              value={translateRiskLevel(guard.riskLevel, t)}
              highlight={guard.riskLevel !== "low"}
            />
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
