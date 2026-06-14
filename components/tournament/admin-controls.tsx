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
  narrow?: boolean;
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
  narrow,
}: Props) {
  const c = useTranslations().tournament.adminControls;

  return (
    <section className={`rounded-xl border border-white/10 bg-black/20 ${narrow ? "p-3" : "glass-card rounded-2xl p-5"}`}>
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{c.title}</h3>
      <p className="mt-1 text-[10px] leading-snug text-zinc-600">{c.subtitle}</p>

      <div className={`mt-3 ${narrow ? "flex flex-col gap-1.5" : "flex flex-wrap gap-2"}`}>
        <AdminBtn icon={RefreshCw} label={c.runNow} onClick={onRunFull} disabled={busy} primary narrow={narrow} />
        {paused ? (
          <AdminBtn icon={Play} label={c.resume} onClick={onResume} disabled={busy} narrow={narrow} />
        ) : (
          <AdminBtn icon={Pause} label={c.pause} onClick={onPause} disabled={busy} narrow={narrow} />
        )}
        <AdminBtn icon={Sparkles} label={c.generateOnly} onClick={onGenerateOnly} disabled={busy} narrow={narrow} />
        <AdminBtn icon={Swords} label={c.runAgentsOnly} onClick={onRunAgentsOnly} disabled={busy} narrow={narrow} />
        <AdminBtn icon={Scale} label={c.evaluateOnly} onClick={onEvaluateOnly} disabled={busy} narrow={narrow} />
        <AdminBtn icon={Save} label={c.saveAgain} onClick={onSave} disabled={busy} narrow={narrow} />
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
  narrow,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  narrow?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] font-medium transition disabled:opacity-40 ${
        narrow ? "w-full justify-center" : ""
      } ${
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
