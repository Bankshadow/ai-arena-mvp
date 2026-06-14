"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { runResearchQuery } from "@/lib/research/pipeline/research-agent";
import { ResearchStore, type ResearchStoreData } from "@/lib/research/store";
import type { ResearchDashboardStats, ResearchQueryResult } from "@/lib/research/types";

type ResearchContextValue = {
  data: ResearchStoreData;
  stats: ResearchDashboardStats;
  refresh: () => void;
  runQuery: (question: string) => Promise<ResearchQueryResult>;
};

const ResearchContext = createContext<ResearchContextValue | null>(null);

export function ResearchProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new ResearchStore());
  const [data, setData] = useState<ResearchStoreData>(() => store.getData());

  const refresh = useCallback(() => {
    setData(store.getData());
  }, [store]);

  useEffect(() => {
    store.seedIfEmpty();
    refresh();
  }, [store, refresh]);

  const runQuery = useCallback(
    async (question: string) => {
      const result = await runResearchQuery(question, store.getData());
      store.addQueryResult(result);
      refresh();
      return result;
    },
    [store, refresh],
  );

  const stats = useMemo(() => store.getDashboardStats(), [data, store]);

  const value = useMemo(
    () => ({ data, stats, refresh, runQuery }),
    [data, stats, refresh, runQuery],
  );

  return <ResearchContext.Provider value={value}>{children}</ResearchContext.Provider>;
}

export function useResearch(): ResearchContextValue {
  const ctx = useContext(ResearchContext);
  if (!ctx) throw new Error("useResearch must be used within ResearchProvider");
  return ctx;
}
