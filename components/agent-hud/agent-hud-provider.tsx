"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { aggregateAgentDetail, aggregateOverview } from "@/lib/agent-hud/aggregators/overview";
import { AgentHudStore } from "@/lib/agent-hud/store";
import type { AgentHudDetail, AgentHudFilters, AgentHudStoreData } from "@/lib/agent-hud/types";

type AgentHudContextValue = {
  data: AgentHudStoreData;
  filters: AgentHudFilters;
  refresh: () => void;
  setFilters: (patch: Partial<AgentHudFilters>) => void;
  resetFilters: () => void;
  getOverview: () => ReturnType<typeof aggregateOverview>;
  getDetail: (agentId: string) => AgentHudDetail | null;
};

const AgentHudContext = createContext<AgentHudContextValue | null>(null);

export function AgentHudProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new AgentHudStore());
  const [data, setData] = useState<AgentHudStoreData>(() => store.getData());
  const [filters, setFiltersState] = useState<AgentHudFilters>(() => store.getFilters());

  const refresh = useCallback(() => {
    store.refresh();
    setData(store.getData());
    setFiltersState(store.getFilters());
  }, [store]);

  const setFilters = useCallback(
    (patch: Partial<AgentHudFilters>) => {
      store.setFilters(patch);
      setFiltersState(store.getFilters());
    },
    [store],
  );

  const resetFilters = useCallback(() => {
    store.resetFilters();
    setFiltersState(store.getFilters());
  }, [store]);

  const getOverview = useCallback(() => {
    return aggregateOverview(data, filters);
  }, [data, filters]);

  const getDetail = useCallback(
    (agentId: string) => aggregateAgentDetail(data, agentId),
    [data],
  );

  const value = useMemo(
    () => ({
      data,
      filters,
      refresh,
      setFilters,
      resetFilters,
      getOverview,
      getDetail,
    }),
    [data, filters, refresh, setFilters, resetFilters, getOverview, getDetail],
  );

  return <AgentHudContext.Provider value={value}>{children}</AgentHudContext.Provider>;
}

export function useAgentHud(): AgentHudContextValue {
  const ctx = useContext(AgentHudContext);
  if (!ctx) throw new Error("useAgentHud must be used within AgentHudProvider");
  return ctx;
}
