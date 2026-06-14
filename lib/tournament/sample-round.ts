import {
  createInitialTournamentState,
  runTournamentLoop,
} from "@/lib/tournament/engine";
import {
  buildSavedTournamentRecord,
  toTournamentListItem,
} from "@/lib/tournament/saved-tournament";
import type { TournamentState } from "@/lib/tournament/types";

export const SAMPLE_TOURNAMENT_ROUND_ID = "sample-round-executive-7";

/** Completed mock tournament round for replay / sample mode. */
export function createSampleTournamentState(): TournamentState {
  const base = createInitialTournamentState();
  const result = runTournamentLoop(base, "full");
  return {
    tournament: { ...result.tournament, paused: true },
    leaderboard: result.leaderboard,
    history: result.history,
    marketplace: result.marketplace,
    routing: {
      runtimeMode: "groq_free",
      guard: null,
      routingTimeline: [
        {
          step: "challenge_generation",
          taskType: "challenge_generation",
          provider: "groq",
          model: "llama-3.1-8b-instant",
          timestamp: new Date().toISOString(),
        },
        {
          step: "competitor_run",
          taskType: "competitor_run",
          provider: "groq",
          model: "llama-3.1-8b-instant",
          timestamp: new Date().toISOString(),
        },
      ],
      providerUsage: [],
      costSavedEstimateUsd: 0.018,
      agentModels: {
        lean: "llama-3.1-8b-instant",
        premium: "llama-3.3-70b-versatile",
      },
    },
    constitution: result.constitution,
    memory: result.memory,
  };
}

export function getSampleTournamentRecord() {
  const state = createSampleTournamentState();
  const record = buildSavedTournamentRecord(state, "mock", SAMPLE_TOURNAMENT_ROUND_ID);
  return record;
}

export function getSampleTournamentListItem() {
  return toTournamentListItem(getSampleTournamentRecord());
}
