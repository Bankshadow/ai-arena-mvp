import { getMockComponentCatalog } from "@/lib/marketplace/mock-catalog";
import type { VectorCollectionName, VectorDocument, VectorSourceType } from "@/lib/vector/types";

const NOW = "2026-06-14T12:00:00.000Z";

function doc(
  id: string,
  collection: VectorCollectionName,
  source_type: VectorSourceType,
  source_id: string,
  title: string,
  content: string,
  extra?: Partial<Pick<VectorDocument, "tags" | "confidence_score" | "deep_link" | "recommended_action" | "metadata">>,
): Omit<VectorDocument, "embedding"> {
  return {
    id,
    collection,
    source_type,
    source_id,
    title,
    content,
    metadata: extra?.metadata ?? {},
    tags: extra?.tags ?? [],
    confidence_score: extra?.confidence_score ?? 0.8,
    deep_link: extra?.deep_link ?? `/marketplace/${source_id}`,
    recommended_action: extra?.recommended_action ?? null,
    created_at: NOW,
    updated_at: NOW,
  };
}

export function seedVectorDocumentTemplates(): Omit<VectorDocument, "embedding">[] {
  const catalog = getMockComponentCatalog();
  const componentDocs = catalog.slice(0, 10).map((c) =>
    doc(
      `vdoc-mkt-${c.slug}`,
      "marketplace_component_vectors",
      "marketplace_component",
      c.slug,
      c.title,
      `${c.title}. ${c.description}. Tags: ${c.tags.join(", ")}. Arena score ${c.arena_score.total}.`,
      {
        tags: c.tags,
        confidence_score: c.arena_score.total / 100,
        deep_link: `/marketplace/${c.slug}`,
        recommended_action: `Add ${c.slug} to stack for ${c.proof.best_category}`,
        metadata: {
          arena_score: c.arena_score.total,
          battle_score: c.arena_score.battle,
          win_rate: c.proof.win_rate,
          avg_cost_usd: c.proof.avg_cost_usd,
        },
      },
    ),
  );

  const staticDocs: Omit<VectorDocument, "embedding">[] = [
    doc(
      "vdoc-agent-lean-lesson",
      "agent_memory_vectors",
      "agent_lesson",
      "lesson-lean-cost",
      "Lean Agent: cost pattern on summary tasks",
      "Lean Agent wins cost-capped executive summaries with Groq llama-3.3-70b at ~$0.002 per run.",
      {
        tags: ["lean", "cost", "summary", "agent"],
        confidence_score: 0.86,
        deep_link: "/agents/lean",
        recommended_action: "Use Lean Agent for low-cost PDF summary workflows",
      },
    ),
    doc(
      "vdoc-agent-premium-lesson",
      "agent_memory_vectors",
      "agent_lesson",
      "lesson-premium-quality",
      "Premium Agent: quality strength on enterprise briefs",
      "Premium Agent excels when quality weight > 60% and cost cap is relaxed.",
      {
        tags: ["premium", "enterprise", "quality"],
        confidence_score: 0.82,
        deep_link: "/agents/premium",
        recommended_action: "Use Premium for enterprise risk review when budget allows",
      },
    ),
    doc(
      "vdoc-tournament-r42",
      "tournament_memory_vectors",
      "tournament_memory",
      "tournament-r42",
      "Round 42: cost-capped executive summary",
      "Q4 Board Risk Brief challenge. Lean winner at 84 pts. Groq path. Total cost $0.011.",
      {
        tags: ["tournament", "round", "summary", "cost"],
        confidence_score: 0.9,
        deep_link: "/tournaments",
        recommended_action: "Review Round 42 eval for cost-cap patterns",
      },
    ),
    doc(
      "vdoc-mem-cost",
      "tournament_memory_vectors",
      "memory_article",
      "art-cost-insight-1",
      "Cost insight: Groq-first summary stacks",
      "When challenge type is executive summary with tight cap, lean + groq_free routing wins 73% of rounds.",
      {
        tags: ["cost", "groq", "routing", "summary"],
        confidence_score: 0.84,
        deep_link: "/memory/articles",
        recommended_action: "Apply Groq-first routing for summary tournaments",
      },
    ),
    doc(
      "vdoc-ev-lean",
      "research_evidence_vectors",
      "research_evidence",
      "ev-lean-r42",
      "Evidence: Lean Agent Round 42 run",
      "Lean Agent won cost-capped summary at $0.0018 / 1.4K tokens. Final score 84.",
      {
        tags: ["lean", "evidence", "cost", "summary"],
        confidence_score: 0.88,
        deep_link: "/research/evidence",
        recommended_action: "Cite in marketplace listing for lean-constitution-v2",
      },
    ),
    doc(
      "vdoc-ev-groq-policy",
      "research_evidence_vectors",
      "research_evidence",
      "ev-mkt-groq-policy",
      "Evidence: Groq Cost Policy Pack strongest marketplace proof",
      "Arena Score 91. 18 tournament runs. Avg cost $0.0019.",
      {
        tags: ["groq", "cost", "marketplace", "evidence"],
        confidence_score: 0.9,
        deep_link: "/research/evidence",
        recommended_action: "Feature on marketplace hub",
      },
    ),
    doc(
      "vdoc-const-lean",
      "constitution_vectors",
      "constitution",
      "lean-constitution-v2",
      "Lean Agent Constitution v2",
      "Token budget tight. Groq-first. Optimized for ops briefs and executive summaries under cost cap.",
      {
        tags: ["lean", "constitution", "cost"],
        confidence_score: 0.87,
        deep_link: "/marketplace/lean-constitution-v2",
        recommended_action: "Export to Cursor for summary workflows",
      },
    ),
    doc(
      "vdoc-const-premium",
      "constitution_vectors",
      "constitution",
      "premium-constitution-v1",
      "Premium Agent Constitution v1",
      "Anthropic polish path. Enterprise risk review and board-ready deliverables.",
      {
        tags: ["premium", "enterprise", "risk", "constitution"],
        confidence_score: 0.85,
        deep_link: "/agents/premium",
        recommended_action: "Use for enterprise risk review agent stacks",
      },
    ),
    doc(
      "vdoc-judge-efficiency",
      "judge_rubric_vectors",
      "judge_rubric",
      "judge-efficiency-v1",
      "Efficiency Judge Rubric v1",
      "Weights cost and token usage heavily. Penalizes cap overruns. Favors lean agents on summary tasks.",
      {
        tags: ["judge", "efficiency", "cost"],
        confidence_score: 0.83,
        deep_link: "/components",
        recommended_action: "Pair with cost-capped tournaments",
      },
    ),
    doc(
      "vdoc-tool-minimal",
      "tool_stack_vectors",
      "tool_stack",
      "minimal-tool-stack",
      "Minimal Tool Agent workflow stack",
      "GitHub issue triage, calendar, docs. 94% verification pass. Zero permission denials in latest round.",
      {
        tags: ["tool-arena", "github", "triage", "reliability"],
        confidence_score: 0.88,
        deep_link: "/tool-arena",
        recommended_action: "Use for GitHub issue triage tool workflows",
      },
    ),
    doc(
      "vdoc-tool-rag",
      "tool_stack_vectors",
      "tool_stack",
      "rag-tool-stack",
      "RAG Tool Agent workflow stack",
      "Retrieval + tool calls. Permission retry pattern. 78% reliability on same challenge set.",
      {
        tags: ["tool-arena", "rag", "retrieval"],
        confidence_score: 0.76,
        deep_link: "/tools",
        recommended_action: "Add when retrieval over docs is required",
      },
    ),
    doc(
      "vdoc-forecast-groq",
      "forecast_insight_vectors",
      "forecast_insight",
      "forecast-routing",
      "Forecast: Groq rate limit and routing savings",
      "Hybrid mock+Groq saves 38-41% vs all-premium. Groq rate limit risk 78% at 5 competitors.",
      {
        tags: ["forecast", "groq", "routing", "cost"],
        confidence_score: 0.72,
        deep_link: "/forecasting",
        recommended_action: "Reduce competitors during peak hours",
      },
    ),
    doc(
      "vdoc-mkt-groq-policy",
      "marketplace_component_vectors",
      "marketplace_component",
      "groq-cost-policy",
      "Groq Cost Policy Pack",
      "Groq-first model routing policy for cost-capped workflows. Low-cost PDF summary pipeline. Arena Score 91.",
      {
        tags: ["groq", "cost", "routing", "pdf", "summary"],
        confidence_score: 0.91,
        deep_link: "/marketplace/groq-cost-policy",
        recommended_action: "Add groq-cost-policy to stack for Groq-first routing",
        metadata: { arena_score: 91, battle_score: 92, win_rate: 0.58, avg_cost_usd: 0.0019 },
      },
    ),
    doc(
      "vdoc-mkt-lean-const",
      "marketplace_component_vectors",
      "marketplace_component",
      "lean-constitution-v2",
      "Lean Agent Constitution v2",
      "Low-cost PDF summary workflow constitution. Tournament-tested. Best for ops briefs.",
      {
        tags: ["lean", "summary", "pdf", "cost"],
        confidence_score: 0.87,
        deep_link: "/marketplace/lean-constitution-v2",
        recommended_action: "Bundle with groq-cost-policy in stack export",
        metadata: { arena_score: 87, battle_score: 85, win_rate: 0.58, avg_cost_usd: 0.0021 },
      },
    ),
  ];

  const seen = new Set<string>();
  return [...componentDocs, ...staticDocs].filter((d) => {
    if (seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });
}

export const MARKETPLACE_SAMPLE_QUERIES = [
  "low-cost PDF summary workflow",
  "enterprise risk review agent",
  "Groq-first model routing policy",
  "GitHub issue triage tool stack",
] as const;

export const MEMORY_SAMPLE_QUERIES = [
  "lean agent cost summary",
  "enterprise risk review constitution",
  "groq routing savings",
  "tournament evidence marketplace",
] as const;
