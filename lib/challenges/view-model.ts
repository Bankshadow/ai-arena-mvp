import type { Challenge as DbChallenge } from "@/db/schema";
import { EXECUTIVE_SUMMARY_BATTLE, type Challenge as StaticChallenge } from "@/lib/data/challenges";

export type ChallengeView = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  rules: string[];
  costLimit: string;
  deadlineLabel: string;
  status: "beta" | "open" | "closed" | string;
  input: string;
  attempts: number;
  scoringFormula: StaticChallenge["scoringFormula"];
  prizePool: StaticChallenge["prizePool"];
  inputFileUrl: string | null;
  isOpen: boolean;
  costLimitUsd: number;
};

export function formatChallengeDeadline(date: Date): string {
  return (
    new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
    }).format(date) + " UTC"
  );
}

export function buildChallengeView(db: DbChallenge | null): ChallengeView {
  const meta = EXECUTIVE_SUMMARY_BATTLE;

  if (!db) {
    return {
      slug: meta.slug,
      name: meta.name,
      tagline: meta.tagline,
      description: meta.description,
      rules: meta.rules,
      costLimit: meta.costLimit,
      deadlineLabel: meta.deadlineLabel,
      status: meta.status,
      input: meta.input,
      attempts: meta.attempts,
      scoringFormula: meta.scoringFormula,
      prizePool: meta.prizePool,
      inputFileUrl: "/challenges/executive-summary-battle.pdf",
      isOpen: meta.status === "open",
      costLimitUsd: 1,
    };
  }

  const cost = parseFloat(db.costLimitUsd);

  return {
    slug: db.slug,
    name: db.name,
    tagline: db.tagline ?? meta.tagline,
    description: db.description,
    rules: db.rules,
    costLimit: `$${cost.toFixed(2)} USD per submission`,
    deadlineLabel: formatChallengeDeadline(db.deadlineAt),
    status: db.status,
    input: meta.input,
    attempts: db.maxAttempts,
    scoringFormula: meta.scoringFormula,
    prizePool: meta.prizePool,
    inputFileUrl: db.inputFileUrl,
    isOpen: db.status === "open",
    costLimitUsd: cost,
  };
}

export function buildChallengeDetailRows(view: ChallengeView) {
  return [
    { label: "Input", value: view.input },
    {
      label: "Goal",
      value: "Executive summary, key risks, and recommendations",
    },
    { label: "Cost limit", value: `$${view.costLimitUsd.toFixed(2)}` },
    { label: "Attempts", value: String(view.attempts) },
    {
      label: "Scoring",
      value: "80% Quality + 20% Cost Efficiency",
    },
    {
      label: "Status",
      value:
        view.status === "open"
          ? "Open for submissions"
          : view.status === "closed"
            ? "Closed"
            : "Beta opening soon",
    },
  ];
}

export function challengeStatusLabel(status: string): string {
  if (status === "open") return "Open now";
  if (status === "closed") return "Closed";
  return "Beta opening soon";
}
