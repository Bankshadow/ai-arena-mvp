import { getConstitutionRecordByAgentId } from "@/lib/constitution/mock-data";
import { newId } from "@/lib/tournament/engine-mock";
import type {
  ConstitutionUpdateProposal,
  ExtractedLesson,
  MemoryArticle,
} from "@/lib/memory/types";

/** Generate constitution update proposals from constitution_change lessons. */
export function generateConstitutionProposals(
  lessons: ExtractedLesson[],
  articles: MemoryArticle[],
  tournamentId: string,
  round: number,
): ConstitutionUpdateProposal[] {
  const proposals: ConstitutionUpdateProposal[] = [];
  const constitutionLessons = lessons.filter((l) => l.article_type === "constitution_change");

  for (const lesson of constitutionLessons) {
    for (const agentId of lesson.agent_ids) {
      const record = getConstitutionRecordByAgentId(agentId);
      if (!record) continue;

      const article = articles.find((a) => a.title === lesson.title);
      const current = record.currentVersion;
      const proposed = bumpVersion(current);

      proposals.push({
        id: newId(),
        agent_id: agentId,
        agent_name: record.agentName,
        constitution_id: record.id,
        current_version: current,
        proposed_version: proposed,
        field_changes: [
          {
            field: "selfReviewProtocol",
            before: "Optional 1-pass review",
            after: "Mandatory checklist before finalize",
            rationale: lesson.summary,
          },
          {
            field: "behaviorRules",
            before: "4 rules",
            after: "5 rules (+ self-review rule)",
            rationale: "Tournament evidence from round " + round,
          },
        ],
        status: "pending_review",
        confidence: lesson.confidence,
        article_id: article?.id ?? null,
        tournament_id: tournamentId,
        round,
        created_at: new Date().toISOString(),
      });
    }
  }

  return proposals;
}

function bumpVersion(v: string): string {
  const m = v.match(/v(\d+)\.(\d+)/i);
  if (!m) return "v1.1";
  return `v${m[1]}.${Number(m[2]) + 1}`;
}
