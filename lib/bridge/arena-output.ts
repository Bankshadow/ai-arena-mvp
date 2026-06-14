/** Pass arena output to Battle / Submit / Enterprise via sessionStorage. */

export type ArenaBridgePayload = {
  name: string;
  modelUsed: string;
  costUsd: number;
  output: string;
  finalScore?: number;
  rank?: number;
  savedAt: string;
};

const STORAGE_KEY = "ai-arena-arena-bridge";

export function saveArenaBridge(payload: Omit<ArenaBridgePayload, "savedAt">): void {
  if (typeof window === "undefined") return;
  const full: ArenaBridgePayload = { ...payload, savedAt: new Date().toISOString() };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(full));
}

export function readArenaBridge(): ArenaBridgePayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ArenaBridgePayload;
  } catch {
    return null;
  }
}

export function clearArenaBridge(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
