import { newId } from "@/lib/tournament/engine-mock";
import { computeCompositeScore } from "@/lib/research/retrieval/composite-score";
import { MOCK_KNOWLEDGE_SOURCES } from "@/lib/research/registry/sources";
import { buildReportTemplates } from "@/lib/research/reports/templates";
import type {
  DocumentChunk,
  EvidenceItem,
  EvidenceLink,
  IndexedDocument,
  KnowledgeGap,
  ResearchQuery,
  ResearchTrace,
} from "@/lib/research/types";

const NOW = "2026-06-14T12:00:00.000Z";
const AGENT = "deep-research";

function ev(
  id: string,
  partial: Omit<EvidenceItem, "id" | "composite_score" | "retrieved_by_agent_id" | "created_at">,
): EvidenceItem {
  const composite = computeCompositeScore(
    partial.relevance_score,
    partial.confidence_score,
    partial.freshness_score,
    partial.reliability_score,
  );
  return {
    id,
    retrieved_by_agent_id: AGENT,
    composite_score: composite,
    created_at: NOW,
    ...partial,
  };
}

export function seedEvidenceItems(): EvidenceItem[] {
  return [
    ev("ev-lean-r42", {
      source_type: "agent_runs",
      source_id: "run-lean-r42",
      title: "Lean Agent — Round 42 executive summary",
      summary: "Lean Agent won cost-capped summary challenge at $0.0018 / 1.4K tokens.",
      quote_or_excerpt:
        "Final score 84 (quality 82, efficiency 91). Output met brief in 1.2s on Groq llama-3.3-70b.",
      relevance_score: 0.92,
      confidence_score: 0.88,
      freshness_score: 0.95,
      reliability_score: 0.92,
      used_in_report_id: null,
      deep_link: "/agents/lean",
      tags: ["lean", "cost", "summary", "groq"],
    }),
    ev("ev-eval-lean-r42", {
      source_type: "evaluations",
      source_id: "eval-lean-r42",
      title: "Judge evaluation — Lean vs Premium (Round 42)",
      summary: "Efficiency judge ranked Lean +9 pts on cost-capped task.",
      quote_or_excerpt:
        "Premium quality 88 vs Lean 82, but efficiency gap -14 under $0.003 cap favored Lean overall.",
      relevance_score: 0.9,
      confidence_score: 0.85,
      freshness_score: 0.93,
      reliability_score: 0.9,
      used_in_report_id: null,
      deep_link: "/tournament",
      tags: ["premium", "lean", "cost-capped", "evaluation"],
    }),
    ev("ev-lb-lean", {
      source_type: "leaderboard_entries",
      source_id: "lb-lean",
      title: "Lean Agent leaderboard — 14-day window",
      summary: "Win rate 34% forecast rising; avg score 81; cost rank #1.",
      quote_or_excerpt: "Top performer on summary and ops-brief categories when cost cap ≤ $0.004.",
      relevance_score: 0.88,
      confidence_score: 0.82,
      freshness_score: 0.85,
      reliability_score: 0.88,
      used_in_report_id: null,
      deep_link: "/leaderboard",
      tags: ["lean", "win-rate", "leaderboard"],
    }),
    ev("ev-mem-cost", {
      source_type: "memory_articles",
      source_id: "art-cost-insight-1",
      title: "Cost insight: Groq-first summary stacks",
      summary: "Memory Compiler notes 40% cost reduction vs premium path on summary tasks.",
      quote_or_excerpt:
        "When challenge type is executive summary with tight cap, lean + groq_free routing wins 73% of rounds.",
      relevance_score: 0.86,
      confidence_score: 0.8,
      freshness_score: 0.78,
      reliability_score: 0.85,
      used_in_report_id: null,
      deep_link: "/memory/articles",
      tags: ["cost", "groq", "summary", "routing"],
    }),
    ev("ev-mkt-lean-const", {
      source_type: "marketplace_components",
      source_id: "lean-constitution-v2",
      title: "Lean Agent Constitution v2",
      summary: "Arena Score 87; tournament-tested; best for cost efficiency category.",
      quote_or_excerpt:
        "14 tournament runs, win rate 58%, avg cost $0.0021. Recommended for ops briefs and summaries.",
      relevance_score: 0.84,
      confidence_score: 0.86,
      freshness_score: 0.72,
      reliability_score: 0.82,
      used_in_report_id: null,
      deep_link: "/marketplace/lean-constitution-v2",
      tags: ["marketplace", "lean", "constitution", "evidence"],
    }),
    ev("ev-mkt-groq-policy", {
      source_type: "marketplace_components",
      source_id: "groq-cost-policy",
      title: "Groq Cost Policy Pack",
      summary: "Strongest tournament evidence for cost-capped workflows — Arena Score 91.",
      quote_or_excerpt:
        "Highest battle + cost_efficiency subscores. 18 tournament runs, avg score 83, avg cost $0.0019.",
      relevance_score: 0.91,
      confidence_score: 0.9,
      freshness_score: 0.75,
      reliability_score: 0.82,
      used_in_report_id: null,
      deep_link: "/marketplace/groq-cost-policy",
      tags: ["marketplace", "evidence", "cost", "groq"],
    }),
    ev("ev-premium-r42", {
      source_type: "agent_runs",
      source_id: "run-premium-r42",
      title: "Premium Agent — Round 42 under cost cap",
      summary: "Premium exceeded cost cap; quality high but efficiency penalty applied.",
      quote_or_excerpt: "Cost $0.0048 vs cap $0.003. Quality 88 but final rank #3 after efficiency judge.",
      relevance_score: 0.89,
      confidence_score: 0.87,
      freshness_score: 0.94,
      reliability_score: 0.92,
      used_in_report_id: null,
      deep_link: "/agents/premium",
      tags: ["premium", "cost-cap", "failure"],
    }),
    ev("ev-mem-failure-premium", {
      source_type: "memory_articles",
      source_id: "art-failure-premium",
      title: "Failure mode: Premium under tight caps",
      summary: "Premium Agent loses when efficiency weight > 35% and cap < $0.004.",
      quote_or_excerpt:
        "Anthropic path adds polish tokens; under cap, truncation hurts quality less than cost overrun hurts score.",
      relevance_score: 0.93,
      confidence_score: 0.84,
      freshness_score: 0.8,
      reliability_score: 0.85,
      used_in_report_id: null,
      deep_link: "/memory/articles",
      tags: ["premium", "lean", "failure", "cost-capped"],
    }),
    ev("ev-forecast-routing", {
      source_type: "forecast_runs",
      source_id: "forecast-routing",
      title: "Forecast: Groq-first routing savings",
      summary: "Provider Cost Optimization forecast: mock+groq hybrid saves ~38% vs all-premium.",
      quote_or_excerpt:
        "7-day projection: $4.82 lean path vs $7.80 premium path at same round volume.",
      relevance_score: 0.87,
      confidence_score: 0.72,
      freshness_score: 0.9,
      reliability_score: 0.7,
      used_in_report_id: null,
      deep_link: "/forecasting",
      tags: ["routing", "groq", "cost", "forecast"],
    }),
    ev("ev-mem-routing", {
      source_type: "memory_articles",
      source_id: "art-routing-insight",
      title: "Model routing insight: hybrid_quality final judge",
      summary: "Using mock competitors + Groq creators + mock final judge saved 41% in week 24.",
      quote_or_excerpt: "Reserve Anthropic for polish-only when ROI > 2x quality delta.",
      relevance_score: 0.85,
      confidence_score: 0.79,
      freshness_score: 0.76,
      reliability_score: 0.85,
      used_in_report_id: null,
      deep_link: "/memory/articles",
      tags: ["routing", "provider", "cost", "hybrid"],
    }),
    ev("ev-tool-minimal", {
      source_type: "tool_call_logs",
      source_id: "log-minimal-tool-r5",
      title: "Minimal Tool Agent — Round 5 verification pass",
      summary: "100% tool calls verified; 0 permission denials; lowest latency stack.",
      quote_or_excerpt: "6/6 required tools invoked correctly. Verification Agent score 94.",
      relevance_score: 0.9,
      confidence_score: 0.88,
      freshness_score: 0.92,
      reliability_score: 0.78,
      used_in_report_id: null,
      deep_link: "/tool-arena",
      tags: ["tool-arena", "reliability", "minimal-tool"],
    }),
    ev("ev-tool-rag", {
      source_type: "tool_call_logs",
      source_id: "log-rag-tool-r3",
      title: "RAG Tool Agent — permission retry pattern",
      summary: "2 permission denials recovered via dry-run; reliability score 78.",
      quote_or_excerpt: "Failed calendar write on first attempt; succeeded after policy downgrade.",
      relevance_score: 0.75,
      confidence_score: 0.8,
      freshness_score: 0.88,
      reliability_score: 0.78,
      used_in_report_id: null,
      deep_link: "/tool-arena",
      tags: ["tool-arena", "rag", "permissions"],
    }),
    ev("ev-eval-tool", {
      source_type: "evaluations",
      source_id: "eval-tool-reliability",
      title: "Tool Arena reliability benchmark",
      summary: "Minimal Tool stack highest verification pass rate across 6 challenges.",
      quote_or_excerpt: "Pass rate 94% vs RAG 78% vs Full-Stack 71% on same challenge set.",
      relevance_score: 0.88,
      confidence_score: 0.86,
      freshness_score: 0.9,
      reliability_score: 0.9,
      used_in_report_id: null,
      deep_link: "/tools",
      tags: ["tool-arena", "reliability", "stack"],
    }),
    ev("ev-tournament-r42", {
      source_type: "tournaments",
      source_id: "tournament-r42",
      title: "Tournament Round 42 summary",
      summary: "Cost-capped executive summary; Lean winner; 4 competitors; Groq path.",
      quote_or_excerpt: "Challenge: Q4 Board Risk Brief. Winner lean @ 84 pts. Total round cost $0.011.",
      relevance_score: 0.8,
      confidence_score: 0.9,
      freshness_score: 0.96,
      reliability_score: 0.95,
      used_in_report_id: null,
      deep_link: "/tournaments",
      tags: ["tournament", "round", "summary"],
    }),
    ev("ev-chal-summary", {
      source_type: "challenges",
      source_id: "chal-exec-summary",
      title: "Executive summary challenge template",
      summary: "Most frequent challenge type in cost-efficiency tournaments.",
      quote_or_excerpt: "Avg 1.8K tokens, cap $0.004, efficiency weight 40%.",
      relevance_score: 0.7,
      confidence_score: 0.85,
      freshness_score: 0.8,
      reliability_score: 0.9,
      used_in_report_id: null,
      deep_link: "/challenge/executive-summary-battle",
      tags: ["challenge", "summary", "cost"],
    }),
  ];
}

