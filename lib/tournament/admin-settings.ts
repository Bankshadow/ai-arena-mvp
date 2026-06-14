import type { TournamentRuntimeMode } from "@/lib/tournament/routing/types";
import { DEFAULT_RUNTIME_MODE } from "@/lib/tournament/routing/types";

const STORAGE_KEY = "ai-arena-tournament-admin-settings";

export type TournamentAdminSettings = {
  defaultRuntimeMode: TournamentRuntimeMode;
};

export function getDefaultTournamentAdminSettings(): TournamentAdminSettings {
  return { defaultRuntimeMode: DEFAULT_RUNTIME_MODE };
}

export function readTournamentAdminSettings(): TournamentAdminSettings {
  if (typeof window === "undefined") return getDefaultTournamentAdminSettings();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<TournamentAdminSettings>;
      if (parsed.defaultRuntimeMode) {
        return { defaultRuntimeMode: parsed.defaultRuntimeMode };
      }
    }
  } catch {
    /* ignore */
  }
  return getDefaultTournamentAdminSettings();
}

export function writeTournamentAdminSettings(
  patch: Partial<TournamentAdminSettings>,
): TournamentAdminSettings {
  const next = { ...readTournamentAdminSettings(), ...patch };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* quota */
    }
  }
  return next;
}

/** Resolve runtime mode for tournament loop (client-side). */
export function resolveTournamentRuntimeMode(
  mode: TournamentRuntimeMode | undefined,
  groqAvailable: boolean,
): TournamentRuntimeMode {
  const chosen = mode ?? readTournamentAdminSettings().defaultRuntimeMode;
  if (chosen !== "mock" && !groqAvailable) return "mock";
  return chosen;
}
