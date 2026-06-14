import { hasAnthropicKey, hasGroqKey, hasOpenAiKey } from "@/lib/env";
import {
  DEFAULT_RUNTIME_MODE,
  type TournamentRuntimeMode,
} from "@/lib/tournament/routing/types";

export type ResolveModeInput = {
  /** Client-requested mode (untrusted until validated). */
  requested?: TournamentRuntimeMode;
  /** Mode stored on tournament state. */
  stateMode?: TournamentRuntimeMode;
  /** Admin default from settings / env. */
  adminDefault?: TournamentRuntimeMode;
};

/**
 * Server-side runtime mode — never trust client alone.
 * Groq modes downgrade to mock when GROQ_API_KEY is missing.
 * hybrid_quality allows mock agents + premium final judge when only Anthropic/OpenAI keys exist.
 */
export function resolveEffectiveRuntimeMode(input: ResolveModeInput = {}): TournamentRuntimeMode {
  const candidate =
    input.requested ?? input.stateMode ?? input.adminDefault ?? DEFAULT_RUNTIME_MODE;

  if (candidate === "mock") return "mock";

  if (candidate === "groq_free") {
    return hasGroqKey() ? "groq_free" : "mock";
  }

  if (candidate === "hybrid_quality") {
    if (hasGroqKey()) return "hybrid_quality";
    if (hasAnthropicKey() || hasOpenAiKey()) return "hybrid_quality";
    return "mock";
  }

  return "mock";
}

/** Human-readable reason when mode was downgraded. */
export function runtimeModeResolutionNote(
  requested: TournamentRuntimeMode | undefined,
  effective: TournamentRuntimeMode,
): string | null {
  if (!requested || requested === effective) return null;
  if (effective === "mock" && requested !== "mock") {
    if (requested === "groq_free" && !hasGroqKey()) {
      return "Requested groq_free but GROQ_API_KEY missing — using mock";
    }
    if (requested === "hybrid_quality" && !hasGroqKey() && !hasAnthropicKey() && !hasOpenAiKey()) {
      return "Requested hybrid_quality but no provider keys — using mock";
    }
    return `Requested ${requested} — using mock`;
  }
  if (requested === "hybrid_quality" && effective === "hybrid_quality" && !hasGroqKey()) {
    return "Hybrid mode: mock agent runs + premium final judge (no Groq key)";
  }
  return null;
}
