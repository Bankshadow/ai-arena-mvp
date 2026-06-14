"use client";

import { Pause, Play, RefreshCw, Save, Sparkles, Swords, Scale, type LucideIcon } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";

type Props = {
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

export function AdminControls({
  busy,
  paused,
  onRunFull,
  onPause,
  onResume,
  onGenerateOnly,
  onRunAgentsOnly,
  onEvaluateOnly,
  onSave,
}: Props) {
  const c = useTranslations().tournament.adminControls;

  return (
    <section className="glass-card rounded-2xl border border-white/10 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">{c.title}</h3>
      <p className="mt-1 text-xs text-zinc-500">{c.subtitle}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <AdminBtn icon={RefreshCw} label={c.runNow} onClick={onRunFull} disabled={busy} primary />
        {paused ? (
          <AdminBtn icon={Play} label={c.resume} onClick={onResume} disabled={busy} />
        ) : (
          <AdminBtn icon={Pause} label={c.pause} onClick={onPause} disabled={busy} />
        )}
        <AdminBtn icon={Sparkles} label={c.generateOnly} onClick={onGenerateOnly} disabled={busy} />
        <AdminBtn icon={Swords} label={c.runAgentsOnly} onClick={onRunAgentsOnly} disabled={busy} />
        <AdminBtn icon={Scale} label={c.evaluateOnly} onClick={onEvaluateOnly} disabled={busy} />
        <AdminBtn icon={Save} label={c.saveAgain} onClick={onSave} disabled={busy} />
      </div>
    </section>
  );
}

function AdminBtn({
  icon: Icon,
  label,
  onClick,
  disabled,
  primary,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition disabled:opacity-40 ${
        primary
          ? "border-violet-500/50 bg-violet-500/15 text-violet-100 hover:bg-violet-500/25"
          : "border-white/10 bg-black/30 text-zinc-300 hover:bg-white/5"
      }`}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}
