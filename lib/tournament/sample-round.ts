import {
  createMissionControlDemoState,
  enrichMissionControlDemo,
} from "@/lib/tournament/mission-control-demo";
import {
  buildSavedTournamentRecord,
  toTournamentListItem,
} from "@/lib/tournament/saved-tournament";
import type { TournamentState } from "@/lib/tournament/types";

export const SAMPLE_TOURNAMENT_ROUND_ID = "sample-round-executive-7";

/** Completed mock tournament round for replay / sample mode. */
export function createSampleTournamentState(): TournamentState {
  return createMissionControlDemoState();
}

export function getSampleTournamentRecord() {
  const state = createSampleTournamentState();
  const record = buildSavedTournamentRecord(state, "mock", SAMPLE_TOURNAMENT_ROUND_ID);
  return record;
}

export function getSampleTournamentListItem() {
  return toTournamentListItem(getSampleTournamentRecord());
}

/** Re-enrich any partial state so mission control panels stay populated. */
export function ensureMissionControlDemo(state: TournamentState): TournamentState {
  if (
    state.tournament.challengeIdeas.length === 0 &&
    state.tournament.activeRuns.length === 0
  ) {
    return createSampleTournamentState();
  }
  return enrichMissionControlDemo(state);
}
