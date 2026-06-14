"use client";

import { ComponentProofCard } from "@/components/marketplace/component-proof-card";
import type { MarketplaceComponent } from "@/lib/marketplace/types";

type Props = {
  component: MarketplaceComponent;
  compact?: boolean;
};

/** @deprecated Use ComponentProofCard — kept for imports. */
export function ComponentCard({ component, compact }: Props) {
  return <ComponentProofCard component={component} compact={compact} />;
}
