import { newId } from "@/lib/tournament/engine-mock";
import { mockRetrievalAdapter } from "@/lib/research/retrieval/mock-adapter";
import type { ResearchKnowledgeBase } from "@/lib/research/mock-data";
import type {
  EvidenceItem,
  ResearchQuery,
  ResearchQueryResult,
  ResearchTrace,
  ResearchTraceStep,
} from "@/lib/research/types";

const AGENT_ID = "deep-research";
const AGENT_NAME = "Deep Research Agent";

type QueryHandler = {
  match: (q: string) => boolean;
  answer: string;
  confidence: number;
  limitations: string[];
  followUps: string[];
  evidenceFilter: (e: EvidenceItem) => boolean;
  extraQuery?: string;
};

const HANDLERS: QueryHandler[] = [
  {
    match: (q) => /low.?cost|summary|best agent/i.test(q),
    answer:
      "Lean Agent is the strongest choice for low-cost summary challenges. Tournament evidence shows win rate leadership on executive summary tasks under $0.004 caps, with avg cost ~$0.0021 and efficiency judge scores consistently above Premium when cost weight ≥ 35%.",
    confidence: 0.86,
    limitations: [
      "Based on last 14 rounds of mock tournament data",
      "Premium may win when quality-only judging is used",
    ],
    followUps: [
      "How does Lean perform when quality weight exceeds 60%?",
      "Compare Lean vs Safety-First on compliance summaries",
    ],
    evidenceFilter: (e) =>
      e.tags.some((t) => ["lean", "summary", "cost"].includes(t)) ||
      e.source_id === "run-lean-r42",
    extraQuery: "lean cost summary agent runs evaluations",
  },
  {
    match: (q) => /marketplace|strongest.*evidence|component/i.test(q),
    answer:
      "Groq Cost Policy Pack has the strongest tournament evidence among marketplace components — Arena Score 91, 18 tournament runs, avg score 83, and avg cost $0.0019. Lean Agent Constitution v2 ranks second for agent artifacts (Arena Score 87).",
    confidence: 0.88,
    limitations: ["Marketplace index last refreshed 2026-06-13", "Community listings excluded"],
    followUps: [
      "Which stack export bundles groq-cost-policy?",
      "What are known failure cases for groq-cost-policy?",
    ],
    evidenceFilter: (e) => e.source_type === "marketplace_components",
    extraQuery: "marketplace arena score tournament evidence groq cost policy",
  },
  {
    match: (q) => /premium.*lose|lose.*lean|cost.?cap/i.test(q),
    answer:
      "Premium Agent lost to Lean Agent in cost-capped tasks because Premium exceeded the $0.003 cap ($0.0048 actual) while Lean stayed under cap at $0.0018. Quality was higher for Premium (88 vs 82) but the efficiency judge applied a -14 pt penalty, and Lean's final score (84) beat Premium's adjusted rank.",
    confidence: 0.91,
    limitations: [
      "Single round deep-dive (Round 42) cited heavily",
      "Judge rubric weights may vary by challenge",
    ],
    followUps: [
      "Would Premium win with a higher cost cap?",
      "Show memory articles on Premium failure modes",
    ],
    evidenceFilter: (e) =>
      e.tags.some((t) => ["premium", "lean", "cost-cap", "failure"].includes(t)),
    extraQuery: "premium lean cost cap evaluation failure",
  },
  {
    match: (q) => /routing|provider|saved.*cost|cost.*saved/i.test(q),
    answer:
      "The hybrid routing strategy — mock competitors + Groq creators + mock final judge — saved the most cost in platform evidence (~38–41% vs all-premium). Forecast runs project $4.82 vs $7.80 over 7 days at current loop volume.",
    confidence: 0.79,
    limitations: ["Forecast data is mock", "Savings vary by round frequency and competitor count"],
    followUps: [
      "What is Groq rate limit risk at current loop settings?",
      "When should hybrid_quality final judge be enabled?",
    ],
    evidenceFilter: (e) => e.tags.some((t) => ["routing", "groq", "cost", "forecast", "hybrid"].includes(t)),
    extraQuery: "provider routing groq hybrid cost forecast savings",
  },
  {
    match: (q) => /tool|workflow|reliable|reliability/i.test(q),
    answer:
      "The Minimal Tool Agent workflow stack is the most reliable in Tool Arena benchmarks — 94% verification pass rate, 0 permission denials in the latest round, and highest verification agent score. RAG Tool Agent recovers from permission errors but scores 78% reliability.",
    confidence: 0.87,
    limitations: ["Tool Arena uses mock executor — not production APIs", "Sample: 6 challenges"],
    followUps: [
      "Which tools does Minimal Tool stack require?",
      "Compare Full-Stack agent permission failure rate",
    ],
    evidenceFilter: (e) => e.tags.some((t) => ["tool-arena", "reliability", "minimal-tool"].includes(t)),
    extraQuery: "tool arena reliability minimal verification stack",
  },
];