export function seedEvidenceLinks(evidence: EvidenceItem[]): EvidenceLink[] {
  const byTag = (tag: string) => evidence.find((e) => e.tags.includes(tag));
  const lean = evidence.find((e) => e.source_id === "run-lean-r42");
  const premium = evidence.find((e) => e.source_id === "run-premium-r42");
  const failure = evidence.find((e) => e.source_id === "art-failure-premium");
  if (!lean || !premium || !failure) return [];

  return [
    {
      id: newId(),
      from_evidence_id: failure.id,
      to_evidence_id: lean.id,
      link_type: "supports",
      strength: 0.85,
      created_at: NOW,
    },
    {
      id: newId(),
      from_evidence_id: premium.id,
      to_evidence_id: failure.id,
      link_type: "extends",
      strength: 0.9,
      created_at: NOW,
    },
    {
      id: newId(),
      from_evidence_id: byTag("groq-cost-policy")?.id ?? lean.id,
      to_evidence_id: lean.id,
      link_type: "same_entity",
      strength: 0.75,
      created_at: NOW,
    },
  ];
}

export function seedIndexedDocuments(): IndexedDocument[] {
  return MOCK_KNOWLEDGE_SOURCES.filter((s) => s.enabled).flatMap((source, i) => [
    {
      id: newId(),
      source_id: source.id,
      source_type: source.source_type,
      source_record_id: `${source.source_type}-doc-${i}`,
      title: `${source.name} — index snapshot`,
      body: source.description,
      metadata: { record_count: source.record_count },
      indexed_at: source.last_indexed_at ?? NOW,
    },
  ]);
}

