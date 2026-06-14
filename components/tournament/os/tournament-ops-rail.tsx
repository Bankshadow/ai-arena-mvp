"use client";

import { ChevronDown, ChevronUp, Settings2 } from "lucide-react";
import { useState } from "react";

import { AdminControls } from "@/components/tournament/admin-controls";
import { MissionControlRoutingSection } from "@/components/tournament/mission-control-routing-section";
import { useTranslations } from "@/components/i18n/locale-provider";
import type { TournamentRoutingMeta } from "@/lib/tournament/routing/types";

type AdminProps = {
  busy: boolean;
  paused: boolean;
  onRunFull: () => void;
  onPause: () => void;
  onResume: () => void;
  onGenerateOnly: () => void;
  onRunAgentsOnly: () => void;
  onEvaluateOnly: () => void;
  onSave: () => void;
};

type Props = AdminProps & {
  routing: TournamentRoutingMeta | null | undefined;
  groqAvailable: boolean;
  premiumAvailable: boolean;
  persistMessage: string | null;
  persistIsError?: boolean;
  supabaseConfigured: boolean;
  supabaseTableReady: boolean;
  supabaseHint: string | null;
};

export function TournamentOpsRail({
  routing,
  groqAvailable,
  premiumAvailable,
  persistMessage,
  persistIsError,
  supabaseConfigured,
  supabaseTableReady,
  supabaseHint,
  ...admin
}: Props) {
  const os = useTranslations().tournament.os;
  const [open, setOpen] = useState(false);

  const persistLabel = !supabaseConfigured
    ? os.ops.persistenceLocal
    : supabaseTableReady
      ? os.ops.persistenceReady
      : os.ops.persistenceTableMissing;

  return (
    <aside className="min-w-0 lg:sticky lg:top-44 lg:max-w-[20rem] lg:self-start">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-left lg:pointer-events-none lg:cursor-default"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-amber-200">
          <Settings2 className="size-4" />
          {os.ops.title}
        </span>
        <span className="lg:hidden">
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </span>
      </button>

      <div className={`mt-3 space-y-4 ${open ? "block" : "hidden lg:block"}`}>
        <div className="rounded-xl border border-amber-500/15 bg-black/30 p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">{os.ops.persistence}</p>
          <p className="mt-1 text-xs text-zinc-300">{persistLabel}</p>
          {supabaseConfigured && !supabaseTableReady && supabaseHint && (
            <p className="mt-2 text-xs text-amber-200">{supabaseHint}</p>
          )}
          {persistMessage && (
            <p className={`mt-2 text-xs ${persistIsError ? "text-rose-300" : "text-cyan-300"}`}>
              {persistMessage}
            </p>
          )}
        </div>

        <AdminControls {...admin} narrow />

        <MissionControlRoutingSection
          routing={routing ?? undefined}
          groqAvailable={groqAvailable}
          premiumAvailable={premiumAvailable}
          narrow
        />
      </div>
    </aside>
  );
}
