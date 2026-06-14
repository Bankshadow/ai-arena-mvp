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

import { searchMarketplaceSemantic } from "@/lib/vector/marketplace-search";
import { searchMemorySemantic } from "@/lib/vector/memory-search";
import { VectorStore, type VectorStoreData } from "@/lib/vector/store";
import type {
  MarketplaceSemanticSearchResult,
  MemorySemanticSearchResult,
  VectorCollection,
  VectorIndexJob,
  VectorSearchResult,
} from "@/lib/vector/types";

type VectorContextValue = {
  data: VectorStoreData;
  collections: VectorCollection[];
  ready: boolean;
  refresh: () => Promise<void>;
  search: (query: string, collections?: import("@/lib/vector/types").VectorCollectionName[]) => Promise<VectorSearchResult>;
  searchMemory: (query: string) => Promise<MemorySemanticSearchResult>;
  searchMarketplace: (query: string) => Promise<MarketplaceSemanticSearchResult>;
  rebuildIndex: () => Promise<VectorIndexJob>;
};

const VectorContext = createContext<VectorContextValue | null>(null);

export function VectorProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new VectorStore());
  const [data, setData] = useState<VectorStoreData>(() => store.getData());
  const [collections, setCollections] = useState<VectorCollection[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    await store.seedIfEmpty();
    setData(store.getData());
    const cols = await store.service.getAllCollections();
    setCollections(cols);
    setReady(true);
  }, [store]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const search = useCallback(
    async (query: string, cols?: import("@/lib/vector/types").VectorCollectionName[]) => {
      return store.service.search({ text: query, collections: cols });
    },
    [store],
  );

  const searchMemory = useCallback(
    (query: string) => searchMemorySemantic(query, store.service),
    [store],
  );

  const searchMarketplace = useCallback(
    (query: string) => searchMarketplaceSemantic(query, store.service),
    [store],
  );

  const rebuildIndex = useCallback(async () => {
    const job = await store.rebuildIndex();
    await refresh();
    return job;
  }, [store, refresh]);

  const value = useMemo(
    () => ({
      data,
      collections,
      ready,
      refresh,
      search,
      searchMemory,
      searchMarketplace,
      rebuildIndex,
    }),
    [data, collections, ready, refresh, search, searchMemory, searchMarketplace, rebuildIndex],
  );

  return <VectorContext.Provider value={value}>{children}</VectorContext.Provider>;
}

export function useVector(): VectorContextValue {
  const ctx = useContext(VectorContext);
  if (!ctx) throw new Error("useVector must be used within VectorProvider");
  return ctx;
}
