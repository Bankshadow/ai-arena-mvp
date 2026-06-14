import { seedResearchKnowledgeBase, type ResearchKnowledgeBase } from "@/lib/research/mock-data";
import type { ResearchQuery, ResearchQueryResult, ResearchReport, ResearchTrace } from "@/lib/research/types";
import type { ResearchDashboardStats } from "@/lib/research/types";

const STORE_KEY = "ai-arena-research-kb";

export type ResearchStoreData = ResearchKnowledgeBase & {
  queryHistory: ResearchQuery[];
  traceHistory: ResearchTrace[];
};

function emptyStore(): ResearchStoreData {
  return { ...seedResearchKnowledgeBase(), queryHistory: [], traceHistory: [] };
}

export class ResearchStore {
  private data: ResearchStoreData;

  constructor() {
    this.data = emptyStore();
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as ResearchStoreData;
          if (parsed.evidence?.length) this.data = parsed;
        }
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

  getData(): ResearchStoreData {
    return JSON.parse(JSON.stringify(this.data)) as ResearchStoreData;
  }

  seedIfEmpty(): void {
    if (this.data.evidence.length === 0 || this.data.reports[0]?.id !== "report-weekly-tournament") {
      this.data = emptyStore();
      this.persist();
    }
  }

  addQueryResult(result: ResearchQueryResult): ResearchStoreData {
    this.data.queryHistory = [result.query, ...this.data.queryHistory].slice(0, 50);
    this.data.traceHistory = [result.trace, ...this.data.traceHistory].slice(0, 50);
    this.data.traces = [result.trace, ...this.data.traces].slice(0, 20);
    this.data.queries = [result.query, ...this.data.queries].slice(0, 20);
    this.persist();
    return this.getData();
  }

  getReportById(id: string): ResearchReport | undefined {
    return this.data.reports.find((r) => r.id === id);
  }

  getDashboardStats(): ResearchDashboardStats {
    const enabled = this.data.sources.filter((s) => s.enabled);
    return {
      searchable_sources: enabled.length,
      indexed_records: this.data.documents.length,
      evidence_items: this.data.evidence.length,
      research_reports: this.data.reports.length,
      stale_sources: enabled.filter((s) => s.freshness_status === "stale" || s.freshness_status === "aging").length,
      knowledge_gaps: this.data.knowledgeGaps.length,
    };
  }
}

let _serverData: ResearchStoreData | null = null;

export function getServerResearchData(): ResearchStoreData {
  if (!_serverData) {
    _serverData = emptyStore();
  }
  return JSON.parse(JSON.stringify(_serverData)) as ResearchStoreData;
}

export function getServerReport(id: string): ResearchReport | undefined {
  return getServerResearchData().reports.find((r) => r.id === id);
}
