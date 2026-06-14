import { newId } from "@/lib/tournament/engine-mock";
import type {
  AgentLesson,
  ConstitutionUpdateProposal,
  MemoryArticle,
  MemoryArticleLink,
  MemoryLintIssue,
  MemoryLintReport,
  MarketplaceEvidenceNote,
} from "@/lib/memory/types";

const STALE_DAYS = 30;

/** Knowledge base health checks (inspired by claude-memory-compiler lint). */
export function lintMemoryKnowledgeBase(input: {
  articles: MemoryArticle[];
  links: MemoryArticleLink[];
  lessons: AgentLesson[];
  proposals: ConstitutionUpdateProposal[];
  evidenceNotes: MarketplaceEvidenceNote[];
}): MemoryLintReport {
  const issues: MemoryLintIssue[] = [];
  const articleIds = new Set(input.articles.map((a) => a.id));

  for (const link of input.links) {
    if (!articleIds.has(link.from_article_id)) {
      issues.push({
        code: "broken_link_from",
        severity: "error",
        message: `Link ${link.id} references missing source article`,
        entity_type: "memory_article_link",
        entity_id: link.id,
      });
    }
    if (!articleIds.has(link.to_article_id)) {
      issues.push({
        code: "broken_link_to",
        severity: "error",
        message: `Link ${link.id} references missing target article`,
        entity_type: "memory_article_link",
        entity_id: link.id,
      });
    }
  }

  const linkedIds = new Set<string>();
  for (const link of input.links) {
    linkedIds.add(link.from_article_id);
    linkedIds.add(link.to_article_id);
  }
  for (const article of input.articles) {
    if (!linkedIds.has(article.id) && input.articles.length > 3) {
      issues.push({
        code: "orphan_article",
        severity: "warning",
        message: `Article "${article.title}" has no links`,
        entity_type: "memory_article",
        entity_id: article.id,
      });
    }
    if (article.confidence < 0.5) {
      issues.push({
        code: "low_confidence",
        severity: "warning",
        message: `Low confidence (${(article.confidence * 100).toFixed(0)}%): ${article.title}`,
        entity_type: "memory_article",
        entity_id: article.id,
      });
    }
  }

  const now = Date.now();
  for (const lesson of input.lessons) {
    if (lesson.stale) {
      issues.push({
        code: "stale_lesson",
        severity: "info",
        message: `Stale lesson: ${lesson.title}`,
        entity_type: "agent_lesson",
        entity_id: lesson.id,
      });
    }
    const age = (now - new Date(lesson.updated_at).getTime()) / 86400000;
    if (age > STALE_DAYS) {
      issues.push({
        code: "stale_lesson_age",
        severity: "warning",
        message: `Lesson older than ${STALE_DAYS}d: ${lesson.title}`,
        entity_type: "agent_lesson",
        entity_id: lesson.id,
      });
    }
    if (lesson.article_id && !articleIds.has(lesson.article_id)) {
      issues.push({
        code: "broken_lesson_backlink",
        severity: "error",
        message: `Lesson links to missing article`,
        entity_type: "agent_lesson",
        entity_id: lesson.id,
      });
    }
  }

  const contradicts = input.links.filter((l) => l.link_type === "contradicts");
  if (contradicts.length > 2) {
    issues.push({
      code: "contradictory_lessons",
      severity: "warning",
      message: `${contradicts.length} contradiction links — review agent lessons`,
      entity_type: "memory_article_link",
      entity_id: contradicts[0]!.id,
    });
  }

  for (const agentId of ["lean", "premium", "rag"]) {
    const hasLesson = input.lessons.some((l) => l.agent_id === agentId);
    if (!hasLesson && input.lessons.length > 0) {
      issues.push({
        code: "missing_agent_backlink",
        severity: "info",
        message: `No lessons for agent ${agentId}`,
        entity_type: "agent_lesson",
        entity_id: agentId,
      });
    }
  }

  for (const note of input.evidenceNotes) {
    if (note.evidence_article_ids.length === 0) {
      issues.push({
        code: "missing_evidence",
        severity: "warning",
        message: `Marketplace candidate ${note.marketplace_candidate_id} has no evidence articles`,
        entity_type: "marketplace_evidence_note",
        entity_id: note.id,
      });
    }
    for (const aid of note.evidence_article_ids) {
      if (!articleIds.has(aid)) {
        issues.push({
          code: "broken_evidence_link",
          severity: "error",
          message: `Evidence note references missing article ${aid}`,
          entity_type: "marketplace_evidence_note",
          entity_id: note.id,
        });
      }
    }
  }

  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const health_score = Math.max(0, 100 - errors * 15 - warnings * 5);

  return {
    id: newId(),
    run_at: new Date().toISOString(),
    health_score,
    issues,
    summary: `${issues.length} issues (${errors} errors, ${warnings} warnings). Health score ${health_score}/100.`,
  };
}
