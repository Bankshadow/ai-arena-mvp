"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { runTradingArenaRound } from "@/lib/trading-arena/pipeline";
import { TradingArenaStore } from "@/lib/trading-arena/store";
import type { TradingArenaStoreData } from "@/lib/trading-arena/types";

type TradingArenaContextValue = {
  data: TradingArenaStoreData;
  refresh: () => void;
  runRound: () => void;
  selectChallenge: (id: string) => void;
  busy: boolean;
};

const TradingArenaContext = createContext<TradingArenaContextValue | null>(null);

export function TradingArenaProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new TradingArenaStore());
  const [data, setData] = useState<TradingArenaStoreData>(() => store.getData());
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    setData(store.getData());
  }, [store]);

  const runRound = useCallback(() => {
    setBusy(true);
    try {
      const result = runTradingArenaRound(store.getData());
      store.mergeRunResult(result);
      refresh();
    } finally {
      setBusy(false);
    }
  }, [store, refresh]);

  const selectChallenge = useCallback(
    (id: string) => {
      store.setChallenge(id);
      refresh();
    },
    [store, refresh],
  );

  const value = useMemo(
    () => ({ data, refresh, runRound, selectChallenge, busy }),
    [data, refresh, runRound, selectChallenge, busy],
  );

  return <TradingArenaContext.Provider value={value}>{children}</TradingArenaContext.Provider>;
}

export function useTradingArena(): TradingArenaContextValue {
  const ctx = useContext(TradingArenaContext);
  if (!ctx) throw new Error("useTradingArena must be used within TradingArenaProvider");
  return ctx;
}
