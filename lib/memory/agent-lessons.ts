import { getCompetitor, getCreator, getJudge } from "@/lib/tournament/agents";
import { newId } from "@/lib/tournament/engine-mock";
import type { AgentLesson, ExtractedLesson, MemoryArticle } from "@/lib/memory/types";

function resolveAgentName(agentId: string): string {
  if (["lean", "premium", "rag", "multi-agent", "fast"].includes(agentId)) {
    return getCompetitor(agentId as import("@/lib/tournament/types").CompetitorAgentId).name;
  }
  if (["strategy", "technical", "growth"].includes(agentId)) {
    return getCreator(agentId as import("@/lib/tournament/types").CreatorAgentId).name;
  }
  if (["quality", "efficiency"].includes(agentId)) {
    return getJudge(agentId as import("@/lib/tournament/types").JudgeAgentId).name;
  }
  return agentId;
}

/** Update agent lesson store from extracted lessons + articles. */
export function updateAgentLessons(
  lessons: ExtractedLesson[],
  articles: MemoryArticle[],
  tournamentId: string,
  round: number,
): AgentLesson[] {
  const now = new Date().toISOString();
  const result: AgentLesson[] = [];

  for (const lesson of lessons) {
    const article = articles.find((a) => a.title === lesson.title);
    for (const agentId of lesson.agent_ids) {
      for (const lessonType of lesson.lesson_types) {
        result.push({
          id: newId(),
          agent_id: agentId,
          agent_name: resolveAgentName(agentId),
          lesson_type: lessonType,
          title: lesson.title.slice(0, 80),
          content: lesson.summary,
          confidence: lesson.confidence,
          tournament_id: tournamentId,
          round,
          article_id: article?.id ?? null,
          stale: false,
          created_at: now,
          updated_at: now,
        });
      }
    }
  }

  return result;
}

export function getAgentMemorySummary(agentId: string, lessons: AgentLesson[]) {
  const mine = lessons.filter((l) => l.agent_id === agentId && !l.stale);
  return {
    strengths: mine.filter((l) => l.lesson_type === "strength"),
    weaknesses: mine.filter((l) => l.lesson_type === "weakness"),
    failure_modes: mine.filter((l) => l.lesson_type === "failure_mode"),
    cost_patterns: mine.filter((l) => l.lesson_type === "cost_pattern"),
    recommended_changes: mine.filter((l) => l.lesson_type === "recommended_change"),
    all: mine,
  };
}
