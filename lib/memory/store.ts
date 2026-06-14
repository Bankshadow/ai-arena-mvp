import { seedKnowledgeBase } from "@/lib/memory/mock-data";
import type {
  AgentLesson,
  ConstitutionUpdateProposal,
  KnowledgeCompileRun,
  MemoryArticle,
  MemoryArticleLink,
  MemoryLintReport,
  MemoryLog,
  MarketplaceEvidenceNote,
  StrategyRecommendation,
  TournamentMemoryEvent,
  TournamentMemoryMeta,
} from "@/lib/memory/types";

const STORE_KEY = "ai-arena-memory-kb";

export type MemoryKnowledgeBase = {
  events: TournamentMemoryEvent[];
  logs: MemoryLog[];
  articles: MemoryArticle[];
  links: MemoryArticleLink[];
  lessons: AgentLesson[];
  recommendations: StrategyRecommendation[];
  proposals: ConstitutionUpdateProposal[];
  compileRuns: KnowledgeCompileRun[];
  evidenceNotes: MarketplaceEvidenceNote[];
  lastLintReport: MemoryLintReport | null;
};

function emptyKb(): MemoryKnowledgeBase {
  return {
    events: [],
    logs: [],
    articles: [],
    links: [],
    lessons: [],
    recommendations: [],
    proposals: [],
    compileRuns: [],
    evidenceNotes: [],
    lastLintReport: null,
  };
}

/** In-memory + localStorage KB — Supabase-ready interface. */
export class MemoryStore {
  private data: MemoryKnowledgeBase;

  constructor() {
    this.data = emptyKb();
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) this.data = JSON.parse(raw) as MemoryKnowledgeBase;
      } catch {
        /* ignore */
      }
    }
  }

  private persist(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(this.data));
    } catch {
      /* quota */
    }
  }

  getKnowledgeBase(): MemoryKnowledgeBase {
    return JSON.parse(JSON.stringify(this.data)) as MemoryKnowledgeBase;
  }

  mergeCompileResult(result: Partial<MemoryKnowledgeBase>): MemoryKnowledgeBase {
    this.data = {
      ...this.data,
      events: [...result.events ?? [], ...this.data.events].slice(0, 200),
      logs: [...(result.logs ?? []), ...this.data.logs].slice(0, 100),
      articles: [...(result.articles ?? []), ...this.data.articles].slice(0, 150),
      links: [...(result.links ?? []), ...this.data.links].slice(0, 200),
      lessons: [...(result.lessons ?? []), ...this.data.lessons].slice(0, 300),
      recommendations: [...(result.recommendations ?? []), ...this.data.recommendations].slice(0, 50),
      proposals: [...(result.proposals ?? []), ...this.data.proposals].slice(0, 50),
      compileRuns: [...(result.compileRuns ?? []), ...this.data.compileRuns].slice(0, 50),
      evidenceNotes: [...(result.evidenceNotes ?? []), ...this.data.evidenceNotes].slice(0, 100),
      lastLintReport: result.lastLintReport ?? this.data.lastLintReport,
    };
    this.persist();
    return this.getKnowledgeBase();
  }

  setLintReport(report: MemoryLintReport): void {
    this.data.lastLintReport = report;
    this.persist();
  }

  getArticleById(id: string): MemoryArticle | undefined {
    return this.data.articles.find((a) => a.id === id || a.slug === id);
  }

  getArticlesForAgent(agentId: string): MemoryArticle[] {
    return this.data.articles.filter((a) => a.agent_ids.includes(agentId));
  }

  getLessonsForAgent(agentId: string): AgentLesson[] {
    return this.data.lessons.filter((l) => l.agent_id === agentId);
  }

  getPendingProposals(): ConstitutionUpdateProposal[] {
    return this.data.proposals.filter((p) => p.status === "pending_review");
  }
}

/** Server-side seed KB for SSR / API. */
let _serverKb: MemoryKnowledgeBase | null = null;

export function getServerKnowledgeBase(): MemoryKnowledgeBase {
  if (!_serverKb) {
    _serverKb = seedKnowledgeBase();
  }
  return JSON.parse(JSON.stringify(_serverKb)) as MemoryKnowledgeBase;
}

export function metaFromCompile(run: KnowledgeCompileRun): TournamentMemoryMeta {
  return {
    last_compile_run_id: run.id,
    last_log_id: null,
    articles_created: run.articles_created,
    lessons_updated: run.lessons_updated,
    proposals_pending: run.proposals_generated,
    compiled_at: run.completed_at,
  };
}