export function seedDocumentChunks(docs: IndexedDocument[]): DocumentChunk[] {
  return docs.map((doc, i) => ({
    id: newId(),
    document_id: doc.id,
    chunk_index: 0,
    content: doc.body,
    token_count: Math.ceil(doc.body.length / 4),
    metadata: { source_type: doc.source_type },
  }));
}

export function seedKnowledgeGaps(): KnowledgeGap[] {
  return [
    {
      id: newId(),
      topic: "Enterprise private tournaments",
      description: "No indexed enterprise-only round data yet.",
      suggested_sources: ["tournaments", "evaluations"],
      severity: "medium",
    },
    {
      id: newId(),
      topic: "Uploaded document corpus",
      description: "uploaded_documents source disabled — no user docs indexed.",
      suggested_sources: ["uploaded_documents"],
      severity: "low",
    },
    {
      id: newId(),
      topic: "Cross-provider latency baselines",
      description: "Limited OpenAI run samples in last 7 days.",
      suggested_sources: ["agent_runs", "forecast_runs"],
      severity: "high",
    },
  ];
}

export function seedRecentTraces(evidence: EvidenceItem[]): ResearchTrace[] {
  const evIds = evidence.slice(0, 4).map((e) => e.id);
  return [
    {
      id: newId(),
      query_id: newId(),
      agent_id: AGENT,
      agent_name: "Deep Research Agent",
      status: "complete",
      total_evidence_retrieved: 6,
      total_evidence_used: 4,
      started_at: "2026-06-14T11:30:00.000Z",
      completed_at: "2026-06-14T11:30:02.400Z",
      steps: [
        {
          id: newId(),
          step_index: 0,
          phase: "decomposing",
          action: "Split question into sub-queries",
          input_summary: "Which agent is best for low-cost summary?",
          output_summary: "3 sub-queries: agent ranking, cost runs, memory insights",
          evidence_ids: [],
          duration_ms: 120,
          created_at: "2026-06-14T11:30:00.120Z",
        },
        {
          id: newId(),
          step_index: 1,
          phase: "selecting_sources",
          action: "Select knowledge sources",
          input_summary: "Sub-queries mapped to agent_runs, evaluations, memory",
          output_summary: "4 sources selected, uploads/web skipped",
          evidence_ids: [],
          duration_ms: 80,
          created_at: "2026-06-14T11:30:00.200Z",
        },
        {
          id: newId(),
          step_index: 2,
          phase: "retrieving",
          action: "Mock retrieval search",
          input_summary: "Keyword match over evidence pool",
          output_summary: "6 candidates retrieved",
          evidence_ids: evIds,
          duration_ms: 450,
          created_at: "2026-06-14T11:30:00.650Z",
        },
        {
          id: newId(),
          step_index: 3,
          phase: "evaluating",
          action: "Score evidence quality",
          input_summary: "6 candidates",
          output_summary: "4 passed composite threshold ≥ 0.45",
          evidence_ids: evIds,
          duration_ms: 200,
          created_at: "2026-06-14T11:30:00.850Z",
        },
        {
          id: newId(),
          step_index: 4,
          phase: "reasoning",
          action: "Synthesize answer",
          input_summary: "Top 4 evidence items",
          output_summary: "Lean Agent recommended with confidence 0.86",
          evidence_ids: evIds.slice(0, 3),
          duration_ms: 300,
          created_at: "2026-06-14T11:30:01.150Z",
        },
        {
          id: newId(),
          step_index: 5,
          phase: "reporting",
          action: "Format response",
          input_summary: "Answer + citations",
          output_summary: "Query result stored",
          evidence_ids: evIds.slice(0, 3),
          duration_ms: 150,
          created_at: "2026-06-14T11:30:02.400Z",
        },
      ],
    },
  ];
}

