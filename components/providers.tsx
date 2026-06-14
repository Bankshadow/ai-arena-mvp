"use client";

import { LocaleProvider } from "@/components/i18n/locale-provider";
import { MemoryProvider } from "@/components/memory/memory-provider";
import { StackProvider } from "@/components/marketplace/stack-provider";
import type { Locale } from "@/lib/i18n/config";

type ProvidersProps = {
  children: React.ReactNode;
  initialLocale?: Locale;
};

export function Providers({ children, initialLocale }: ProvidersProps) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <StackProvider>
        <MemoryProvider>{children}</MemoryProvider>
      </StackProvider>
    </LocaleProvider>
  );
}
