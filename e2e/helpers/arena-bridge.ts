import type { Page } from "@playwright/test";

import {
  ARENA_BRIDGE_STORAGE_KEY,
  type ArenaBridgePayload,
} from "../../lib/bridge/arena-output";

/** Long enough for arena/submit/enterprise validation (≥50 chars). */
export const SAMPLE_ARENA_OUTPUT = `Executive Summary
Our Q3 rollout exceeded adoption targets by 12% while holding support load flat.

Key Risks
- Vendor concentration in the analytics pipeline
- Incomplete GDPR documentation for EU tenants

Business Impact
Delayed compliance work could block two enterprise renewals worth $1.2M ARR.

Recommendations
1. Assign a compliance tiger team for 30 days.
2. Add a secondary vendor for ingestion failover.
3. Publish a customer-facing status dashboard.`;

export const SAMPLE_BRIDGE: Omit<ArenaBridgePayload, "savedAt"> = {
  name: "Playwright Tester",
  modelUsed: "claude-sonnet-4-6",
  costUsd: 0.18,
  output: SAMPLE_ARENA_OUTPUT,
  finalScore: 82,
  rank: 3,
};

export async function seedArenaBridge(
  page: Page,
  payload: Omit<ArenaBridgePayload, "savedAt"> = SAMPLE_BRIDGE,
): Promise<void> {
  await page.addInitScript(
    ({ key, data }) => {
      sessionStorage.setItem(
        key,
        JSON.stringify({ ...data, savedAt: new Date().toISOString() }),
      );
    },
    { key: ARENA_BRIDGE_STORAGE_KEY, data: payload },
  );
}
