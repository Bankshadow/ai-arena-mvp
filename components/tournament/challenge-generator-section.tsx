"use client";

import { useState } from "react";

import { ChallengeGeneratorPanel } from "@/components/tournament/challenge-generator-panel";
import { SelectedChallengeCard } from "@/components/tournament/selected-challenge-card";
import { buildChallengePreviewFromIdea } from "@/lib/tournament/challenge-idea-preview";
import type { Challenge, ChallengeIdea } from "@/lib/tournament/types";

type Props = {
  ideas: ChallengeIdea[];
  selectedChallenge: Challenge | null;
  roundSelectedIdeaId?: string | null;
};

function resolveRoundSelectedId(ideas: ChallengeIdea[], explicit?: string | null) {
  if (explicit) return explicit;
  if (ideas.length === 0) return null;
  return ideas.reduce((best, idea) =>
    !best || idea.selectionScore > best.selectionScore ? idea : best,
  ).id;
}

export function ChallengeGeneratorSection({
  ideas,
  selectedChallenge,
  roundSelectedIdeaId,
}: Props) {
  const roundSelectedId = resolveRoundSelectedId(ideas, roundSelectedIdeaId);
  const [previewIdeaId, setPreviewIdeaId] = useState<string | null>(null);

  const activePreviewId = previewIdeaId ?? roundSelectedId;
  const previewIdea =
    ideas.find((idea) => idea.id === activePreviewId) ??
    (roundSelectedId ? ideas.find((idea) => idea.id === roundSelectedId) : undefined);

  const displayChallenge = previewIdea
    ? buildChallengePreviewFromIdea(previewIdea)
    : selectedChallenge;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChallengeGeneratorPanel
        ideas={ideas}
        roundSelectedId={roundSelectedId}
        previewId={activePreviewId}
        onPreview={setPreviewIdeaId}
      />
      <SelectedChallengeCard
        challenge={displayChallenge}
        idea={previewIdea ?? null}
        isRoundWinner={Boolean(previewIdea && previewIdea.id === roundSelectedId)}
      />
    </div>
  );
}
