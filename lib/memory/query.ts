import type {
  AgentLesson,
  MemoryArticle,
  MemoryQueryResult,
  StrategyRecommendation,
} from "@/lib/memory/types";

/** Mock memory query — keyword match; replace with vector/LLM search later. */
export function queryMemory(
  query: string,
  articles: MemoryArticle[],
  lessons: AgentLesson[],
): MemoryQueryResult {
  const q = query.toLowerCase().trim();
  if (!q) {
    return {
      query,
      answer: "Ask about tournament rounds, agent patterns, cost insights, or constitution changes.",
      matched_articles: [],
      matched_lessons: [],
      confidence: 0,
    };
  }

  const matched_articles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.body.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q)) ||
      a.agent_ids.some((id) => id.includes(q)),
  );

  const matched_lessons = lessons.filter(
    (l) =>
      l.title.toLowerCase().includes(q) ||
      l.content.toLowerCase().includes(q) ||
      l.agent_id.includes(q),
  );

  const topArticle = matched_articles[0];
  const topLesson = matched_lessons[0];

  let answer: string;
  if (topArticle) {
    answer = `${topArticle.summary} (Article: ${topArticle.title}, confidence ${(topArticle.confidence * 100).toFixed(0)}%, round ${topArticle.round}).`;
  } else if (topLesson) {
    answer = `${topLesson.content} (Lesson for ${topLesson.agent_name}, type ${topLesson.lesson_type}).`;
  } else {
    answer = `No direct matches for "${query}". Try: lean cost, groq routing, failure mode, constitution.`;
  }

  return {
    query,
    answer,
    matched_articles: matched_articles.slice(0, 5),
    matched_lessons: matched_lessons.slice(0, 5),
    confidence: topArticle?.confidence ?? topLesson?.confidence ?? 0.3,
  };
}

export function buildStrategyRecommendations(
  articles: MemoryArticle[],
  tournamentId: string,
): StrategyRecommendation[] {
  const recs: StrategyRecommendation[] = [];
  const now = new Date().toISOString();

  const cost = articles.find((a) => a.article_type === "cost_insight");
  if (cost) {
    recs.push({
      id: `strat-${cost.id}`,
      title: "Prioritize cost-capped agents for high-volume rounds",
      recommendation: "Default to Lean Operator constitution v1.2 for batch tournament loops.",
      rationale: cost.summary,
      priority: "high",
      agent_id: "lean",
      article_id: cost.id,
      tournament_id: tournamentId,
      created_at: now,
    });
  }

  const routing = articles.find((a) => a.article_type === "model_routing_insight");
  if (routing) {
    recs.push({
      id: `strat-${routing.id}`,
      title: "Use groq_free runtime for autonomous loops",
      recommendation: "Keep final judge on mock until Claude/GPT quality tier is enabled.",
      rationale: routing.summary,
      priority: "medium",
      agent_id: null,
      article_id: routing.id,
      tournament_id: tournamentId,
      created_at: now,
    });
  }

  return recs;
}
