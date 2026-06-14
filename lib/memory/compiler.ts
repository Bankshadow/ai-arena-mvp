import { newId } from "@/lib/tournament/engine-mock";
import type {
  ExtractedLesson,
  KnowledgeCompileRun,
  MemoryArticle,
  MemoryArticleLink,
} from "@/lib/memory/types";

function slugify(title: string, round: number): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 48) + `-r${round}`
  );
}

/** Mock Memory Compiler — structures lessons into knowledge articles. */
export function compileMemoryArticles(
  lessons: ExtractedLesson[],
  compileRunId: string,
  tournamentId: string,
  round: number,
): { articles: MemoryArticle[]; links: MemoryArticleLink[] } {
  const now = new Date().toISOString();
  const articles: MemoryArticle[] = lessons.map((lesson) => ({
    id: newId(),
    slug: slugify(lesson.title, round),
    article_type: lesson.article_type,
    title: lesson.title,
    summary: lesson.summary,
    body: lesson.body,
    confidence: lesson.confidence,
    tags: lesson.tags,
    agent_ids: lesson.agent_ids,
    tournament_id: tournamentId,
    round,
    evidence_ids: [],
    source_compile_run_id: compileRunId,
    created_at: now,
    updated_at: now,
  }));

  const links: MemoryArticleLink[] = [];
  const benchmark = articles.find((a) => a.article_type === "benchmark_summary");
  const winner = articles.find((a) => a.article_type === "agent_pattern");

  if (benchmark && winner) {
    links.push({
      id: newId(),
      from_article_id: benchmark.id,
      to_article_id: winner.id,
      link_type: "evidence_for",
      created_at: now,
    });
  }

  const failure = articles.find((a) => a.article_type === "failure_mode");
  if (winner && failure) {
    links.push({
      id: newId(),
      from_article_id: failure.id,
      to_article_id: winner.id,
      link_type: "contradicts",
      created_at: now,
    });
  }

  return { articles, links };
}

export function startCompileRun(tournamentId: string, round: number): KnowledgeCompileRun {
  return {
    id: newId(),
    tournament_id: tournamentId,
    round,
    status: "running",
    articles_created: 0,
    lessons_updated: 0,
    proposals_generated: 0,
    evidence_notes_created: 0,
    started_at: new Date().toISOString(),
    completed_at: null,
    error: null,
  };
}

export function finishCompileRun(
  run: KnowledgeCompileRun,
  counts: {
    articles: number;
    lessons: number;
    proposals: number;
    evidence: number;
  },
): KnowledgeCompileRun {
  return {
    ...run,
    status: "complete",
    articles_created: counts.articles,
    lessons_updated: counts.lessons,
    proposals_generated: counts.proposals,
    evidence_notes_created: counts.evidence,
    completed_at: new Date().toISOString(),
  };
}
