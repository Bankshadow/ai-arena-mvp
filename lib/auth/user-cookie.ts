const COOKIE_NAME = "ai-arena-user-email";
const MAX_AGE_DAYS = 30;

export function setUserEmailCookie(email: string): void {
  if (typeof document === "undefined") return;
  const normalized = email.trim().toLowerCase();
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(normalized)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function getUserEmailFromDocument(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]).toLowerCase();
  } catch {
    return null;
  }
}

export function clearUserEmailCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function parseUserEmailFromCookieHeader(header: string | null): string | null {
  if (!header) return null;
  const match = header.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]).toLowerCase();
  } catch {
    return null;
  }
}
