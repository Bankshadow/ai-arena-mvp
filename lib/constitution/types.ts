/** Agent Constitution — structured operating specification for AI agents. */

export type AgentType = "competitor" | "creator" | "judge" | "orchestrator";

export type ConstitutionVersionLabel = `${"v" | "V"}${number}.${number}` | string;

export type MarketplaceConstitutionItemType =
  | "agent_constitution"
  | "judge_constitution"
  | "challenge_creator_constitution"
  | "cost_policy"
  | "tool_policy"
  | "evaluation_rubric";

export type TournamentType = "standard" | "system_prompt_battle";

/** Full operating specification for one agent version. */
export type AgentConstitution = {
  id: string;
  constitutionId: string;
  agentName: string;
  agentType: AgentType;
  /** Tournament agent id, e.g. lean, premium, strategy */
  agentId: string;
  roleDefinition: string;
  primaryGoal: string;
  secondaryGoal: string;
  behaviorRules: string[];
  toolUsagePolicy: string;
  modelProviderPolicy: string;
  costPolicy: string;
  tokenPolicy: string;
  memoryPolicy: string;
  riskPolicy: string;
  refusalOrSkipRules: string[];
  outputFormatContract: string;
  selfReviewProtocol: string;
  evaluationPreference: string;
  marketplacePositioning: string;
  version: ConstitutionVersionLabel;
  constitutionScore: number;
  createdAt: string;
  updatedAt: string;
};

/** Parent record with version history. */
export type AgentConstitutionRecord = {
  id: string;
  agentId: string;
  agentName: string;
  agentType: AgentType;
  currentVersion: ConstitutionVersionLabel;
  versions: AgentConstitution[];
  createdAt: string;
  updatedAt: string;
};

export type DiffChangeType = "added" | "removed" | "modified";

export type ConstitutionDiffChange = {
  field: string;
  fieldLabel: string;
  changeType: DiffChangeType;
  before?: string;
  after?: string;
  expectedImpact: string;
  actualImpact?: string;
};

export type PromptDiff = {
  id: string;
  constitutionId: string;
  agentId: string;
  agentName: string;
  fromVersion: ConstitutionVersionLabel;
  toVersion: ConstitutionVersionLabel;
  changes: ConstitutionDiffChange[];
  summary: string;
  computedAt: string;
};

export type ConstitutionBattleStatus = "pending" | "running" | "complete";

export type ConstitutionBattle = {
  id: string;
  type: "system_prompt_battle";
  title: string;
  agentId: string;
  agentName: string;
  challengeTitle: string;
  challengeBrief: string;
  versionIds: string[];
  status: ConstitutionBattleStatus;
  createdAt: string;
  completedAt: string | null;
};

export type ConstitutionBattleResultEntry = {
  id: string;
  battleId: string;
  constitutionId: string;
  version: ConstitutionVersionLabel;
  versionId: string;
  agentName: string;
  totalScore: number;
  qualityScore: number;
  efficiencyScore: number;
  constitutionScore: number;
  tokensOut: number;
  costUsd: number;
  rank: number;
  promptStrategySummary: string;
};

export type ConstitutionBattleResult = {
  battle: ConstitutionBattle;
  entries: ConstitutionBattleResultEntry[];
  winnerVersionId: string;
  winnerVersion: ConstitutionVersionLabel;
  marketplaceCandidateIds: string[];
};

export type ConstitutionMarketplaceCandidate = {
  id: string;
  itemType: MarketplaceConstitutionItemType;
  title: string;
  agentId: string;
  agentName: string;
  constitutionId: string;
  version: ConstitutionVersionLabel;
  versionId: string;
  constitutionScore: number;
  tournamentScore: number;
  promptStrategySummary: string;
  suggestedPriceUsd: number;
  status: "seed" | "review" | "listed";
  createdAt: string;
};

/** Attached to each tournament run — which constitution versions were used. */
export type AgentConstitutionUsage = {
  agentId: string;
  agentName: string;
  constitutionId: string;
  versionId: string;
  version: ConstitutionVersionLabel;
  constitutionScore: number;
  promptStrategySummary: string;
};

export type TournamentConstitutionMeta = {
  tournamentType: TournamentType;
  usages: AgentConstitutionUsage[];
  winningConstitutionId: string | null;
  winningVersion: ConstitutionVersionLabel | null;
  winningVersionId: string | null;
  constitutionScores: Record<string, number>;
  promptStrategySummaries: Record<string, string>;
  lastDiffId: string | null;
  marketplaceCandidateIds: string[];
};

export type ConstitutionFormInput = Omit<
  AgentConstitution,
  "id" | "constitutionId" | "constitutionScore" | "createdAt" | "updatedAt"
>;

export const CONSTITUTION_FIELDS: {
  key: keyof AgentConstitution;
  label: string;
  multiline?: boolean;
  list?: boolean;
}[] = [
  { key: "roleDefinition", label: "Role definition", multiline: true },
  { key: "primaryGoal", label: "Primary goal", multiline: true },
  { key: "secondaryGoal", label: "Secondary goal", multiline: true },
  { key: "behaviorRules", label: "Behavior rules", list: true },
  { key: "toolUsagePolicy", label: "Tool usage policy", multiline: true },
  { key: "modelProviderPolicy", label: "Model & provider policy", multiline: true },
  { key: "costPolicy", label: "Cost policy", multiline: true },
  { key: "tokenPolicy", label: "Token policy", multiline: true },
  { key: "memoryPolicy", label: "Memory policy", multiline: true },
  { key: "riskPolicy", label: "Risk policy", multiline: true },
  { key: "refusalOrSkipRules", label: "Refusal / skip rules", list: true },
  { key: "outputFormatContract", label: "Output format contract", multiline: true },
  { key: "selfReviewProtocol", label: "Self-review protocol", multiline: true },
  { key: "evaluationPreference", label: "Evaluation preference", multiline: true },
  { key: "marketplacePositioning", label: "Marketplace positioning", multiline: true },
];
