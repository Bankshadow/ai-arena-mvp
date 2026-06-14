import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Challenge } from "@/lib/tournament/types";
import { getCreator } from "@/lib/tournament/agents";
import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";

type Props = { challenge: Challenge | null };

export function SelectedChallengeCard({ challenge }: Props) {
  if (!challenge) {
    return (
      <section className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          3 · Selected challenge
        </h3>
        <p className="mt-6 text-center text-sm text-zinc-600">Waiting for challenge selection…</p>
      </section>
    );
  }

  const creator = getCreator(challenge.selectedFrom);

  return (
    <section className="glass-card overflow-hidden rounded-2xl border border-amber-500/25">
      <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent px-5 py-4">
        <p className="text-xs text-amber-300/80">★ Featured challenge</p>
        <h3 className="mt-1 text-lg font-semibold text-white">{challenge.title}</h3>
        <p className="mt-1 text-sm text-zinc-400">{challenge.brief}</p>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-3 text-sm">
        <Meta label="Creator" value={creator.name} />
        <Meta label="Pass gate" value={`${challenge.passThreshold}/100`} />
        <Meta label="Cost cap" value={`$${challenge.costLimitUsd.toFixed(2)}`} />
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
      <details className="border-t border-white/10 px-5 py-3">
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
      <p className="font-mono text-sm text-zinc-200">{value}</p>
    </div>
  );
}
