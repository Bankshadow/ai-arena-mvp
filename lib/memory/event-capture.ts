import { newId } from "@/lib/tournament/engine-mock";
import type { MemoryEventPhase, TournamentMemoryEvent } from "@/lib/memory/types";
import type { TournamentState } from "@/lib/tournament/types";

/** Capture structured events from tournament state for memory pipeline. */
export function captureTournamentEvents(state: TournamentState): TournamentMemoryEvent[] {
  const t = state.tournament;
  const now = new Date().toISOString();
  const events: TournamentMemoryEvent[] = [];

  function push(
    phase: MemoryEventPhase,
    message: string,
    extra?: Partial<TournamentMemoryEvent>,
  ) {
    events.push({
      id: newId(),
      tournament_id: t.id,
      round: t.round,
      phase,
      message,
      payload: {},
      created_at: now,
      ...extra,
    });
  }

  if (t.round > 0) {
    push("tournament_started", `Round ${t.round} started`);
  }

  if (t.challengeIdeas.length > 0) {
    push("challenge_generated", `${t.challengeIdeas.length} challenge ideas generated`);
  }

  if (t.selectedChallenge) {
    push("challenge_selected", `Selected: ${t.selectedChallenge.title}`, {
      payload: { challenge_id: t.selectedChallenge.id, title: t.selectedChallenge.title },
    });
  }

  if (t.activeRuns.length > 0) {
    push("agents_running", `${t.activeRuns.length} agent runs completed`, {
      payload: {
        runs: t.activeRuns.map((r) => ({
          agent_id: r.agentId,
          cost: r.costUsd,
          tokens: r.tokensIn + r.tokensOut,
          constitution_version: r.constitutionVersion,
        })),
      },
    });
  }

  if (t.evaluations.length > 0) {
    push("judging", `${t.evaluations.length} evaluations recorded`, {
      phase: "judging",
      payload: {
        evaluations: t.evaluations.map((e) => ({
          agent_id: e.agentId,
          total_score: e.totalScore,
          passed: e.passed,
        })),
      },
    });
  }

  if (state.leaderboard.length > 0 && t.evaluations.length > 0) {
    const leader = state.leaderboard[0];
    push("leaderboard_updated", `Leader: ${leader?.agentName}`, {
      payload: { leader_agent_id: leader?.agentId, leader_score: leader?.totalScore },
    });
  }

  if (state.marketplace.length > 0) {
    push("marketplace_seeded", `${state.marketplace.length} marketplace seeds`, {
      payload: { count: state.marketplace.length },
    });
  }

  if (t.phase === "complete" && t.evaluations.length > 0) {
    const winner = [...t.evaluations].sort((a, b) => b.totalScore - a.totalScore)[0];
    push("tournament_completed", `Round ${t.round} complete — winner ${winner?.agentName}`, {
      agent_id: winner?.agentId,
      payload: {
        winner_score: winner?.totalScore,
        runtime_mode: state.routing?.runtimeMode,
      },
    });
  }

  return events;
}

export function eventsFromHistory(state: TournamentState): TournamentMemoryEvent[] {
  return state.history.slice(0, 20).map((h) => ({
    id: h.id,
    tournament_id: h.tournamentId,
    round: h.round,
    phase: mapHistoryType(h.type),
    message: h.message,
    payload: (h.meta as Record<string, unknown>) ?? {},
    created_at: h.timestamp,
  }));
}

function mapHistoryType(type: string): MemoryEventPhase {
  const map: Record<string, MemoryEventPhase> = {
    loop_started: "tournament_started",
    challenges_generated: "challenge_generated",
    challenge_selected: "challenge_selected",
    agents_running: "agents_running",
    evaluation_complete: "judging",
    leaderboard_updated: "leaderboard_updated",
    marketplace_seeded: "marketplace_seeded",
    loop_complete: "tournament_completed",
  };
  return map[type] ?? "tournament_started";
}
