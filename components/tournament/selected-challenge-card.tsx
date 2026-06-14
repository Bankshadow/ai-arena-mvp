import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Challenge, ChallengeIdea } from "@/lib/tournament/types";
import { getCreator } from "@/lib/tournament/agents";
import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";

type Props = {
  challenge: Challenge | null;
  idea?: ChallengeIdea | null;
  isRoundWinner?: boolean;
};

export function SelectedChallengeCard({ challenge, idea, isRoundWinner = true }: Props) {
  if (!challenge) {
    return (
      <section className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          3 · Selected challenge
        </h3>
        <p className="mt-6 text-center text-sm text-zinc-600">
          Click a challenge idea on the left to preview details here.
        </p>
      </section>
    );
  }

  const creator = getCreator(challenge.selectedFrom);

  return (
    <section
      className={`glass-card overflow-hidden rounded-2xl border ${
        isRoundWinner ? "border-amber-500/25" : "border-cyan-500/25"
      }`}
    >
      <div
        className={`px-5 py-4 ${
          isRoundWinner
            ? "bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent"
            : "bg-gradient-to-r from-cyan-500/15 via-cyan-500/5 to-transparent"
        }`}
      >
        <p className={`text-xs ${isRoundWinner ? "text-amber-300/80" : "text-cyan-300/80"}`}>
          {isRoundWinner ? "★ Featured challenge" : "Preview · challenge idea"}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-white">{challenge.title}</h3>
        {challenge.category && (
          <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">{challenge.category}</p>
        )}
        <p className="mt-2 text-sm text-zinc-400">{challenge.brief}</p>
      </div>

      {challenge.selectedReason && isRoundWinner && idea && (
        <div className="border-b border-white/10 bg-black/20 px-5 py-3 space-y-2">
          <p className="text-[10px] uppercase text-zinc-500">Selected reason</p>
          <p className="text-sm text-zinc-300">{challenge.selectedReason}</p>
          <p className="text-xs text-zinc-500">
            Highest selection score among creator agents · novelty {idea.noveltyScore} · feasibility{" "}
            {idea.feasibilityScore} · marketplace potential {idea.marketplacePotential ?? "—"}
          </p>
        </div>
      )}

      {challenge.selectedReason && isRoundWinner && !idea && (
        <div className="border-b border-white/10 bg-black/20 px-5 py-3">
          <p className="text-[10px] uppercase text-zinc-500">Selected reason</p>
          <p className="mt-1 text-sm text-zinc-300">{challenge.selectedReason}</p>
        </div>
      )}

      {idea && (
        <div className="grid gap-3 border-b border-white/10 p-5 sm:grid-cols-3 text-sm">
          <Meta label="Selection score" value={String(idea.selectionScore)} />
          <Meta label="Novelty" value={String(idea.noveltyScore)} />
          <Meta label="Marketplace potential" value={String(idea.marketplacePotential ?? "—")} />
        </div>
      )}

      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 text-sm">
        <Meta label="Creator" value={creator.name} />
        <Meta label="Pass gate" value={`${challenge.passThreshold}/100`} />
        <Meta label="Cost limit" value={`$${challenge.costLimitUsd.toFixed(2)}`} />
        <Meta label="Time limit" value={`${challenge.timeLimitMinutes ?? 5} min`} />
        <Meta
          label="Expected output"
          value={challenge.expectedOutput ?? challenge.outputFormat.replace(/\n/g, " · ")}
        />
        <Meta
          label="Scoring rubric"
          value={challenge.scoringRubric ?? "80% quality + 20% cost"}
        />
      </div>

      <div className="border-t border-white/10 px-5 py-3">
        <Link
          href={`/challenge/${DEFAULT_CHALLENGE_SLUG}`}
          className="inline-flex items-center gap-1 text-xs text-emerald-300/90 hover:text-emerald-200"
        >
          View full challenge brief
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <details className="border-t border-white/10 px-5 py-3" open={!isRoundWinner}>
        <summary className="cursor-pointer text-xs text-zinc-400">Source & format</summary>
        <pre className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap text-xs text-zinc-500">
          {challenge.inputDoc}
        </pre>
        <pre className="mt-2 whitespace-pre-wrap text-xs text-violet-300/80">
          {challenge.outputFormat}
        </pre>
      </details>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-2">
      <p className="text-[10px] uppercase text-zinc-500">{label}</p>
      <p className="mt-0.5 text-sm leading-snug text-zinc-200">{value}</p>
    </div>
  );
}
