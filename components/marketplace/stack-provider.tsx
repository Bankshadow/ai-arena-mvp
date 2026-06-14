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

import { getComponentById } from "@/lib/marketplace/mock-catalog";
import { applyStackEstimates } from "@/lib/marketplace/stack-estimator";
import { defaultRoleForType, StackStore } from "@/lib/marketplace/stack-store";
import { validateStack } from "@/lib/marketplace/stack-validator";
import type { MarketplaceComponent, WorkflowStack } from "@/lib/marketplace/types";

type StackContextValue = {
  stack: WorkflowStack;
  count: number;
  addComponent: (component: MarketplaceComponent) => void;
  removeComponent: (componentId: string) => void;
  clearStack: () => void;
  refresh: () => void;
};

const StackContext = createContext<StackContextValue | null>(null);

export function StackProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new StackStore());
  const [stack, setStack] = useState<WorkflowStack>(() => store.getDraft());

  const refresh = useCallback(() => {
    const draft = store.getDraft();
    const warnings = validateStack(draft);
    setStack(applyStackEstimates({ ...draft, compatibility_warnings: warnings }));
  }, [store]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addComponent = useCallback(
    (component: MarketplaceComponent) => {
      store.addComponent(component, defaultRoleForType(component.type));
      refresh();
    },
    [store, refresh],
  );

  const removeComponent = useCallback(
    (componentId: string) => {
      store.removeComponent(componentId);
      refresh();
    },
    [store, refresh],
  );

  const clearStack = useCallback(() => {
    store.clearDraft();
    refresh();
  }, [store, refresh]);

  const value = useMemo(
    () => ({
      stack,
      count: stack.components.length,
      addComponent,
      removeComponent,
      clearStack,
      refresh,
    }),
    [stack, addComponent, removeComponent, clearStack, refresh],
  );

  return <StackContext.Provider value={value}>{children}</StackContext.Provider>;
}

export function useWorkflowStack(): StackContextValue {
  const ctx = useContext(StackContext);
  if (!ctx) {
    throw new Error("useWorkflowStack must be used within StackProvider");
  }
  return ctx;
}

export function useComponentInStack(componentId: string): boolean {
  const { stack } = useWorkflowStack();
  return stack.components.some((c) => c.component_id === componentId);
}

export function useStackStoreInstance(): StackStore {
  const [store] = useState(() => new StackStore());
  return store;
}

export { getComponentById };
