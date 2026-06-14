export type BattleListItemWithId = {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  mode: "live" | "demo";
  winnerAgentId: string | null;
  winnerTokens: number | null;
  passedCount: number;
  savedAt: string;
};
