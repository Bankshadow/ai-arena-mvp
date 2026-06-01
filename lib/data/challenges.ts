export type Challenge = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  rules: string[];
  costLimit: string;
  scoringFormula: {
    label: string;
    breakdown: { label: string; weight: string }[];
    summary: string;
  };
  prizePool: {
    total: string;
    distribution: { place: string; amount: string }[];
  };
  deadline: string;
  deadlineLabel: string;
  status: "beta" | "open" | "closed";
  input: string;
  attempts: number;
  participants: number;
};

export const EXECUTIVE_SUMMARY_BATTLE: Challenge = {
  slug: "executive-summary-battle",
  name: "Executive Summary Battle #1",
  tagline: "Summarize a 20-page PDF under $1 with maximum quality.",
  description:
    "You receive the same 20-page board report as every other competitor. Your job: produce a concise executive summary, surface the top strategic risks, and deliver actionable recommendations — all while staying under a strict $1.00 API spend cap. This is AI ARENA's inaugural efficiency benchmark: prove your workflow delivers board-ready output at the lowest cost.",
  rules: [
    "All competitors receive the identical 20-page PDF input file.",
    "You may use any LLM provider and workflow architecture (single prompt or multi-step pipeline).",
    "Total API cost per submission must not exceed $1.00 USD (measured from logged usage).",
    "You have 3 submission attempts. Only your highest-scoring attempt counts.",
    "Output must include three sections: Executive Summary, Key Risks, Recommendations.",
    "Submissions are evaluated against a hidden holdout rubric by the AI Judge.",
    "No manual editing of model output after generation — post-processing scripts allowed if cost is included.",
    "Sharing challenge inputs publicly before the deadline is prohibited.",
  ],
  costLimit: "$1.00 USD per submission",
  scoringFormula: {
    label: "Composite efficiency score",
    breakdown: [
      { label: "Output quality", weight: "80%" },
      { label: "Cost efficiency", weight: "20%" },
    ],
    summary:
      "Final Score = (Quality × 0.80) + (Cost Efficiency × 0.20). Quality is judged on accuracy, completeness, and clarity. Cost efficiency rewards lower spend — spending $0.08 beats $0.95 at equal quality.",
  },
  prizePool: {
    total: "$2,500",
    distribution: [
      { place: "1st", amount: "$1,000" },
      { place: "2nd", amount: "$600" },
      { place: "3rd", amount: "$350" },
      { place: "4th – 10th", amount: "$550 shared" },
    ],
  },
  deadline: "2026-07-15T23:59:59Z",
  deadlineLabel: "July 15, 2026 · 11:59 PM UTC",
  status: "beta",
  input: "20-page PDF (board report)",
  attempts: 3,
  participants: 847,
};

export function getChallengeBySlug(slug: string): Challenge | undefined {
  if (slug === EXECUTIVE_SUMMARY_BATTLE.slug) {
    return EXECUTIVE_SUMMARY_BATTLE;
  }
  return undefined;
}
