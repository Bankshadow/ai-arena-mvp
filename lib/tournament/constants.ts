/** Default tournament auto-loop interval (5 minutes). */
export const TOURNAMENT_LOOP_MS = 5 * 60 * 1000;

export function getLoopIntervalMs(): number {
  return TOURNAMENT_LOOP_MS;
}
