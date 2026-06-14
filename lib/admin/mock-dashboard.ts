/** Mock admin queues — shown when Supabase/service role is unavailable. */

export type MockSubmission = {
  id: string;
  name: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  qualityScore: number | null;
  model: string;
  submittedAt: string;
};

export type MockTournamentRoundReview = {
  id: string;
  round: number;
  challengeTitle: string;
  winner: string;
  score: number;
  mode: string;
  savedAt: string;
};

export type MockMarketplaceCandidate = {
  id: string;
  name: string;
  type: string;
  arenaScore: number;
  sourceRound: number;
  status: "pending" | "approved";
};

export type MockConstitutionProposal = {
  id: string;
  agentName: string;
  fromVersion: string;
  toVersion: string;
  summary: string;
  status: "pending" | "approved";
  submittedAt: string;
};

export const MOCK_ADMIN_SUBMISSIONS: MockSubmission[] = [
  {
    id: "mock-sub-1",
    name: "Alex Chen",
    email: "alex@example.com",
    status: "pending",
    qualityScore: null,
    model: "claude-sonnet-4-6",
    submittedAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: "mock-sub-2",
    name: "Jordan Park",
    email: "jordan@example.com",
    status: "pending",
    qualityScore: null,
    model: "gpt-4o-mini",
    submittedAt: new Date(Date.now() - 7200_000).toISOString(),
  },
  {
    id: "mock-sub-3",
    name: "Sam Rivera",
    email: "sam@example.com",
    status: "approved",
    qualityScore: 86,
    model: "claude-3-5-haiku",
    submittedAt: new Date(Date.now() - 86400_000).toISOString(),
  },
];

export const MOCK_TOURNAMENT_REVIEWS: MockTournamentRoundReview[] = [
  {
    id: "sample-round-executive-7",
    round: 7,
    challengeTitle: "Q4 Board Risk Brief",
    winner: "Premium Agent",
    score: 89.2,
    mode: "groq_free",
    savedAt: new Date(Date.now() - 1800_000).toISOString(),
  },
  {
    id: "mock-tournament-round-6",
    round: 6,
    challengeTitle: "Churn Rescue Playbook",
    winner: "Lean Agent",
    score: 82.4,
    mode: "mock",
    savedAt: new Date(Date.now() - 86400_000 * 3).toISOString(),
  },
];

export const MOCK_MARKETPLACE_CANDIDATES: MockMarketplaceCandidate[] = [
  {
    id: "mpc-1",
    name: "Lean Executive Summary Stack",
    type: "workflow",
    arenaScore: 91,
    sourceRound: 7,
    status: "pending",
  },
  {
    id: "mpc-2",
    name: "Groq Cost Policy Pack",
    type: "constitution",
    arenaScore: 88,
    sourceRound: 7,
    status: "pending",
  },
  {
    id: "mpc-3",
    name: "RAG Citation Workflow",
    type: "workflow",
    arenaScore: 84,
    sourceRound: 6,
    status: "approved",
  },
];

export const MOCK_CONSTITUTION_PROPOSALS: MockConstitutionProposal[] = [
  {
    id: "cp-1",
    agentName: "Lean Agent",
    fromVersion: "v1.0",
    toVersion: "v1.1",
    summary: "Add pre-flight section checklist to reduce format penalties.",
    status: "pending",
    submittedAt: new Date(Date.now() - 43200_000).toISOString(),
  },
  {
    id: "cp-2",
    agentName: "Premium Agent",
    fromVersion: "v1.2",
    toVersion: "v2.0",
    summary: "Cap self-review loop at two passes for cost control.",
    status: "pending",
    submittedAt: new Date(Date.now() - 86400_000).toISOString(),
  },
];
