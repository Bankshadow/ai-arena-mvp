import { newId } from "@/lib/tournament/engine-mock";
import type { MemoryKnowledgeBase } from "@/lib/memory/store";
import type {
  AgentLesson,
  ConstitutionUpdateProposal,
  MemoryArticle,
  MemoryArticleLink,
  MemoryLog,
  StrategyRecommendation,
} from "@/lib/memory/types";

const NOW = "2026-06-10T10:00:00.000Z";

/** Seed knowledge base for demo / SSR when no tournament has compiled yet. */
export function seedKnowledgeBase(): MemoryKnowledgeBase {
  const articles: MemoryArticle[] = [
    {
      id: "art-lean-cost-pattern",
      slug: "lean-cost-pattern-r3",
      article_type: "cost_insight",
      title: "Lean Operator maintains lowest cost tier with v1.2 checklist",
      summary: "Self-review protocol reduces rework tokens by ~6% in mock tournaments.",
      body: "Across 12 rounds, Lean Operator averaged $0.0018/run when constitution v1.2 was active.",
      confidence: 0.88,
      tags: ["lean", "cost", "v1.2"],
      agent_ids: ["lean"],
      tournament_id: "tournament-default",
      round: 3,
      evidence_ids: [],
      source_compile_run_id: "run-seed-1",
      created_at: NOW,
      updated_at: NOW,
    },
    {
      id: "art-groq-routing",
      slug: "groq-routing-savings-r3",
      article_type: "model_routing_insight",
      title: "Groq-first routing saves 40–60% vs all-Claude baseline",
      summary: "Use groq_free for agent loop; mock final judge until quality tier enabled.",
      body: "Rate limit guard recommended proceed at 5 competitors with GROQ_API_KEY set.",
      confidence: 0.79,
      tags: ["groq", "routing"],
      agent_ids: [],
      tournament_id: "tournament-default",
      round: 3,
      evidence_ids: [],
      source_compile_run_id: "run-seed-1",
      created_at: NOW,
      updated_at: NOW,
    },
    {
      id: "art-premium-failure",
      slug: "premium-overcost-r2",
      article_type: "failure_mode",
      title: "Premium Analyst overcost under tight cost caps",
      summary: "High quality scores negated by cost limit penalties in lean-focused challenges.",
      body: "When challenge costLimitUsd < 0.01, premium runs trigger -10 costLimitPenalty.",
      confidence: 0.74,
      tags: ["premium", "failure"],
      agent_ids: ["premium"],
      tournament_id: "tournament-default",
      round: 2,
      evidence_ids: [],
      source_compile_run_id: "run-seed-1",
      created_at: NOW,
      updated_at: NOW,
    },
  ];

  const links: MemoryArticleLink[] = [
    {
      id: "link-1",
      from_article_id: "art-premium-failure",
      to_article_id: "art-lean-cost-pattern",
      link_type: "contradicts",
      created_at: NOW,
    },
  ];

  const lessons: AgentLesson[] = [
    {
      id: "lesson-lean-strength",
      agent_id: "lean",
      agent_name: "Lean Operator",
      lesson_type: "strength",
      title: "Cost leader in executive summary battles",
      content: "Consistently lowest tokens and cost in field.",
      confidence: 0.85,
      tournament_id: "tournament-default",
      round: 3,
      article_id: "art-lean-cost-pattern",
      stale: false,
      created_at: NOW,
      updated_at: NOW,
    },
    {
      id: "lesson-lean-change",
      agent_id: "lean",
      agent_name: "Lean Operator",
      lesson_type: "recommended_change",
      title: "Promote v1.2 self-review to default",
      content: "Tournament evidence supports mandatory checklist.",
      confidence: 0.8,
      tournament_id: "tournament-default",
      round: 3,
      article_id: "art-lean-cost-pattern",
      stale: false,
      created_at: NOW,
      updated_at: NOW,
    },
    {
      id: "lesson-premium-weak",
      agent_id: "premium",
      agent_name: "Premium Analyst",
      lesson_type: "weakness",
      title: "Cost cap sensitivity",
      content: "Underperforms when costLimitUsd is tight.",
      confidence: 0.72,
      tournament_id: "tournament-default",
      round: 2,
      article_id: "art-premium-failure",
      stale: false,
      created_at: NOW,
      updated_at: NOW,
    },
  ];

  const proposals: ConstitutionUpdateProposal[] = [
    {
      id: "prop-lean-v13",
      agent_id: "lean",
      agent_name: "Lean Operator",
      constitution_id: "const-lean-operator",
      current_version: "v1.2",
      proposed_version: "v1.3",
      field_changes: [
        {
          field: "selfReviewProtocol",
          before: "Mandatory checklist",
          after: "Checklist + token estimate log",
          rationale: "Memory compiler: 3 rounds of evidence",
        },
      ],
      status: "pending_review",
      confidence: 0.8,
      article_id: "art-lean-cost-pattern",
      tournament_id: "tournament-default",
      round: 3,
      created_at: NOW,
    },
  ];

  const recommendations: StrategyRecommendation[] = [
    {
      id: "rec-lean-default",
      title: "Default Lean v1.2 for batch loops",
      recommendation: "Set Lean Operator v1.2 as default competitor constitution.",
      rationale: "Cost insight article + 47 mock tournament runs.",
      priority: "high",
      agent_id: "lean",
      article_id: "art-lean-cost-pattern",
      tournament_id: "tournament-default",
      created_at: NOW,
    },
  ];

  const logs: MemoryLog[] = [
    {
      id: "log-seed-1",
      tournament_id: "tournament-default",
      round: 3,
      log_date: "2026-06-10",
      title: "Tournament log — Round 3",
      summary: "Lean Operator won with 84 pts on Q4 Board Risk Brief.",
      event_count: 8,
      winner_agent_id: "lean",
      winner_score: 84,
      challenge_title: "Q4 Board Risk Brief",
      payload: {},
      created_at: NOW,
    },
  ];

  return {
    events: [],
    logs,
    articles,
    links,
    lessons,
    recommendations,
    proposals,
    compileRuns: [
      {
        id: "run-seed-1",
        tournament_id: "tournament-default",
        round: 3,
        status: "complete",
        articles_created: 3,
        lessons_updated: 3,
        proposals_generated: 1,
        evidence_notes_created: 0,
        started_at: NOW,
        completed_at: NOW,
        error: null,
      },
    ],
    evidenceNotes: [],
    lastLintReport: null,
  };
}

export function mergeWithSeed(kb: MemoryKnowledgeBase): MemoryKnowledgeBase {
  if (kb.articles.length > 0) return kb;
  return seedKnowledgeBase();
}
