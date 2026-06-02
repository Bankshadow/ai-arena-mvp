"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";

import { Nav } from "@/components/Nav";
import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";
import { createBrowserSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { SubmissionInsert } from "@/lib/supabase/types";

const ROLES = ["AI Builder", "Prompt Engineer", "Developer", "Enterprise", "Curious"];

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

const EMPTY: FormState = {
  name: "",
  email: "",
  role: ROLES[0],
  promptUsed: "",
  modelUsed: "",
  estimatedCost: "",
  outputResult: "",
  workflowNotes: "",
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim() || form.name.trim().length < 2) errors.name = "Name is required.";
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Valid email is required.";
  }
  if (!form.role.trim()) errors.role = "Role is required.";
  if (!form.promptUsed.trim() || form.promptUsed.trim().length < 10) {
    errors.promptUsed = "Prompt must be at least 10 characters.";
  }
  if (!form.modelUsed.trim()) errors.modelUsed = "Model is required.";
  const cost = parseFloat(form.estimatedCost);
  if (!form.estimatedCost.trim() || Number.isNaN(cost)) {
    errors.estimatedCost = "Enter a valid cost.";
  } else if (cost < 0) {
    errors.estimatedCost = "Cost must be 0 or greater.";
  }
  if (!form.outputResult.trim() || form.outputResult.trim().length < 50) {
    errors.outputResult = "Output must be at least 50 characters.";
  }
  return errors;
}

export type MvpSubmitFormProps = {
  challengeName?: string;
};

export function MvpSubmitForm({
  challengeName = "Executive Summary Battle #1",
}: MvpSubmitFormProps) {
  const supabaseReady = isSupabaseConfigured();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const validation = validate(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const supabase = createBrowserSupabase();
    if (!supabase) {
      setSubmitError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
      );
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

    setSuccess(true);
    setForm({ ...EMPTY, role: ROLES[0] });
  }

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50";

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.12),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-2xl px-4 pb-20 pt-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400/80">
          Submit solution
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{challengeName}</h1>
        <p className="mt-3 text-zinc-400">
          {supabaseReady
            ? "Your submission is saved to Supabase and reviewed in the admin panel before appearing on the leaderboard."
            : "Configure Supabase env vars to enable real submissions."}
        </p>

        {!supabaseReady && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.
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
            <p className="mt-4 text-lg font-semibold text-white">Submission received</p>
            <p className="mt-2 text-zinc-400">
              Submission received. Your result will appear on the leaderboard after review.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/leaderboard"
                className="inline-flex justify-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-2.5 text-sm font-semibold text-black"
              >
                View Leaderboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSuccess(false);
                  setErrors({});
                }}
                className="rounded-full border border-white/15 px-6 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
              >
                Submit another
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="glass-card mt-10 space-y-5 rounded-2xl p-6 sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name" error={errors.name}>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                  disabled={loading}
                />
              </Field>
              <Field label="Email" error={errors.email}>
                <input
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@company.com"
                  disabled={loading}
                />
              </Field>
            </div>
            <Field label="Role" error={errors.role}>
              <select
                className={inputClass}
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                disabled={loading}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} className="bg-zinc-900">
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Prompt used" error={errors.promptUsed}>
              <textarea
                className={`${inputClass} min-h-[90px] font-mono text-xs`}
                value={form.promptUsed}
                onChange={(e) => setForm((f) => ({ ...f, promptUsed: e.target.value }))}
                placeholder="Your full prompt or workflow instructions..."
                disabled={loading}
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Model used" error={errors.modelUsed}>
                <input
                  className={inputClass}
                  value={form.modelUsed}
                  onChange={(e) => setForm((f) => ({ ...f, modelUsed: e.target.value }))}
                  placeholder="gpt-4o-mini"
                  disabled={loading}
                />
              </Field>
              <Field label="Estimated cost (USD)" error={errors.estimatedCost}>
                <input
                  className={inputClass}
                  inputMode="decimal"
                  value={form.estimatedCost}
                  onChange={(e) => setForm((f) => ({ ...f, estimatedCost: e.target.value }))}
                  placeholder="0.08"
                  disabled={loading}
                />
              </Field>
            </div>
            <Field label="Output result" error={errors.outputResult}>
              <textarea
                className={`${inputClass} min-h-[160px]`}
                value={form.outputResult}
                onChange={(e) => setForm((f) => ({ ...f, outputResult: e.target.value }))}
                placeholder="Executive Summary, Key Risks, Recommendations..."
                disabled={loading}
              />
            </Field>
            <Field label="Workflow notes (optional)" error={errors.workflowNotes}>
              <textarea
                className={`${inputClass} min-h-[80px]`}
                value={form.workflowNotes}
                onChange={(e) => setForm((f) => ({ ...f, workflowNotes: e.target.value }))}
                placeholder="Briefly describe your pipeline steps..."
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
                  Submitting…
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Submit solution
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
