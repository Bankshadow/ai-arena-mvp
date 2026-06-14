"use client";

import { LocaleProvider } from "@/components/i18n/locale-provider";
import { MemoryProvider } from "@/components/memory/memory-provider";
import { StackProvider } from "@/components/marketplace/stack-provider";
import { ResearchProvider } from "@/components/research/research-provider";
import { ToolArenaProvider } from "@/components/tool-arena/tool-arena-provider";
import { VectorProvider } from "@/components/vector/vector-provider";
import { TradingArenaProvider } from "@/components/trading-arena/trading-arena-provider";
import { AgentHudProvider } from "@/components/agent-hud/agent-hud-provider";
import type { Locale } from "@/lib/i18n/config";

type ProvidersProps = {
  children: React.ReactNode;
  initialLocale?: Locale;
};

export function Providers({ children, initialLocale }: ProvidersProps) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <StackProvider>
        <MemoryProvider>
          <ResearchProvider>
            <VectorProvider>
              <TradingArenaProvider>
                <AgentHudProvider>
                  <ToolArenaProvider>{children}</ToolArenaProvider>
                </AgentHudProvider>
              </TradingArenaProvider>
            </VectorProvider>
          </ResearchProvider>
        </MemoryProvider>
      </StackProvider>
    </LocaleProvider>
  );
}
