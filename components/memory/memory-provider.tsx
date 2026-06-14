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

import { mergeWithSeed, seedKnowledgeBase } from "@/lib/memory/mock-data";
import { lintMemoryKnowledgeBase } from "@/lib/memory/linter";
import { runMemoryCompilePipeline } from "@/lib/memory/pipeline";
import { MemoryStore, type MemoryKnowledgeBase } from "@/lib/memory/store";
import type { TournamentState } from "@/lib/tournament/types";

type MemoryContextValue = {
  kb: MemoryKnowledgeBase;
  refresh: () => void;
  mergeFromTournament: (state: TournamentState) => void;
  mergeKb: (slice: Partial<MemoryKnowledgeBase>) => void;
  runLint: () => void;
};

const MemoryContext = createContext<MemoryContextValue | null>(null);

export function MemoryProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new MemoryStore());
  const [kb, setKb] = useState<MemoryKnowledgeBase>(() => mergeWithSeed(store.getKnowledgeBase()));

  const refresh = useCallback(() => {
    setKb(mergeWithSeed(store.getKnowledgeBase()));
  }, [store]);

  useEffect(() => {
    if (store.getKnowledgeBase().articles.length === 0) {
      store.mergeCompileResult(seedKnowledgeBase());
      refresh();
    }
  }, [store, refresh]);

  const mergeKb = useCallback(
    (slice: Partial<MemoryKnowledgeBase>) => {
      store.mergeCompileResult(slice);
      refresh();
    },
    [store, refresh],
  );

  const mergeFromTournament = useCallback(
    (state: TournamentState) => {
      const { knowledgeBase } = runMemoryCompilePipeline(state);
      store.mergeCompileResult(knowledgeBase);
      refresh();
    },
    [store, refresh],
  );

  const runLint = useCallback(() => {
    const current = store.getKnowledgeBase();
    const report = lintMemoryKnowledgeBase({
      articles: current.articles,
      links: current.links,
      lessons: current.lessons,
      proposals: current.proposals,
      evidenceNotes: current.evidenceNotes,
    });
    store.setLintReport(report);
    refresh();
  }, [store, refresh]);

  const value = useMemo(
    () => ({ kb, refresh, mergeFromTournament, mergeKb, runLint }),
    [kb, refresh, mergeFromTournament, mergeKb, runLint],
  );

  return <MemoryContext.Provider value={value}>{children}</MemoryContext.Provider>;
}

export function useMemory(): MemoryContextValue {
  const ctx = useContext(MemoryContext);
  if (!ctx) throw new Error("useMemory must be used within MemoryProvider");
  return ctx;
}

export { MemoryStore };
