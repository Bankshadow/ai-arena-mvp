"use client";

import {
  Brain,
  Package,
  Swords,
  Trophy,
  TrendingDown,
} from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { MOCK_PROOF_METRICS } from "@/lib/workflow/mock-proof-metrics";

const METRIC_CONFIG = [
  { key: "tournamentRounds" as const, icon: Trophy, accent: "text-violet-300", format: (v: number) => String(v) },
  { key: "agentBattles" as const, icon: Swords, accent: "text-cyan-300", format: (v: number) => v.toLocaleString() },
  { key: "marketplaceCandidates" as const, icon: Package, accent: "text-emerald-300", format: (v: number) => String(v) },
  { key: "componentsPublished" as const, icon: Package, accent: "text-amber-300", format: (v: number) => String(v) },
  { key: "avgCostSavedUsd" as const, icon: TrendingDown, accent: "text-emerald-400", format: (v: number) => `$${v.toFixed(2)}` },
  { key: "memoryLessons" as const, icon: Brain, accent: "text-cyan-400", format: (v: number) => v.toLocaleString() },
];

const LABEL_KEYS = {
  tournamentRounds: "tournamentsRun",
  agentBattles: "agentBattles",
  marketplaceCandidates: "candidatesCreated",
  componentsPublished: "componentsPublished",
  avgCostSavedUsd: "avgCostSaved",
  memoryLessons: "memoryLessons",
} as const;

type Props = { compact?: boolean };

export function ProofStatsCards({ compact }: Props) {
  const stats = useTranslations().workflow.proofStats;

  return (
    <div className={`grid gap-3 ${compact ? "sm:grid-cols-3 lg:grid-cols-6" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"}`}>
      {METRIC_CONFIG.map(({ key, icon: Icon, accent, format }) => (
        <div
          key={key}
          className="glass-card rounded-xl border border-white/10 p-4"
        >
          <div className="flex items-center gap-2">
            <Icon className={`size-4 ${accent}`} />
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">{stats[LABEL_KEYS[key]]}</p>
          </div>
          <p className={`mt-2 font-mono text-2xl font-semibold ${accent}`}>
            {format(MOCK_PROOF_METRICS[key])}
          </p>
        </div>
      ))}
    </div>
  );
}

export function ProofStatsBanner() {
  return (
    <section className="glass-card rounded-2xl border border-emerald-500/15 p-5">
      <p className="font-mono text-xs uppercase tracking-wider text-emerald-400/80">
        Platform proof · mock demo metrics
      </p>
      <div className="mt-4">
        <ProofStatsCards compact />
      </div>
    </section>
  );
}
