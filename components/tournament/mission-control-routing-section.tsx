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
  /** Sidebar / ops rail — force single-column compact layout */
  narrow?: boolean;
};

export function MissionControlRoutingSection({
  routing,
  groqAvailable,
  premiumAvailable,
  narrow,
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
    <div className={`space-y-4 ${narrow ? "min-w-0" : "space-y-6"}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-400/70">
        Provider &amp; routing
      </p>
      <section className={`rounded-xl border border-white/10 bg-black/20 ${narrow ? "p-3" : "glass-card rounded-2xl p-5"}`}>
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          {tr.providerStatus}
        </h3>
        <div className={`mt-3 grid gap-2 ${narrow ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-4"}`}>
          {providers.map((p) => {
            const status =
              p.id === "groq" && groqAvailable ? ("configurable" as const) : p.status;
            return (
              <div key={p.id} className={`min-w-0 rounded-lg border p-3 ${STATUS_STYLE[status]}`}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium leading-tight">{p.label}</span>
                  <span className="shrink-0 text-[9px] uppercase">
                    {translateProviderCardStatus(status, t)}
                  </span>
                </div>
                <p className="mt-1.5 text-[10px] leading-snug opacity-80">{p.message}</p>
              </div>
            );
          })}
        </div>

        {guard && (
          <div className={`mt-3 grid gap-2 ${narrow ? "grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-5"}`}>
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

      <RoutingDashboard routing={routing} narrow={narrow} />
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
    <div className="min-w-0 rounded-lg border border-white/10 bg-black/20 p-2">
      <p className="truncate text-[9px] uppercase text-zinc-500">{label}</p>
      <p className={`mt-0.5 truncate font-mono text-xs ${highlight ? "text-amber-300" : "text-zinc-200"}`}>
        {value}
      </p>
    </div>
  );
}
