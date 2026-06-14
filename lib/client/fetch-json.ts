const DEFAULT_TIMEOUT_MS = 8_000;

export type FetchJsonResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  timedOut: boolean;
};

/** JSON fetch with abort timeout — avoids indefinite loading when Supabase/API is slow or down. */
export async function fetchJson<T>(
  url: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<FetchJsonResult<T>> {
  const timeoutMs = init?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
    });

    let data: T | null = null;
    try {
      data = (await res.json()) as T;
    } catch {
      data = null;
    }

    return { ok: res.ok, status: res.status, data, timedOut: false };
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "AbortError";
    return { ok: false, status: timedOut ? 408 : 0, data: null, timedOut };
  } finally {
    clearTimeout(timer);
  }
}
