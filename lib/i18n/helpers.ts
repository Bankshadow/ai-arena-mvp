import type { Dictionary } from "@/lib/i18n/types";

export function translateChallengeStatus(
  status: string,
  t: Dictionary
): string {
  if (status === "open") return t.challenge.statusOpen;
  if (status === "closed") return t.challenge.statusClosed;
  return t.challenge.statusBeta;
}

export function translateLandingStatus(
  status: string,
  t: Dictionary
): string {
  if (status === "open") return t.landing.status.open;
  if (status === "closed") return t.landing.status.closed;
  return t.landing.status.beta;
}

export function translateChallengeDetailLabel(label: string, t: Dictionary): string {
  const map: Record<string, string> = {
    Input: t.landing.challengeDetails.input,
    Goal: t.landing.challengeDetails.goal,
    "Cost limit": t.landing.challengeDetails.costLimit,
    Attempts: t.landing.challengeDetails.attempts,
    Scoring: t.landing.challengeDetails.scoring,
    Status: t.landing.challengeDetails.status,
  };
  return map[label] ?? label;
}

export function translateChallengeDetailValue(label: string, value: string, t: Dictionary): string {
  if (label === "Goal") return t.landing.challengeDetails.goalValue;
  if (label === "Scoring") return t.landing.challengeDetails.scoringValue;
  if (label === "Status") {
    if (value.includes("Open")) return t.landing.challengeDetails.statusOpen;
    if (value.includes("Closed")) return t.landing.challengeDetails.statusClosed;
    return t.landing.challengeDetails.statusBeta;
  }
  return value;
}

/** Server/waitlist API values stay in English. */
export const INTEREST_API_VALUES = {
  compete: "I want to compete",
  submitChallenge: "I want to submit a challenge",
  company: "I am interested for my company",
} as const;

export type InterestKey = keyof typeof INTEREST_API_VALUES;

export const INTEREST_KEYS: InterestKey[] = ["compete", "submitChallenge", "company"];
