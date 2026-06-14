import {
  compileMemoryArticles,
  finishCompileRun,
  startCompileRun,
} from "@/lib/memory/compiler";
import { captureTournamentEvents } from "@/lib/memory/event-capture";
import { createDailyLog, extractTournamentLessons } from "@/lib/memory/extractor";
import { updateAgentLessons } from "@/lib/memory/agent-lessons";
import { generateConstitutionProposals } from "@/lib/memory/constitution-proposals";
import { lintMemoryKnowledgeBase } from "@/lib/memory/linter";
import { buildMarketplaceEvidence } from "@/lib/memory/marketplace-evidence";
import { buildStrategyRecommendations } from "@/lib/memory/query";
import type { MemoryKnowledgeBase } from "@/lib/memory/store";
import { metaFromCompile } from "@/lib/memory/store";
import type { TournamentMemoryMeta } from "@/lib/memory/types";
import type { TournamentState } from "@/lib/tournament/types";

export type MemoryCompileResult = {
  knowledgeBase: Partial<MemoryKnowledgeBase>;
  meta: TournamentMemoryMeta;
};

/** Full post-tournament memory pipeline (mock — no LLM). */
export function runMemoryCompilePipeline(state: TournamentState): MemoryCompileResult {
  const t = state.tournament;
  if (t.evaluations.length === 0 && t.round === 0) {
    return {
      knowledgeBase: {},
      meta: {
        last_compile_run_id: null,
        last_log_id: null,
        articles_created: 0,
        lessons_updated: 0,
        proposals_pending: 0,
        compiled_at: null,
      },
    };
  }

  const events = captureTournamentEvents(state);
  const log = createDailyLog(state, events);
  const extracted = extractTournamentLessons(state, events);

  let run = startCompileRun(t.id, t.round);
  const { articles, links } = compileMemoryArticles(extracted, run.id, t.id, t.round);
  const lessons = updateAgentLessons(extracted, articles, t.id, t.round);
  const proposals = generateConstitutionProposals(extracted, articles, t.id, t.round);
  const evidenceNotes = buildMarketplaceEvidence(state, articles);
  const recommendations = buildStrategyRecommendations(articles, t.id);

  run = finishCompileRun(run, {
    articles: articles.length,
    lessons: lessons.length,
    proposals: proposals.length,
    evidence: evidenceNotes.length,
  });

  const kbSlice: Partial<MemoryKnowledgeBase> = {
    events: [
      ...events,
      {
        id: `mem-${run.id}`,
        tournament_id: t.id,
        round: t.round,
        phase: "memory_compiled",
        message: `Compiled ${articles.length} articles, ${lessons.length} lessons`,
        payload: { compile_run_id: run.id },
        created_at: new Date().toISOString(),
      },
    ],
    logs: [log],
    articles,
    links,
    lessons,
    proposals,
    recommendations,
    compileRuns: [run],
    evidenceNotes,
  };

  const lintReport = lintMemoryKnowledgeBase({
    articles,
    links,
    lessons,
    proposals,
    evidenceNotes,
  });
  kbSlice.lastLintReport = lintReport;

  const meta: TournamentMemoryMeta = {
    ...metaFromCompile(run),
    last_log_id: log.id,
    proposals_pending: proposals.filter((p) => p.status === "pending_review").length,
  };

  return { knowledgeBase: kbSlice, meta };
}
