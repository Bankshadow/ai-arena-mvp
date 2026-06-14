"use client";

import { ChallengeGeneratorSection } from "@/components/tournament/challenge-generator-section";
import { TournamentStageShell } from "@/components/tournament/os/tournament-stage-shell";
import type { Challenge, ChallengeIdea } from "@/lib/tournament/types";

type Props = {
  ideas: ChallengeIdea[];
  selectedChallenge: Challenge | null;
  roundSelectedIdeaId?: string | null;
};

export function ChallengeStage({ ideas, selectedChallenge, roundSelectedIdeaId }: Props) {
  return (
    <TournamentStageShell phase="challenge">
      <ChallengeGeneratorSection
        ideas={ideas}
        selectedChallenge={selectedChallenge}
        roundSelectedIdeaId={roundSelectedIdeaId}
      />
    </TournamentStageShell>
  );
}
