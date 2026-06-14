export type ChallengeDifficulty = "easy" | "medium" | "hard";

/** AI-generated challenge for a 5-agent token-efficiency battle. */
export type GeneratedChallenge = {
  id: string;
  title: string;
  brief: string;
  inputDoc: string;
  outputFormat: string;
  rubricCriteria: string[];
  passThreshold: number;
  topic: string;
  difficulty: ChallengeDifficulty;
  createdAt: string;
};

export type GenerateChallengeInput = {
  topic?: string;
  difficulty?: ChallengeDifficulty;
};
