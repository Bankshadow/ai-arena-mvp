"use client";

import { useState } from "react";
import { Eye } from "lucide-react";

import { ChallengeIdeaDetailModal } from "@/components/tournament/challenge-idea-detail-modal";
import type { ChallengeIdea } from "@/lib/tournament/types";

type Props = { ideas: ChallengeIdea[]; selectedId?: string | null };

export function ChallengeGeneratorPanel({ ideas, selectedId }: Props) {
  const [detailIdea, setDetailIdea] = useState<ChallengeIdea | null>(null);

  const resolvedSelectedId =
    selectedId ??
    (ideas.length > 0
      ? ideas.reduce((best, idea) =>
          !best || idea.selectionScore > best.selectionScore ? idea : best,
        ).id
      : null);

  return (
    <>
      <section className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          2 · Challenge generator
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          Strategy, Technical, and Growth agents propose ideas each round.
        </p>

        {ideas.length === 0 ? (
          <p className="mt-6 text-center text-sm text-zinc-600">No ideas yet — run a tournament round.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {ideas.map((idea) => {
              const selected = idea.id === resolvedSelectedId;
              return (
                <div
                  key={idea.id}
                  className={`rounded-xl border p-3 transition ${
                    selected
                      ? "border-amber-500/40 bg-gradient-to-r from-amber-500/10 to-transparent"
                      : "border-white/10 bg-black/20"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-violet-300">{idea.creatorName}</p>
                      <p className="font-medium text-zinc-100">{idea.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">{idea.brief}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg text-amber-300">{idea.selectionScore}</p>
                      <p className="text-[10px] uppercase text-zinc-500">select score</p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                    <Badge label={idea.difficulty} />
                    <Badge label={`novelty ${idea.noveltyScore}`} />
                    <Badge label={`feasibility ${idea.feasibilityScore}`} />
                    {selected && (
                      <span className="rounded-full border border-amber-500/50 bg-amber-500/20 px-2 py-0.5 text-amber-200">
                        ★ Selected
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setDetailIdea(idea)}
                      className="ml-auto inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-medium text-cyan-300 transition hover:bg-cyan-500/20"
                    >
                      <Eye className="size-3" />
                      View detail
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <ChallengeIdeaDetailModal
        idea={detailIdea}
        selected={detailIdea?.id === resolvedSelectedId}
        onClose={() => setDetailIdea(null)}
      />
    </>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 capitalize text-zinc-400">
      {label}
    </span>
  );
}
