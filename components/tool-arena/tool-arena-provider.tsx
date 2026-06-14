"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { runToolArenaRound } from "@/lib/tool-arena/pipeline";
import { ToolArenaStore } from "@/lib/tool-arena/store";
import type { PermissionLevel, ToolArenaStoreData, ToolPlugin } from "@/lib/tool-arena/types";

type ToolArenaContextValue = {
  data: ToolArenaStoreData;
  refresh: () => void;
  runRound: () => void;
  updatePlugin: (id: string, patch: Partial<ToolPlugin>) => void;
  setPermission: (pluginId: string, mode: PermissionLevel) => void;
  selectChallenge: (challengeId: string) => void;
  toggleDryRun: () => void;
  busy: boolean;
};

const ToolArenaContext = createContext<ToolArenaContextValue | null>(null);

export function ToolArenaProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new ToolArenaStore());
  const [data, setData] = useState<ToolArenaStoreData>(() => store.getData());
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    setData(store.getData());
  }, [store]);

  const runRound = useCallback(() => {
    setBusy(true);
    try {
      const current = store.getData();
      const result = runToolArenaRound(current);
      store.setState(result.state);
      store.addMarketplaceCandidates(result.marketplace_candidates);
      refresh();
    } finally {
      setBusy(false);
    }
  }, [store, refresh]);

  const updatePlugin = useCallback(
    (id: string, patch: Partial<ToolPlugin>) => {
      store.updatePlugin(id, patch);
      refresh();
    },
    [store, refresh],
  );

  const setPermission = useCallback(
    (pluginId: string, mode: PermissionLevel) => {
      store.updatePlugin(pluginId, { permission_level: mode });
      refresh();
    },
    [store, refresh],
  );

  const selectChallenge = useCallback(
    (challengeId: string) => {
      store.setSelectedChallenge(challengeId);
      refresh();
    },
    [store, refresh],
  );

  const toggleDryRun = useCallback(() => {
    const d = store.getData();
    store.setState({ ...d.state, dry_run: !d.state.dry_run });
    refresh();
  }, [store, refresh]);

  const value = useMemo(
    () => ({
      data,
      refresh,
      runRound,
      updatePlugin,
      setPermission,
      selectChallenge,
      toggleDryRun,
      busy,
    }),
    [data, refresh, runRound, updatePlugin, setPermission, selectChallenge, toggleDryRun, busy],
  );

  return <ToolArenaContext.Provider value={value}>{children}</ToolArenaContext.Provider>;
}

export function useToolArena(): ToolArenaContextValue {
  const ctx = useContext(ToolArenaContext);
  if (!ctx) throw new Error("useToolArena must be used within ToolArenaProvider");
  return ctx;
}
