import { isLocale, LOCALE_COOKIE, DEFAULT_LOCALE } from "@/lib/i18n/config";

export function getLocaleFromCookie(cookieHeader: string | undefined): typeof DEFAULT_LOCALE {
  if (!cookieHeader) return DEFAULT_LOCALE;
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_COOKIE}=`));
  if (!match) return DEFAULT_LOCALE;
  const value = match.split("=")[1];
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