export function seedRecentQueries(): ResearchQuery[] {
  return [
    {
      id: newId(),
      question: "Which agent is best for low-cost summary challenges?",
      scope: ["agent_runs", "evaluations", "memory_articles"],
      asked_by: "user",
      status: "complete",
      answer_summary: "Lean Agent is the strongest choice for low-cost summary challenges.",
      confidence_score: 0.86,
      limitations: ["Sample size: last 14 rounds only", "Forecast data is mock"],
      follow_up_questions: [
        "How does Lean perform when quality weight exceeds 60%?",
        "Compare Lean vs Safety-First on compliance summaries",
      ],
      evidence_ids: [],
      trace_id: null,
      report_id: null,
      created_at: "2026-06-14T11:30:00.000Z",
      completed_at: "2026-06-14T11:30:02.400Z",
    },
  ];
}

export type ResearchKnowledgeBase = {
  sources: typeof MOCK_KNOWLEDGE_SOURCES;
  documents: IndexedDocument[];
  chunks: DocumentChunk[];
  evidence: EvidenceItem[];
  evidenceLinks: EvidenceLink[];
  reports: ReturnType<typeof buildReportTemplates>;
  queries: ResearchQuery[];
  traces: ResearchTrace[];
  knowledgeGaps: KnowledgeGap[];
  recommendations: string[];
};

export function seedResearchKnowledgeBase(): ResearchKnowledgeBase {
  const evidence = seedEvidenceItems();
  const reports = buildReportTemplates(evidence);
  evidence.forEach((e, i) => {
    if (i < 8) e.used_in_report_id = "report-weekly-tournament";
  });

  return {
    sources: MOCK_KNOWLEDGE_SOURCES,
    documents: seedIndexedDocuments(),
    chunks: seedDocumentChunks(seedIndexedDocuments()),
    evidence,
    evidenceLinks: seedEvidenceLinks(evidence),
    reports,
    queries: seedRecentQueries(),
    traces: seedRecentTraces(evidence),
    knowledgeGaps: seedKnowledgeGaps(),
    recommendations: [
      "Adopt Lean Agent + Groq Cost Policy for summary workflows under $0.004 cap",
      "List groq-cost-policy on marketplace — strongest tournament evidence (Arena Score 91)",
      "Run constitution battle for Premium Agent before enterprise cost-capped deployments",
      "Route Tool Arena reliability tasks to Minimal Tool stack (94% verification pass rate)",
    ],
  };
}

export const SAMPLE_QUESTIONS = [
  "Which agent is best for low-cost summary challenges?",
  "Which marketplace component has the strongest tournament evidence?",
  "Why did Premium Agent lose to Lean Agent in cost-capped tasks?",
  "Which provider routing strategy saved the most cost?",
  "Which tool workflow stack is most reliable?",
] as const;
