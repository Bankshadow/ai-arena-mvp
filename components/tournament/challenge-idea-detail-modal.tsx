"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

import { ScoreHelp } from "@/components/scoring/score-help";
import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";
import { buildChallengePreviewFromIdea } from "@/lib/tournament/challenge-idea-preview";
import type { ChallengeIdea } from "@/lib/tournament/types";

type Props = {
  idea: ChallengeIdea | null;
  selected?: boolean;
  onClose: () => void;
};

export function ChallengeIdeaDetailModal({ idea, selected, onClose }: Props) {
  useEffect(() => {
    if (!idea) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [idea, onClose]);

  if (!idea) return null;

  const preview = buildChallengePreviewFromIdea(idea);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="challenge-idea-detail-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close challenge detail"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-violet-500/10">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-white/10 bg-[#0a0a0a]/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-xs text-violet-300">{idea.creatorName}</p>
            <h2 id="challenge-idea-detail-title" className="mt-1 text-lg font-semibold text-white">
              {idea.title}
            </h2>
            {selected && (
              <span className="mt-2 inline-flex rounded-full border border-amber-500/50 bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-200">
                ★ Selected for this round
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <p className="text-sm leading-relaxed text-zinc-400">{idea.brief}</p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Meta label="Selection score" value={String(idea.selectionScore)} accent="amber" />
            <Meta label="Novelty" value={String(idea.noveltyScore)} />
            <Meta label="Feasibility" value={String(idea.feasibilityScore)} />
            <Meta label="Difficulty" value={idea.difficulty} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Meta label="Pass gate" value={`${preview.passThreshold}/100`} />
            <Meta label="Cost cap" value={`$${preview.costLimitUsd.toFixed(2)}`} />
            <Meta label="Topic" value={idea.topic} />
          </div>

          <ScoreHelp system="challenge" />

          <section className="rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Source document preview</p>
            <pre className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap text-xs text-zinc-500">
              {preview.inputDoc}
            </pre>
          </section>

          <section className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
            <p className="text-[10px] uppercase tracking-wider text-violet-300/70">Required output format</p>
            <pre className="mt-2 whitespace-pre-wrap text-xs text-violet-300/80">{preview.outputFormat}</pre>
          </section>

          <div className="flex flex-wrap gap-3 border-t border-white/10 pt-4">
            <Link
              href={`/challenge/${DEFAULT_CHALLENGE_SLUG}`}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
            >
              Open public challenge page
              <ArrowRight className="size-3.5" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-400 hover:bg-white/5 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "amber";
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-2">
      <p className="text-[10px] uppercase text-zinc-500">{label}</p>
      <p
        className={`font-mono text-sm capitalize ${accent === "amber" ? "text-amber-300" : "text-zinc-200"}`}
      >
        {value}
      </p>
    </div>
  );
}
