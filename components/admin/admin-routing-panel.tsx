"use client";

import { useEffect, useState } from "react";

import { ProviderStatusCards } from "@/components/tournament/routing/provider-status-cards";
import { RoutingDashboard } from "@/components/tournament/routing/routing-dashboard";
import { listLocalTournamentRounds } from "@/lib/tournament/local-storage";
import { createSampleTournamentState } from "@/lib/tournament/sample-round";
import type {
  GuardAssessment,
  ProviderStatus,
  TournamentRoutingMeta,
} from "@/lib/tournament/routing/types";

type StatusResponse = {
  providers?: ProviderStatus[];
  groqRateLimit?: {
    requestsToday: number;
    tokensToday: number;
    requestsPerDayLimit: number | null;
  };
  guardPreview?: GuardAssessment;
};

function resolveRouting(guardPreview?: GuardAssessment): TournamentRoutingMeta {
  const local = listLocalTournamentRounds()[0];
  const base = local?.state.routing ?? createSampleTournamentState().routing;

  if (!base) {
    return {
      runtimeMode: "groq_free",
      guard: guardPreview ?? null,
      routingTimeline: [],
      providerUsage: [],
      costSavedEstimateUsd: 0,
      agentModels: {},
    };
  }

  return {
    ...base,
    guard: base.guard ?? guardPreview ?? null,
  };
}

export function AdminRoutingPanel() {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [groqRateLimit, setGroqRateLimit] = useState<StatusResponse["groqRateLimit"]>();
  const [routing, setRouting] = useState<TournamentRoutingMeta | undefined>();

  useEffect(() => {
    fetch("/api/tournament/status")
      .then((r) => r.json())
      .then((data: StatusResponse) => {
        setProviders(data.providers ?? []);
        setGroqRateLimit(data.groqRateLimit);
        setRouting(resolveRouting(data.guardPreview));
      })
      .catch(() => {
        setRouting(resolveRouting());
      });
  }, []);

  return (
    <section className="mt-8 space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Provider & routing</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Live provider health, rate-limit guard, model routing timeline, and usage logs for the
          tournament engine.
        </p>
      </div>

      <ProviderStatusCards providers={providers} groqRateLimit={groqRateLimit} />

      {routing && <RoutingDashboard routing={routing} />}
    </section>
  );
}
