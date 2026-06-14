import type { EvidenceItem, ResearchReport, ResearchReportKind, ResearchReportSection } from "@/lib/research/types";
import { REPORT_KIND_LABELS } from "@/lib/research/types";

const NOW = "2026-06-14T12:00:00.000Z";
const AGENT = "deep-research";

function section(
  reportId: string,
  kind: ResearchReportSection["kind"],
  title: string,
  content: string,
  evidenceIds: string[],
  sortOrder: number,
): ResearchReportSection {
  return {
    id: `${reportId}-sec-${kind}`,
    report_id: reportId,
    kind,
    title,
    content,
    evidence_ids: evidenceIds,
    confidence: 0.78 + sortOrder * 0.02,
    sort_order: sortOrder,
  };
}

const REPORT_IDS: Record<ResearchReportKind, string> = {
  weekly_tournament_performance: "report-weekly-tournament",
  best_agent_strategy: "report-best-agent",
  marketplace_opportunity: "report-marketplace",
  provider_cost_optimization: "report-provider-cost",
  tool_arena_reliability: "report-tool-arena",
  agent_constitution_improvement: "report-constitution",
  forecast_risk: "report-forecast-risk",
  ad_hoc_query: "report-ad-hoc",
};

function buildReport(
  kind: ResearchReportKind,
  question: string,
  methodology: string,
  analysis: string,
  recommendations: string[],
  limitations: string[],
  evidence: EvidenceItem[],
  relatedSlugs: string[],
  evidencePick: (e: EvidenceItem) => boolean,
): ResearchReport {
  const id = REPORT_IDS[kind];
  const picked = evidence.filter(evidencePick).slice(0, 6);
  const evIds = picked.map((e) => e.id);

  return {
    id,
    kind,
    title: REPORT_KIND_LABELS[kind],
    question,
    scope: picked.map((e) => e.source_type),
    methodology,
    confidence_score: 0.74 + picked.length * 0.02,
    evidence_ids: evIds,
    limitations,
    recommendations,
    related_component_slugs: relatedSlugs,
    generated_by_agent_id: AGENT,
    trace_id: null,
    created_at: NOW,
    sections: [
      section(
        id,
        "executive_summary",
        "Executive summary",
        analysis.split(".")[0] + ".",
        evIds.slice(0, 2),
        0,
      ),
      section(id, "methodology", "Methodology", methodology, [], 1),
      section(
        id,
        "evidence_table",
        "Evidence",
        picked.map((e) => `• ${e.title} (${(e.composite_score * 100).toFixed(0)}% composite)`).join("\n"),
        evIds,
        2,
      ),
      section(id, "analysis", "Analysis", analysis, evIds, 3),
      section(
        id,
        "recommendations",
        "Recommendations",
        recommendations.map((r) => `• ${r}`).join("\n"),
        evIds.slice(0, 3),
        4,
      ),
      section(
        id,
        "limitations",
        "Limitations",
        limitations.map((l) => `• ${l}`).join("\n"),
        [],
        5,
      ),
    ],
  };
}

export function buildReportTemplates(evidence: EvidenceItem[]): ResearchReport[] {
  return [
    buildReport(
      "weekly_tournament_performance",
      "How did tournament agents perform this week?",
      "Aggregated last 7 rounds of agent_runs, evaluations, and leaderboard_entries. Mock EMA scoring.",
      "Lean Agent led win rate at 34% forecast. Premium still tops raw quality but underperforms on cost-capped rounds. RAG stable mid-pack.",
      ["Reduce competitor count during Groq peak hours", "Publish weekly benchmark digest to marketplace"],
      ["Mock forecast data", "No enterprise-only rounds indexed"],
      evidence,
      ["lean-constitution-v2", "groq-cost-policy"],
      (e) => ["agent_runs", "leaderboard_entries", "tournaments"].includes(e.source_type),
    ),
    buildReport(
      "best_agent_strategy",
      "Which agent strategy wins most often under cost caps?",
      "Cross-referenced evaluations, memory failure modes, and agent run costs.",
      "Lean + Groq-first routing wins 73% of summary tasks when efficiency weight ≥ 35%. Premium wins when quality-only judging.",
      ["Default to Lean for summary/ops briefs", "Reserve Premium for polish-heavy enterprise deliverables"],
      ["Limited Anthropic sample in mock data"],
      evidence,
      ["lean-constitution-v2"],
      (e) => e.tags.some((t) => ["lean", "premium", "cost"].includes(t)),
    ),
    buildReport(
      "marketplace_opportunity",
      "Which marketplace listings have the strongest evidence?",
      "Ranked marketplace_components by Arena Score, tournament runs, and memory article cross-links.",
      "Groq Cost Policy Pack leads with Arena Score 91 and 18 tournament runs. Lean Constitution v2 is top agent artifact.",
      ["Feature groq-cost-policy on marketplace hub", "Bundle Lean constitution with cost policy stack export"],
      ["Marketplace index aging — refresh daily"],
      evidence,
      ["groq-cost-policy", "lean-constitution-v2"],
      (e) => e.source_type === "marketplace_components",
    ),
    buildReport(
      "provider_cost_optimization",
      "Which provider routing strategy saved the most cost?",
      "Compared forecast_runs, memory routing insights, and agent run cost telemetry.",
      "Hybrid mock competitors + Groq creators + mock final judge saved ~41% vs all-premium in mock week-24 data.",
      ["Enable hybrid_quality only for final judge polish", "Move challenge generation to Groq llama-3.3-70b"],
      ["Forecast layer is mock — validate before production routing changes"],
      evidence,
      ["groq-cost-policy"],
      (e) => e.tags.some((t) => ["routing", "groq", "cost", "forecast"].includes(t)),
    ),
    buildReport(
      "tool_arena_reliability",
      "Which tool workflow stack is most reliable?",
      "Analyzed tool_call_logs and Tool Arena verification evaluations across 6 challenges.",
      "Minimal Tool Agent stack achieved 94% verification pass rate with zero permission denials in latest round.",
      ["Default Tool Arena reliability benchmark to Minimal Tool stack", "Add permission retry policy from RAG agent as optional module"],
      ["Tool Arena mock executor — not production tool APIs"],
      evidence,
      [],
      (e) => e.source_type === "tool_call_logs" || e.tags.includes("tool-arena"),
    ),
    buildReport(
      "agent_constitution_improvement",
      "What constitution changes should be tested next?",
      "Linked memory articles, constitution proposals, and Premium Agent decline signals.",
      "Premium v1.3 should tighten token budget on summary tasks. Lean v2.1 can add safety guard without cost regression.",
      ["Run constitution battle for Premium v1.3", "Merge cost_pattern lessons into Lean v2.1 draft"],
      ["Constitution battle results not yet indexed"],
      evidence,
      ["lean-constitution-v2"],
      (e) => e.tags.includes("premium") || e.tags.includes("constitution"),
    ),
    buildReport(
      "forecast_risk",
      "What operational risks does the forecast layer flag?",
      "Reviewed forecast_runs for rate limit risk, cost spikes, and provider usage split.",
      "Groq rate limit risk at 78% with 5 competitors × 5-min loop. Cost spike risk 68% if auto-loop unchanged.",
      ["Cap competitors at 3 during peak hours", "Switch final judge to mock until hybrid tournament scheduled"],
      ["Forecasting MVP uses mock time series"],
      evidence,
      ["groq-cost-policy"],
      (e) => e.source_type === "forecast_runs" || e.tags.includes("forecast"),
    ),
  ];
}

export function getReportById(id: string, reports: ResearchReport[]): ResearchReport | undefined {
  return reports.find((r) => r.id === id);
}
