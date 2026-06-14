import { newId } from "@/lib/tournament/engine-mock";
import type { ExtractedLesson, MemoryLog, TournamentMemoryEvent } from "@/lib/memory/types";
import type { TournamentState } from "@/lib/tournament/types";

/** Mock Memory Extractor — replace with LLM agent later. */
export function extractTournamentLessons(
  state: TournamentState,
  events: TournamentMemoryEvent[],
): ExtractedLesson[] {
  const lessons: ExtractedLesson[] = [];
  const t = state.tournament;
  const evaluations = [...t.evaluations].sort((a, b) => b.totalScore - a.totalScore);
  const winner = evaluations[0];
  const loser = evaluations[evaluations.length - 1];
  const challenge = t.selectedChallenge;

  if (winner) {
    lessons.push({
      key: `winner-${winner.agentId}-r${t.round}`,
      article_type: "agent_pattern",
      title: `${winner.agentName} wins round ${t.round} with score ${winner.totalScore}`,
      summary: `Winning pattern: strong format compliance and cost balance on "${challenge?.title ?? "challenge"}".`,
      body: `${winner.agentName} achieved ${winner.totalScore} total score. Quality ${winner.qualityScore}, efficiency ${winner.efficiencyScore}. Key factor: ${winner.passed ? "passed threshold" : "below threshold but ranked first"}.`,
      confidence: 0.82,
      tags: ["winner", winner.agentId, "pattern"],
      agent_ids: [winner.agentId],
      lesson_types: ["strength", "prompt_pattern"],
    });
  }

  if (loser && loser.agentId !== winner?.agentId) {
    lessons.push({
      key: `failure-${loser.agentId}-r${t.round}`,
      article_type: "failure_mode",
      title: `${loser.agentName} underperformed in round ${t.round}`,
      summary: `Failure mode: ${loser.penaltyTotal > 5 ? "penalties dominated score" : "low efficiency vs field"}.`,
      body: `Score ${loser.totalScore}, penalties ${loser.penaltyTotal}. Review output structure and token discipline.`,
      confidence: 0.74,
      tags: ["failure", loser.agentId],
      agent_ids: [loser.agentId],
      lesson_types: ["weakness", "failure_mode"],
    });
  }

  const leanRun = t.activeRuns.find((r) => r.agentId === "lean");
  if (leanRun) {
    lessons.push({
      key: `cost-lean-r${t.round}`,
      article_type: "cost_insight",
      title: `Lean Operator cost profile — $${leanRun.costUsd.toFixed(4)} / ${leanRun.tokensIn + leanRun.tokensOut} tokens`,
      summary: "Lean agent maintains lowest cost tier when self-review checklist is active.",
      body: `Cost $${leanRun.costUsd}, tokens ${leanRun.tokensIn + leanRun.tokensOut}. Constitution ${leanRun.constitutionVersion ?? "unknown"}.`,
      confidence: 0.88,
      tags: ["cost", "lean"],
      agent_ids: ["lean"],
      lesson_types: ["cost_pattern"],
    });
  }

  if (state.routing?.runtimeMode && state.routing.runtimeMode !== "mock") {
    lessons.push({
      key: `routing-${state.routing.runtimeMode}-r${t.round}`,
      article_type: "model_routing_insight",
      title: `Groq routing saved ~$${state.routing.costSavedEstimateUsd.toFixed(4)} vs Claude baseline`,
      summary: `${state.routing.runtimeMode} mode: agent loop on Groq, final judge mocked.`,
      body: `Provider usage entries: ${state.routing.providerUsage.length}. Guard risk: ${state.routing.guard?.riskLevel ?? "n/a"}.`,
      confidence: 0.79,
      tags: ["routing", "groq", state.routing.runtimeMode],
      agent_ids: [],
      lesson_types: ["model_provider_pattern"],
    });
  }

  if (challenge) {
    lessons.push({
      key: `challenge-${challenge.id}-r${t.round}`,
      article_type: "challenge_design_lesson",
      title: `Challenge "${challenge.title}" — pass threshold ${challenge.passThreshold}`,
      summary: `${evaluations.filter((e) => e.passed).length}/${evaluations.length} agents passed.`,
      body: `Difficulty implied by pass rate. Cost limit $${challenge.costLimitUsd}.`,
      confidence: 0.71,
      tags: ["challenge", challenge.selectedFrom],
      agent_ids: [challenge.selectedFrom],
      lesson_types: ["prompt_pattern"],
    });
  }

  if (state.marketplace.length > 0) {
    lessons.push({
      key: `marketplace-r${t.round}`,
      article_type: "marketplace_opportunity",
      title: `${state.marketplace.length} marketplace seeds from round ${t.round}`,
      summary: "High performers eligible for tournament-tested marketplace listing.",
      body: `Top seed: ${state.marketplace[0]?.agentName} — score ${state.marketplace[0]?.totalScore}.`,
      confidence: 0.76,
      tags: ["marketplace"],
      agent_ids: state.marketplace.map((m) => m.agentId),
      lesson_types: ["recommended_change"],
    });
  }

  if (evaluations.length >= 2) {
    const avgScore = evaluations.reduce((s, e) => s + e.totalScore, 0) / evaluations.length;
    lessons.push({
      key: `benchmark-r${t.round}`,
      article_type: "benchmark_summary",
      title: `Round ${t.round} benchmark — avg score ${avgScore.toFixed(1)}`,
      summary: `Field spread: ${winner?.totalScore ?? 0} (top) to ${loser?.totalScore ?? 0} (bottom).`,
      body: `${evaluations.length} agents evaluated on "${challenge?.title ?? "challenge"}".`,
      confidence: 0.85,
      tags: ["benchmark", `round-${t.round}`],
      agent_ids: evaluations.map((e) => e.agentId),
      lesson_types: ["strength"],
    });
  }

  if (winner?.agentId === "lean" && leanRun && leanRun.constitutionVersion === "v1.2") {
    lessons.push({
      key: `constitution-lean-v12-r${t.round}`,
      article_type: "constitution_change",
      title: "Lean v1.2 self-review correlates with format compliance gains",
      summary: "Consider promoting v1.2 checklist to default constitution.",
      body: "Mandatory self-review reduced missing-section penalties in mock analysis.",
      confidence: 0.8,
      tags: ["constitution", "lean", "v1.2"],
      agent_ids: ["lean"],
      lesson_types: ["recommended_change", "prompt_pattern"],
    });
  }

  void events;
  return lessons;
}

export function createDailyLog(
  state: TournamentState,
  events: TournamentMemoryEvent[],
): MemoryLog {
  const t = state.tournament;
  const winner = [...t.evaluations].sort((a, b) => b.totalScore - a.totalScore)[0];
  const today = new Date().toISOString().slice(0, 10);

  return {
    id: newId(),
    tournament_id: t.id,
    round: t.round,
    log_date: today,
    title: `Tournament log — Round ${t.round} · ${today}`,
    summary: winner
      ? `${winner.agentName} won with ${winner.totalScore} pts on "${t.selectedChallenge?.title ?? "challenge"}".`
      : `Round ${t.round} events captured (${events.length} events).`,
    event_count: events.length,
    winner_agent_id: winner?.agentId ?? null,
    winner_score: winner?.totalScore ?? null,
    challenge_title: t.selectedChallenge?.title ?? null,
    payload: {
      evaluation_count: t.evaluations.length,
      marketplace_seeds: state.marketplace.length,
    },
    created_at: new Date().toISOString(),
  };
}
