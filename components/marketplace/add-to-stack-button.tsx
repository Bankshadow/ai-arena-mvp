"use client";

import { Plus, Check } from "lucide-react";

import { useComponentInStack, useWorkflowStack } from "@/components/marketplace/stack-provider";
import type { MarketplaceComponent } from "@/lib/marketplace/types";

type Props = {
  component: MarketplaceComponent;
  variant?: "button" | "icon";
};

export function AddToStackButton({ component, variant = "button" }: Props) {
  const { addComponent } = useWorkflowStack();
  const inStack = useComponentInStack(component.id);

  if (variant === "icon") {
    return (
      <button
        type="button"
        disabled={inStack}
        onClick={() => addComponent(component)}
        className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:border-violet-500/40 hover:text-violet-200 disabled:opacity-50"
        title={inStack ? "In stack" : "Add to stack"}
      >
        {inStack ? <Check className="size-4 text-emerald-400" /> : <Plus className="size-4" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={inStack}
      onClick={() => addComponent(component)}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition ${
        inStack
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-violet-500/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20"
      }`}
    >
      {inStack ? (
        <>
          <Check className="size-3.5" /> In stack
        </>
      ) : (
        <>
          <Plus className="size-3.5" /> Add to stack
        </>
      )}
    </button>
  );
}
