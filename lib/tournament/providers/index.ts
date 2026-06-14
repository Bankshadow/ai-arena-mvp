import { anthropicProviderAdapter } from "@/lib/tournament/providers/anthropic-adapter";
import { groqProviderAdapter } from "@/lib/tournament/providers/groq-adapter";
import { mockProviderAdapter } from "@/lib/tournament/providers/mock-adapter";
import { openAiProviderAdapter } from "@/lib/tournament/providers/openai-adapter";
import type { ProviderAdapter } from "@/lib/tournament/providers/types";
import type { ProviderId } from "@/lib/tournament/routing/types";

const ADAPTERS: Record<ProviderId, ProviderAdapter> = {
  mock: mockProviderAdapter,
  groq: groqProviderAdapter,
  anthropic: anthropicProviderAdapter,
  openai: openAiProviderAdapter,
};

export function getProviderAdapter(id: ProviderId): ProviderAdapter {
  return ADAPTERS[id];
}

export function getAllProviderStatuses() {
  return (["mock", "groq", "anthropic", "openai"] as const).map((id) =>
    ADAPTERS[id].getProviderStatus(),
  );
}

export {
  mockProviderAdapter,
  groqProviderAdapter,
  anthropicProviderAdapter,
  openAiProviderAdapter,
};
export type { ProviderAdapter };
