"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { RuntimeModeSelector } from "@/components/tournament/routing/runtime-mode-selector";
import {
  readTournamentAdminSettings,
  writeTournamentAdminSettings,
  type TournamentAdminSettings,
} from "@/lib/tournament/admin-settings";
import type { TournamentRuntimeMode } from "@/lib/tournament/routing/types";

type Props = {
  groqAvailable: boolean;
  premiumAvailable?: boolean;
};

export function AdminTournamentSettings({ groqAvailable, premiumAvailable = false }: Props) {
  const s = useTranslations().tournament.adminSettings;
  const [settings, setSettings] = useState<TournamentAdminSettings>(() =>
    readTournamentAdminSettings(),
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(readTournamentAdminSettings());
  }, []);

  function save(mode: TournamentRuntimeMode) {
    const next = writeTournamentAdminSettings({ defaultRuntimeMode: mode });
    setSettings(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <section className="glass-card rounded-2xl border border-cyan-500/20 p-6">
      <h2 className="text-lg font-semibold">{s.title}</h2>
      <p className="mt-1 text-sm text-zinc-400">{s.description}</p>
      <div className="mt-4">
        <RuntimeModeSelector
          value={settings.defaultRuntimeMode}
          groqAvailable={groqAvailable}
          premiumAvailable={premiumAvailable}
          onChange={(mode) => {
            setSettings((prev) => ({ ...prev, defaultRuntimeMode: mode }));
          }}
        />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => save(settings.defaultRuntimeMode)}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-500/20"
        >
          <Save className="size-4" />
          {s.save}
        </button>
        {saved && <span className="text-sm text-emerald-400">{s.saved}</span>}
      </div>
      {!groqAvailable && settings.defaultRuntimeMode !== "mock" && (
        <p className="mt-3 text-xs text-amber-300/90">
          {settings.defaultRuntimeMode === "hybrid_quality" && premiumAvailable
            ? s.hybridPremiumHint
            : s.groqFallback}
        </p>
      )}
    </section>
  );
}
