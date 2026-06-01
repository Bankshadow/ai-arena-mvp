import type { LocalSubmission } from "@/lib/client/submissions";

export const MOCK_LEADERBOARD: Omit<LocalSubmission, "id" | "email" | "createdAt" | "workflowNotes" | "promptUsed" | "role">[] = [
  {
    name: "TokenHunter",
    modelUsed: "gpt-4o-mini",
    estimatedCost: 0.08,
    outputResult: "",
    qualityScore: 94,
    costScore: 92,
    finalScore: 93.6,
  },
  {
    name: "AIWizard",
    modelUsed: "claude-3-5-haiku",
    estimatedCost: 0.12,
    outputResult: "",
    qualityScore: 92,
    costScore: 88,
    finalScore: 91.2,
  },
  {
    name: "PromptKing",
    modelUsed: "gpt-4o",
    estimatedCost: 0.17,
    outputResult: "",
    qualityScore: 89,
    costScore: 83,
    finalScore: 87.8,
  },
];

export type WorkflowCard = {
  rank: number;
  title: string;
  modelUsed: string;
  cost: string;
  qualityScore: number;
  strategySummary: string;
  steps: string[];
};

export const MOCK_WORKFLOWS: WorkflowCard[] = [
  {
    rank: 1,
    title: "Section-first pipeline",
    modelUsed: "gpt-4o-mini",
    cost: "$0.08",
    qualityScore: 94,
    strategySummary:
      "Extract key sections first, then summarize, run risk analysis, and apply final formatting — minimizes tokens on the full document.",
    steps: [
      "Extract key sections from PDF",
      "Summarize each section in parallel",
      "Risk analysis pass on consolidated notes",
      "Final formatting into executive template",
    ],
  },
  {
    rank: 2,
    title: "Compress-then-structure",
    modelUsed: "claude-3-5-haiku",
    cost: "$0.12",
    qualityScore: 92,
    strategySummary:
      "Aggressive input compression before a single structured generation call for all three output sections.",
    steps: [
      "Compress input to bullet outline",
      "Generate structured summary",
      "Validate risks against outline",
      "Polish recommendations",
    ],
  },
  {
    rank: 3,
    title: "Draft + refine",
    modelUsed: "gpt-4o",
    cost: "$0.17",
    qualityScore: 89,
    strategySummary:
      "Cheap model for draft, premium model only for final answer — trades two calls for better quality per dollar.",
    steps: [
      "Cheap model: rough draft",
      "Premium model: executive summary",
      "Premium model: risks + recommendations",
      "Merge and trim to budget",
    ],
  },
];
