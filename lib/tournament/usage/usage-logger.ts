import { insertProviderUsageLog } from "@/lib/supabase/provider-usage";
import type {
  ProviderUsageEntry,
  TournamentRuntimeMode,
} from "@/lib/tournament/routing/types";

export type UsageLogContext = {
  tournamentId?: string;
  round?: number;
  agentId?: string;
  runtimeMode?: TournamentRuntimeMode;
};

/** Persists provider usage in-memory (via caller) + best-effort Supabase. */
export class ProviderUsageLogger {
  constructor(private readonly ctx: UsageLogContext = {}) {}

  withContext(patch: UsageLogContext): ProviderUsageLogger {
    return new ProviderUsageLogger({ ...this.ctx, ...patch });
  }

  async log(
    entry: ProviderUsageEntry,
    patch?: Partial<UsageLogContext> & { status?: "success" | "error" | "skipped" },
  ): Promise<void> {
    const ctx = { ...this.ctx, ...patch };
    try {
      await insertProviderUsageLog(entry, {
        tournamentId: ctx.tournamentId,
        round: ctx.round,
        agentId: ctx.agentId,
        runtimeMode: ctx.runtimeMode,
        status: patch?.status ?? "success",
      });
    } catch {
      /* best-effort */
    }
  }

  async logBatch(entries: ProviderUsageEntry[]): Promise<void> {
    for (const entry of entries) {
      await this.log(entry);
    }
  }
}

export const providerUsageLogger = new ProviderUsageLogger();
