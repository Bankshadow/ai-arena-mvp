import type {
  EstimateCostParams,
  GenerateTextParams,
  GenerateTextResult,
  ProviderId,
  ProviderStatus,
  RateLimitInfo,
} from "@/lib/tournament/routing/types";

export interface ProviderAdapter {
  readonly id: ProviderId;
  generateText(params: GenerateTextParams): Promise<GenerateTextResult>;
  estimateCost(params: EstimateCostParams): number;
  getProviderStatus(): ProviderStatus;
  getRateLimitInfo(): RateLimitInfo;
}
