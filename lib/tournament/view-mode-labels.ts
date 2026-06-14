import type { TournamentState } from "@/lib/tournament/types";

export type TournamentViewMode = "live" | "replay" | "completed_sample" | "standby";

export const VIEW_MODE_STATUS_LABEL: Record<TournamentViewMode, string> = {
  live: "Live round",
  replay: "Replay",
  completed_sample: "Last completed round",
  standby: "Standby",
};

export const VIEW_MODE_RUNS_STAT: Record<TournamentViewMode, string> = {
  live: "Active runs",
  replay: "Completed runs",
  completed_sample: "Completed runs",
  standby: "Completed runs",
};

export const VIEW_MODE_BATTLE_TITLE: Record<TournamentViewMode, string> = {
  live: "Active battle",
  replay: "Replay agent runs",
  completed_sample: "Completed agent runs",
  standby: "Last completed agent runs",
};

export const VIEW_MODE_LEADERBOARD_TITLE: Record<TournamentViewMode, string> = {
  live: "Current Round Leaderboard",
  replay: "Replay Leaderboard",
  completed_sample: "Last Round Leaderboard",
  standby: "Overall Agent Leaderboard",
};

export const VIEW_MODE_CTA: Record<
  TournamentViewMode,
  { runNow: string; replay: string; switchLive: string }
> = {
  live: {
    runNow: "Run next round",
    replay: "Replay last round",
    switchLive: "Pause live loop",
  },
  replay: {
    runNow: "Run tournament now",
    replay: "Refresh replay",
    switchLive: "Exit replay",
  },
  completed_sample: {
    runNow: "Run tournament now",
    replay: "Replay last round",
    switchLive: "Switch to live mode",
  },
  standby: {
    runNow: "Run tournament now",
    replay: "Load sample round",
    switchLive: "Switch to live mode",
  },
};

export function isEmptyTournamentState(state: TournamentState): boolean {
  return (
    state.tournament.challengeIdeas.length === 0 &&
    state.tournament.activeRuns.length === 0 &&
    state.tournament.phase === "idle"
  );
}

export function getTournamentViewMode(
  state: TournamentState,
  options: { sampleMode: boolean; replayMode: boolean },
): TournamentViewMode {
  if (isEmptyTournamentState(state)) return "standby";
  if (options.replayMode) return "replay";
  if (options.sampleMode && state.tournament.phase === "complete") return "completed_sample";
  if (
    !options.sampleMode &&
    !state.tournament.paused &&
    state.tournament.phase !== "idle" &&
    state.tournament.phase !== "complete"
  ) {
    return "live";
  }
  if (state.tournament.phase === "complete") return "completed_sample";
  return "standby";
}

export function isCompletedViewMode(mode: TournamentViewMode): boolean {
  return mode === "completed_sample" || mode === "replay" || mode === "standby";
}
