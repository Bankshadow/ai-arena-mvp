import { groqProviderAdapter } from "@/lib/tournament/providers/groq-adapter";
import { mockProviderAdapter } from "@/lib/tournament/providers/mock-adapter";
import type { ProviderAdapter } from "@/lib/tournament/providers/types";
import type { ProviderId } from "@/lib/tournament/routing/types";

const ADAPTERS: Record<ProviderId, ProviderAdapter> = {
  mock: mockProviderAdapter,
  groq: groqProviderAdapter,
  anthropic: mockProviderAdapter,
  openai: mockProviderAdapter,
};

export function getProviderAdapter(id: ProviderId): ProviderAdapter {
  return ADAPTERS[id];
}

export function getAllProviderStatuses() {
  return (["mock", "groq"] as const).map((id) => ADAPTERS[id].getProviderStatus());
}

export { mockProviderAdapter, groqProviderAdapter };
export type { ProviderAdapter };