function pickHandler(question: string): QueryHandler {
  const normalized = question.trim();
  return HANDLERS.find((h) => h.match(normalized)) ?? HANDLERS[0]!;
}

function buildTrace(queryId: string, evidence: EvidenceItem[], handler: QueryHandler): ResearchTrace {
  const now = Date.now();
  const evIds = evidence.map((e) => e.id);

  const steps: ResearchTraceStep[] = [
    {
      id: newId(),
      step_index: 0,
      phase: "decomposing",
      action: "Decompose research question",
      input_summary: handler.extraQuery ?? "general query",
      output_summary: "2–4 sub-queries mapped to knowledge sources",
      evidence_ids: [],
      duration_ms: 110,
      created_at: new Date(now).toISOString(),
    },
    {
      id: newId(),
      step_index: 1,
      phase: "selecting_sources",
      action: "Select knowledge sources",
      input_summary: "Registry lookup",
      output_summary: "Enabled sources selected; uploads/web skipped",
      evidence_ids: [],
      duration_ms: 70,
      created_at: new Date(now + 70).toISOString(),
    },
    {
      id: newId(),
      step_index: 2,
      phase: "retrieving",
      action: "Mock evidence retrieval",
      input_summary: handler.extraQuery ?? "search",
      output_summary: `${evidence.length} evidence items retrieved`,
      evidence_ids: evIds,
      duration_ms: 420,
      created_at: new Date(now + 140).toISOString(),
    },
    {
      id: newId(),
      step_index: 3,
      phase: "evaluating",
      action: "Evaluate evidence quality",
      input_summary: `${evidence.length} candidates`,
      output_summary: "Composite score threshold applied",
      evidence_ids: evIds,
      duration_ms: 180,
      created_at: new Date(now + 560).toISOString(),
    },
    {
      id: newId(),
      step_index: 4,
      phase: "reasoning",
      action: "Synthesize evidence-backed answer",
      input_summary: "Top ranked evidence",
      output_summary: `Confidence ${handler.confidence}`,
      evidence_ids: evIds.slice(0, 4),
      duration_ms: 250,
      created_at: new Date(now + 740).toISOString(),
    },
    {
      id: newId(),
      step_index: 5,
      phase: "reporting",
      action: "Format query response",
      input_summary: "Answer + citations",
      output_summary: "Research query complete",
      evidence_ids: evIds.slice(0, 4),
      duration_ms: 120,
      created_at: new Date(now + 990).toISOString(),
    },
  ];

  return {
    id: newId(),
    query_id: queryId,
    agent_id: AGENT_ID,
    agent_name: AGENT_NAME,
    status: "complete",
    steps,
    total_evidence_retrieved: evidence.length,
    total_evidence_used: Math.min(4, evidence.length),
    started_at: new Date(now).toISOString(),
    completed_at: new Date(now + 990).toISOString(),
  };
}

export async function runResearchQuery(
  question: string,
  kb: ResearchKnowledgeBase,
): Promise<ResearchQueryResult> {
  const handler = pickHandler(question);
  const searchText = handler.extraQuery ?? question;

  const filtered = kb.evidence.filter(handler.evidenceFilter);
  const retrieval = await mockRetrievalAdapter.search(
    { text: searchText, top_k: 6, min_composite_score: 0.4 },
    filtered.length >= 3 ? filtered : kb.evidence,
  );

  let evidence = retrieval.evidence_candidates;
  if (evidence.length < 3) {
    evidence = kb.evidence
      .filter(handler.evidenceFilter)
      .sort((a, b) => b.composite_score - a.composite_score)
      .slice(0, 5);
  }

  const queryId = newId();
  const trace = buildTrace(queryId, evidence, handler);

  const query: ResearchQuery = {
    id: queryId,
    question: question.trim(),
    scope: [...new Set(evidence.map((e) => e.source_type))],
    asked_by: "user",
    status: "complete",
    answer_summary: handler.answer,
    confidence_score: handler.confidence,
    limitations: handler.limitations,
    follow_up_questions: handler.followUps,
    evidence_ids: evidence.map((e) => e.id),
    trace_id: trace.id,
    report_id: null,
    created_at: trace.started_at,
    completed_at: trace.completed_at,
  };

  return { query, trace, evidence };
}
