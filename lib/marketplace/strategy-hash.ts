import { createHash } from "crypto";

import type { AgentRun, Evaluation } from "@/lib/tournament/types";
import type { TournamentState } from "@/lib/tournament/types";

/** Stable fingerprint for dedup — constitution + routing + prompt strategy. */
export function buildStrategyHash(
  state: TournamentState,
  winner: Evaluation,
  run?: AgentRun,
): string {
  const parts = [
    winner.agentId,
    winner.constitutionVersion ?? run?.constitutionVersion ?? "default",
    run?.constitutionVersionId ?? "",
    state.routing?.runtimeMode ?? "mock",
    run?.promptStrategySummary ?? "",
    state.constitution?.winningVersionId ?? "",
    run?.modelUsed ?? "",
  ];
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
}

export function normalizeDedupSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}
