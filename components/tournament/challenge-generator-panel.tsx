"use client";

import { Eye } from "lucide-react";

import type { ChallengeIdea } from "@/lib/tournament/types";

type Props = {
  ideas: ChallengeIdea[];
  roundSelectedId?: string | null;
  previewId?: string | null;
  onPreview?: (ideaId: string) => void;
};

export function ChallengeGeneratorPanel({
  ideas,
  roundSelectedId,
  previewId,
  onPreview,
}: Props) {
  return (
    <section className="glass-card rounded-2xl p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
        2 · Challenge generator
      </h3>
      <p className="mt-1 text-xs text-zinc-500">
        Strategy, Technical, and Growth agents propose ideas each round. Click an idea to preview
        on the right.
      </p>

      {ideas.length === 0 ? (
        <p className="mt-6 text-center text-sm text-zinc-600">No ideas yet — run a tournament round.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {ideas.map((idea) => {
            const roundSelected = idea.id === roundSelectedId;
            const previewing = idea.id === previewId;
            return (
              <button
                key={idea.id}
                type="button"
                onClick={() => onPreview?.(idea.id)}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  previewing
                    ? "border-cyan-500/50 bg-gradient-to-r from-cyan-500/10 to-transparent ring-1 ring-cyan-500/20"
                    : roundSelected
                      ? "border-amber-500/40 bg-gradient-to-r from-amber-500/10 to-transparent"
                      : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-black/30"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-violet-300">{idea.creatorName}</p>
                    <p className="font-medium text-zinc-100">{idea.title}</p>
                    {idea.category && (
                      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-500">
                        {idea.category}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-zinc-500">{idea.brief}</p>
                    {idea.whyItMatters && (
                      <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                        {idea.whyItMatters}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg text-amber-300">{idea.selectionScore}</p>
                    <p className="text-[10px] uppercase text-zinc-500">select score</p>
                    {idea.marketplacePotential != null && (
                      <p className="mt-1 font-mono text-xs text-emerald-400/90">
                        MKT {idea.marketplacePotential}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                  <Badge label={idea.difficulty} />
                  <Badge label={`novelty ${idea.noveltyScore}`} />
                  <Badge label={`feasibility ${idea.feasibilityScore}`} />
                  {roundSelected && (
                    <span className="rounded-full border border-amber-500/50 bg-amber-500/20 px-2 py-0.5 text-amber-200">
                      ★ Selected
                    </span>
                  )}
                  {previewing && (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 font-medium text-cyan-300">
                      <Eye className="size-3" />
                      Viewing
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 capitalize text-zinc-400">
      {label}
    </span>
  );
}
