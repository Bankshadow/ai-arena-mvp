"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";
import type { Locale } from "@/lib/i18n/config";

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "th", label: "TH" },
];

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
};

export function LanguageSwitcher({ className, compact }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-0.5",
        className
      )}
      role="group"
      aria-label={t.common.language}
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setLocale(opt.value)}
          className={cn(
            "rounded-md px-2.5 py-1 font-mono text-xs transition",
            locale === opt.value
              ? "bg-white/15 text-white"
              : "text-zinc-500 hover:text-zinc-300",
            compact && "px-2 py-0.5"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
