import type { TournamentMode } from "@/lib/tournament/engine";
import { newId } from "@/lib/tournament/engine-mock";
import type { TournamentState } from "@/lib/tournament/types";

export type SavedTournamentRecord = {
  id: string;
  tournamentId: string;
  round: number;
  mode: TournamentMode;
  phase: string;
  winnerAgentId: string | null;
  winnerScore: number | null;
  savedAt: string;
  state: TournamentState;
};

export type TournamentListItem = {
  id: string;
  tournamentId: string;
  round: number;
  mode: TournamentMode;
  challengeTitle: string | null;
  winnerAgentId: string | null;
  winnerAgentName: string | null;
  winnerScore: number | null;
  savedAt: string;
};

export function winnerFromState(state: TournamentState) {
  const top = [...state.tournament.evaluations].sort((a, b) => b.totalScore - a.totalScore)[0];
  return top
    ? { agentId: top.agentId, agentName: top.agentName, score: top.totalScore }
    : { agentId: null, agentName: null, score: null };
}

export function buildSavedTournamentRecord(
  state: TournamentState,
  mode: TournamentMode,
  id?: string,
): SavedTournamentRecord {
  const winner = winnerFromState(state);
  return {
    id: id ?? newId(),
    tournamentId: state.tournament.id,
    round: state.tournament.round,
    mode,
    phase: state.tournament.phase,
    winnerAgentId: winner.agentId,
    winnerScore: winner.score,
    savedAt: new Date().toISOString(),
    state,
  };
}

export function toTournamentListItem(record: SavedTournamentRecord): TournamentListItem {
  return {
    id: record.id,
    tournamentId: record.tournamentId,
    round: record.round,
    mode: record.mode,
    challengeTitle: record.state.tournament.selectedChallenge?.title ?? null,
    winnerAgentId: record.winnerAgentId,
    winnerAgentName: winnerFromState(record.state).agentName,
    winnerScore: record.winnerScore,
    savedAt: record.savedAt,
  };
}

export function shouldAutoSaveTournament(state: TournamentState): boolean {
  return (
    state.tournament.round >= 1 &&
    state.tournament.phase === "complete" &&
    state.tournament.evaluations.length > 0
  );
}
