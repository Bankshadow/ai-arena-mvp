"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { Nav } from "@/components/Nav";
import { setUserEmailCookie, getUserEmailFromDocument } from "@/lib/auth/user-cookie";
import { readArenaBridge } from "@/lib/bridge/arena-output";
import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";
import type { Dictionary } from "@/lib/i18n/types";
import { createBrowserSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { SubmissionInsert } from "@/lib/supabase/types";

type FormState = {
  name: string;
  email: string;
  role: string;
  promptUsed: string;
  modelUsed: string;
  estimatedCost: string;
  outputResult: string;
  workflowNotes: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function emptyForm(roles: readonly string[]): FormState {
  return {
    name: "",
    email: "",
    role: roles[0] ?? "",
    promptUsed: "",
    modelUsed: "",
    estimatedCost: "",
    outputResult: "",
    workflowNotes: "",
  };
}

function validate(form: FormState, t: Dictionary["submit"]): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim() || form.name.trim().length < 2) errors.name = t.errors.name;
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = t.errors.email;
  }
  if (!form.role.trim()) errors.role = t.errors.role;
  if (!form.promptUsed.trim() || form.promptUsed.trim().length < 10) {
    errors.promptUsed = t.errors.promptUsed;
  }
  if (!form.modelUsed.trim()) errors.modelUsed = t.errors.modelUsed;
  const cost = parseFloat(form.estimatedCost);
  if (!form.estimatedCost.trim() || Number.isNaN(cost)) {
    errors.estimatedCost = t.errors.estimatedCost;
  } else if (cost < 0) {
    errors.estimatedCost = t.errors.estimatedCostMin;
  }
  if (!form.outputResult.trim() || form.outputResult.trim().length < 50) {
    errors.outputResult = t.errors.outputResult;
  }
  return errors;
}

export type MvpSubmitFormProps = {
  challengeName?: string;
};

export function MvpSubmitForm({ challengeName }: MvpSubmitFormProps) {
  const t = useTranslations();
  const s = t.submit;
  const roles = t.roles;
  const supabaseReady = isSupabaseConfigured();
  const [form, setForm] = useState<FormState>(() => emptyForm(roles));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const savedEmail = getUserEmailFromDocument();
    if (savedEmail) {
      setForm((f) => ({ ...f, email: savedEmail }));
    }
    const bridge = readArenaBridge();
    if (bridge) {
      setForm((f) => ({
        ...f,
        name: bridge.name || f.name,
        modelUsed: bridge.modelUsed || f.modelUsed,
        estimatedCost: bridge.costUsd ? String(bridge.costUsd) : f.estimatedCost,
        outputResult: bridge.output || f.outputResult,
      }));
    }
  }, []);

  const title = challengeName ?? s.challengeName;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const validation = validate(form, s);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const supabase = createBrowserSupabase();
    if (!supabase) {
      setSubmitError(s.supabaseError);
      return;
    }

    setLoading(true);

    const payload: SubmissionInsert = {
      challenge_id: DEFAULT_CHALLENGE_SLUG,
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      prompt_used: form.promptUsed.trim(),
      model_used: form.modelUsed.trim(),
      estimated_cost: parseFloat(form.estimatedCost),
      output_result: form.outputResult.trim(),
      workflow_notes: form.workflowNotes.trim() || null,
    };

    const { error } = await supabase.from("submissions").insert(payload);

    setLoading(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    setUserEmailCookie(form.email.trim());
    setSuccess(true);
    setForm(emptyForm(roles));
  }

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50";

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.12),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-2xl px-4 pb-20 pt-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400/80">{s.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-zinc-400">
          {supabaseReady ? s.descriptionConfigured : s.descriptionNotConfigured}
        </p>

        {!supabaseReady && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {s.missingEnv}
          </div>
        )}

        {submitError && (
          <div className="mt-4 flex gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {submitError}
          </div>
        )}

        {success ? (
          <div className="glass-card neon-glow mt-10 rounded-2xl p-8">
            <CheckCircle2 className="size-10 text-cyan-400" />
            <p className="mt-4 text-lg font-semibold text-white">{s.successTitle}</p>
            <p className="mt-2 text-zinc-400">{s.successBody}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/leaderboard"
                className="inline-flex justify-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-2.5 text-sm font-semibold text-black"
              >
                {t.common.viewLeaderboard}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSuccess(false);
                  setErrors({});
                }}
                className="rounded-full border border-white/15 px-6 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
              >
                {t.common.submitAnother}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card mt-10 space-y-5 rounded-2xl p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={s.fields.name} error={errors.name}>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder={s.placeholders.name}
                  disabled={loading}
                />
              </Field>
              <Field label={s.fields.email} error={errors.email}>
                <input
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder={s.placeholders.email}
                  disabled={loading}
                />
              </Field>
            </div>
            <Field label={s.fields.role} error={errors.role}>
              <select
                className={inputClass}
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                disabled={loading}
              >
                {roles.map((r) => (
                  <option key={r} value={r} className="bg-zinc-900">
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={s.fields.promptUsed} error={errors.promptUsed}>
              <textarea
                className={`${inputClass} min-h-[90px] font-mono text-xs`}
                value={form.promptUsed}
                onChange={(e) => setForm((f) => ({ ...f, promptUsed: e.target.value }))}
                placeholder={s.placeholders.promptUsed}
                disabled={loading}
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={s.fields.modelUsed} error={errors.modelUsed}>
                <input
                  className={inputClass}
                  value={form.modelUsed}
                  onChange={(e) => setForm((f) => ({ ...f, modelUsed: e.target.value }))}
                  placeholder={s.placeholders.modelUsed}
                  disabled={loading}
                />
              </Field>
              <Field label={s.fields.estimatedCost} error={errors.estimatedCost}>
                <input
                  className={inputClass}
                  inputMode="decimal"
                  value={form.estimatedCost}
                  onChange={(e) => setForm((f) => ({ ...f, estimatedCost: e.target.value }))}
                  placeholder={s.placeholders.estimatedCost}
                  disabled={loading}
                />
              </Field>
            </div>
            <Field label={s.fields.outputResult} error={errors.outputResult}>
              <textarea
                className={`${inputClass} min-h-[160px]`}
                value={form.outputResult}
                onChange={(e) => setForm((f) => ({ ...f, outputResult: e.target.value }))}
                placeholder={s.placeholders.outputResult}
                disabled={loading}
              />
            </Field>
            <Field label={s.fields.workflowNotes} error={errors.workflowNotes}>
              <textarea
                className={`${inputClass} min-h-[80px]`}
                value={form.workflowNotes}
                onChange={(e) => setForm((f) => ({ ...f, workflowNotes: e.target.value }))}
                placeholder={s.placeholders.workflowNotes}
                disabled={loading}
              />
            </Field>
            <button
              type="submit"
              disabled={loading || !supabaseReady}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50 sm:w-auto sm:px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {s.submitting}
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  {s.submitButton}
                </>
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-400">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
