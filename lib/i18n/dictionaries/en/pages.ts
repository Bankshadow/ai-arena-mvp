export const submit = {
  eyebrow: "Submit solution",
  challengeName: "Executive Summary Battle #1",
  descriptionConfigured:
    "Your submission is saved to Supabase and reviewed in the admin panel before appearing on the leaderboard.",
  descriptionNotConfigured:
    "Configure Supabase env vars to enable real submissions.",
  missingEnv:
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  successTitle: "Submission received",
  successBody:
    "Submission received. Your result will appear on the leaderboard after review.",
  submitButton: "Submit solution",
  submitting: "Submitting…",
  supabaseError: "Supabase is not configured. Add env vars to .env.local.",
  fields: {
    name: "Name",
    email: "Email",
    role: "Role",
    promptUsed: "Prompt used",
    modelUsed: "Model used",
    estimatedCost: "Estimated cost (USD)",
    outputResult: "Output result",
    workflowNotes: "Workflow notes (optional)",
  },
  placeholders: {
    name: "Your name",
    email: "you@company.com",
    promptUsed: "Your full prompt or workflow instructions...",
    modelUsed: "gpt-4o-mini",
    estimatedCost: "0.08",
    outputResult: "Executive Summary, Key Risks, Recommendations...",
    workflowNotes: "Briefly describe your pipeline steps...",
  },
  errors: {
    name: "Name is required.",
    email: "Valid email is required.",
    role: "Role is required.",
    promptUsed: "Prompt must be at least 10 characters.",
    modelUsed: "Model is required.",
    estimatedCost: "Enter a valid cost.",
    estimatedCostMin: "Cost must be 0 or greater.",
    outputResult: "Output must be at least 50 characters.",
  },
};

export const leaderboard = {
  eyebrow: "Rankings",
  title: "Leaderboard",
  subtitleUnified:
    "Humans · AI agents · battles · tournament — ranked by composite score",
  subtitleSupabase: "Approved submissions · Final Score = Quality × 0.8 + Cost Score × 0.2",
  subtitleMock: "Demo data — configure Supabase for live rankings",
  subtitleEmpty: "Final Score = Quality × 0.8 + Cost Score × 0.2",
  sourcesLabel: "Sources",
  enterArena: "Enter Arena",
  empty: "No reviewed submissions yet.",
  emptyFallback: "No entries yet. Submit your solution to appear on the board.",
  submitSolution: "Submit solution",
};

export const admin = {
  eyebrow: "Admin",
  title: "Submission review",
  subtitle: "Challenge #1 — manual quality review and scoring",
  warning:
    "Live approve/reject uses /api/admin/* with HTTP Basic Auth in production (page stays public; demo queues always visible).",
  serviceRoleMissing: "Add SUPABASE_SERVICE_ROLE_KEY to enable approve/reject actions.",
  notConfigured: "Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
  supabaseError: "Supabase is not configured.",
  qualityError: "Quality score must be between 0 and 100.",
  empty: "No submissions in this filter.",
  refresh: "Refresh",
  envChecking: "Checking admin environment…",
  envCheckingDetail: "Demo dashboard is shown until Supabase service role is confirmed.",
  envLiveTitle: "Live admin connected",
  envLiveDetail:
    "Submission review uses the service role. In production, your browser may prompt for Basic Auth on admin API calls.",
  envDemoTitle: "Demo mode — live review unavailable",
  envDemoDetail:
    "Configure Supabase public keys + SUPABASE_SERVICE_ROLE_KEY to enable approve/reject. Demo queues below stay available.",
  adminAuthMissingTitle: "Admin API credentials not set on server",
  adminAuthMissingDetail:
    "Set ADMIN_USERNAME and ADMIN_PASSWORD in production so /api/admin/* can authenticate approve/reject calls.",
  authFailedTitle: "Admin authentication required",
  authFailedDetail:
    "Enter the ADMIN_USERNAME / ADMIN_PASSWORD when your browser prompts, then refresh this page.",
  filters: {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    all: "All",
  },
  fields: {
    promptUsed: "Prompt used",
    outputResult: "Output result",
    workflowNotes: "Workflow notes",
    model: "Model",
    role: "Role",
    submitted: "Submitted",
    qualityScore: "Quality score (0–100)",
    adminNotes: "Admin notes",
    costScoreAuto: "Cost score (auto)",
    finalScoreAuto: "Final score (auto)",
  },
  approve: "Approve",
  reject: "Reject",
};

export const challenge = {
  badge: "Challenge #001",
  liveStats: "Live stats from database",
  costLimit: "Cost limit",
  attempts: "Attempts",
  scoring: "Scoring",
  deadline: "Deadline",
  submissions: "Submissions",
  players: "Players",
  scored: "Scored",
  description: "Description",
  downloadPdf: "Download challenge input (PDF)",
  inputOutput: "Input & output",
  inputLabel: "Input:",
  outputRequirements: "Output requirements:",
  rules: "Rules",
  scoringTitle: "Scoring",
  quality: "Quality",
  costEfficiency: "Cost efficiency",
  readyTitle: "Ready to compete?",
  closedHint:
    "Submissions open when status is Open now. Contact the team to open the challenge.",
  submitEntry: "Submit entry",
  joinWaitlist: "Join waitlist",
  submitSolution: "Submit Solution",
  viewLeaderboard: "View Leaderboard",
  workflowLibrary: "Workflow Library",
  statusOpen: "Open now",
  statusClosed: "Closed",
  statusBeta: "Beta opening soon",
  outputs: ["Executive Summary", "Key Risks", "Recommendations"],
  scoringFormat: (q: number, c: number) => `${q}% Q + ${c}% Cost`,
};

export const workflows = {
  eyebrow: "Workflow library",
  title: "Top workflows",
  description:
    "Winning strategies from Executive Summary Battle #1 — study how leaders balanced quality and token spend.",
  liveNote: "Live top workflows from scored submissions",
  mockNote: "Demo workflows — approve submissions in admin to populate live cards",
  rank: (n: number) => `Rank #${n}`,
  workflowSteps: "Workflow steps",
  viewLeaderboard: "View full leaderboard",
  submitWorkflow: "Submit your workflow",
};
