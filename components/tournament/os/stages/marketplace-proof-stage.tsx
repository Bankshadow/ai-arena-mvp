"use client";

import Link from "next/link";
import { Layers } from "lucide-react";

import { MarketplaceSeedPanel } from "@/components/tournament/marketplace-seed-panel";
import { TournamentStageShell } from "@/components/tournament/os/tournament-stage-shell";
import { MarketplacePipeline } from "@/components/workflow/marketplace-pipeline";
import { useTranslations } from "@/components/i18n/locale-provider";
import { fillTemplate } from "@/lib/i18n/helpers";
import { enrichLegacyCandidates } from "@/lib/marketplace/candidate-detector";
import type { RoundWinner } from "@/lib/tournament/winner-narrative";
import type { TournamentState } from "@/lib/tournament/types";

type Props = {
  state: TournamentState;
  winner: RoundWinner | null;
  marketplaceCount: number;
};

export function MarketplaceProofStage({ state, winner, marketplaceCount }: Props) {
  const os = useTranslations().tournament.os;
  const candidates = enrichLegacyCandidates(state);
  const winnerCandidates = winner
    ? candidates.filter((c) => c.agent_name === winner.agentName).length
    : 0;

  return (
    <TournamentStageShell
      phase="marketplace-proof"
      action={
        <div className="flex gap-2">
          <Link
            href="/marketplace"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
          >
            {os.proof.browse}
          </Link>
          <Link
            href="/stack-builder"
            className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-200"
          >
            <Layers className="size-3.5" />
            {os.proof.addStack}
          </Link>
        </div>
      }
    >
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <p className="text-sm text-zinc-300">
          {winner
            ? fillTemplate(os.proof.summaryWithWinner, {
                count: String(marketplaceCount),
                winner: winner.agentName,
                winnerCount: String(winnerCandidates || Math.min(2, candidates.length)),
              })
            : fillTemplate(os.proof.summary, { count: String(marketplaceCount) })}
        </p>
      </div>

      <MarketplacePipeline activeStage={4} compact />

      <MarketplaceSeedPanel state={state} embedded />
    </TournamentStageShell>
  );
}
