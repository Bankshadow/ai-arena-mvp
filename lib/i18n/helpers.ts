import type { Dictionary } from "@/lib/i18n/types";
import type { TournamentRuntimeMode } from "@/lib/tournament/routing/types";
import type { TournamentViewMode } from "@/lib/tournament/view-mode-labels";
import type { Tournament } from "@/lib/tournament/types";

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

export function translateRuntimeMode(mode: TournamentRuntimeMode, t: Dictionary): string {
  return t.tournament.runtimeMode[mode];
}

export function translateRuntimeModeHint(mode: TournamentRuntimeMode, t: Dictionary): string {
  return t.tournament.runtimeMode.hints[mode];
}

export function translateTournamentPhase(phase: Tournament["phase"], t: Dictionary): string {
  return t.tournament.status.phases[phase];
}

export function translateViewModeStatus(mode: TournamentViewMode, t: Dictionary): string {
  return t.tournament.status.viewModes[mode];
}

export function translateViewModeRunsStat(mode: TournamentViewMode, t: Dictionary): string {
  return t.tournament.status.runsStat[mode];
}

export function translateViewModeCta(
  mode: TournamentViewMode,
  t: Dictionary,
): { runNow: string; replay: string; switchLive: string } {
  return t.tournament.status.cta[mode];
}

export function translateGuardAction(action: string, t: Dictionary): string {
  const key = action as keyof Dictionary["tournament"]["routing"]["guardActions"];
  return t.tournament.routing.guardActions[key] ?? action.replace(/_/g, " ");
}

export function translateRiskLevel(level: "low" | "medium" | "high", t: Dictionary): string {
  return t.tournament.routing.riskLevels[level];
}

export function translateFlowStepStatus(
  status: "complete" | "active" | "pending",
  t: Dictionary,
): string {
  return t.tournament.flowTimeline.stepStatus[status];
}

export function translateProviderCardStatus(
  status: "active" | "configurable" | "disabled" | "not_configured",
  t: Dictionary,
): string {
  return t.tournament.routing.providerStatusLabels[status];
}

export function fillTemplate(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}
