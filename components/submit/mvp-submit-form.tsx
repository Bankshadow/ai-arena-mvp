"use client";

import { FormEvent, useState, useTransition } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock, Send } from "lucide-react";

import {
  submitChallengeEntry,
  type SubmitChallengeSuccess,
} from "@/app/actions/submit-challenge";
import { Nav } from "@/components/Nav";
import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";
import { saveSubmission } from "@/lib/client/submissions";
import { validateSubmissionForm } from "@/lib/validations/submission";

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

function validateLocal(form: FormState, costLimit: number): FormErrors {
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
  } else if (cost < 0 || cost > costLimit) {
    errors.estimatedCost = `Cost must be between $0 and $${costLimit.toFixed(2)}.`;
  }
  if (!form.outputResult.trim() || form.outputResult.trim().length < 50) {
    errors.outputResult = "Output must be at least 50 characters.";
  }
  return errors;
}

export type MvpSubmitFormProps = {
  challengeSlug?: string;
  challengeName: string;
  dbAvailable: boolean;
  challengeOpen: boolean;
  costLimit: number;
  maxAttempts: number;
  statusLabel: string;
};

export function MvpSubmitForm({
  challengeSlug = DEFAULT_CHALLENGE_SLUG,
  challengeName,
  dbAvailable,
  challengeOpen,
  costLimit,
  maxAttempts,
  statusLabel,
}: MvpSubmitFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<
    | { mode: "local" }
    | { mode: "database"; result: SubmitChallengeSuccess }
    | null
  >(null);
  const [isPending, startTransition] = useTransition();

  const useDatabase =
    dbAvailable && challengeOpen && !serverError?.includes("fallback");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);

    if (dbAvailable && challengeOpen) {
      const zodResult = validateSubmissionForm(
        {
          name: form.name,
          email: form.email,
          promptUsed: form.promptUsed,
          modelUsed: form.modelUsed,
          estimatedCost: form.estimatedCost,
          output: form.outputResult,
        },
        challengeSlug,
        costLimit
      );
      if (!zodResult.success) {
        const fieldErrors = zodResult.fieldErrors ?? {};
        setErrors({
          name: fieldErrors.name,
          email: fieldErrors.email,
          promptUsed: fieldErrors.promptUsed,
          modelUsed: fieldErrors.modelUsed,
          estimatedCost: fieldErrors.estimatedCost,
          outputResult: fieldErrors.output,
        });
        return;
      }

      startTransition(async () => {
        const result = await submitChallengeEntry({
          ...zodResult.data!,
          role: form.role.trim(),
          workflowNotes: form.workflowNotes.trim() || undefined,
        });

        if (result.success) {
          saveSubmission({
            name: form.name.trim(),
            email: form.email.trim(),
            role: form.role,
            promptUsed: form.promptUsed.trim(),
            modelUsed: form.modelUsed.trim(),
            estimatedCost: parseFloat(form.estimatedCost),
            outputResult: form.outputResult.trim(),
            workflowNotes: form.workflowNotes.trim(),
          });
          setSuccess({ mode: "database", result });
          return;
        }

        if (result.error.includes("database is not configured")) {
          submitLocally();
          return;
        }

        setServerError(result.error);
      });
      return;
    }

    const validation = validateLocal(form, costLimit);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    submitLocally();
  }

  function submitLocally() {
    saveSubmission({
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      promptUsed: form.promptUsed.trim(),
      modelUsed: form.modelUsed.trim(),
      estimatedCost: parseFloat(form.estimatedCost),
      outputResult: form.outputResult.trim(),
      workflowNotes: form.workflowNotes.trim(),
    });
    setSuccess({ mode: "local" });
  }

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20";

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.12),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-2xl px-4 pb-20 pt-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400/80">
          Submit solution
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {challengeName}
        </h1>
        <p className="mt-3 text-zinc-400">
          {dbAvailable && challengeOpen
            ? "Submissions are saved to the database. When OpenAI is configured, the AI Judge scores automatically."
            : dbAvailable
              ? `Challenge status: ${statusLabel}. Submissions save locally in your browser until the challenge opens.`
              : "No database configured — submissions are stored in your browser (localStorage)."}
        </p>

        {dbAvailable && (
          <p className="mt-2 text-xs text-zinc-500">
            Up to {maxAttempts} attempts per email · Cost cap ${costLimit.toFixed(2)}
          </p>
        )}

        {serverError && (
          <div className="mt-6 flex gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {serverError}
          </div>
        )}

        {success ? (
          <SuccessPanel success={success} onReset={() => {
            setForm(EMPTY);
            setSuccess(null);
            setErrors({});
            setServerError(null);
          }} />
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
                  disabled={isPending}
                />
              </Field>
              <Field label="Email" error={errors.email}>
                <input
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@company.com"
                  disabled={isPending}
                />
              </Field>
            </div>
            <Field label="Role" error={errors.role}>
              <select
                className={inputClass}
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                disabled={isPending}
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
                disabled={isPending}
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Model used" error={errors.modelUsed}>
                <input
                  className={inputClass}
                  value={form.modelUsed}
                  onChange={(e) => setForm((f) => ({ ...f, modelUsed: e.target.value }))}
                  placeholder="gpt-4o-mini"
                  disabled={isPending}
                />
              </Field>
              <Field label="Estimated cost (USD)" error={errors.estimatedCost}>
                <input
                  className={inputClass}
                  inputMode="decimal"
                  value={form.estimatedCost}
                  onChange={(e) => setForm((f) => ({ ...f, estimatedCost: e.target.value }))}
                  placeholder="0.08"
                  disabled={isPending}
                />
              </Field>
            </div>
            <Field label="Output result" error={errors.outputResult}>
              <textarea
                className={`${inputClass} min-h-[160px]`}
                value={form.outputResult}
                onChange={(e) => setForm((f) => ({ ...f, outputResult: e.target.value }))}
                placeholder="Executive Summary, Key Risks, Recommendations..."
                disabled={isPending}
              />
            </Field>
            <Field label="Workflow notes (optional)" error={errors.workflowNotes}>
              <textarea
                className={`${inputClass} min-h-[80px]`}
                value={form.workflowNotes}
                onChange={(e) => setForm((f) => ({ ...f, workflowNotes: e.target.value }))}
                placeholder="Briefly describe your pipeline steps..."
                disabled={isPending}
              />
            </Field>
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60 sm:w-auto sm:px-8"
            >
              {isPending ? (
                <>
                  <Clock className="size-4 animate-pulse" />
                  Submitting…
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  {useDatabase ? "Submit to challenge" : "Submit solution"}
                </>
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

function SuccessPanel({
  success,
  onReset,
}: {
  success: { mode: "local" } | { mode: "database"; result: SubmitChallengeSuccess };
  onReset: () => void;
}) {
  const isDb = success.mode === "database";
  const result = isDb ? success.result : null;

  return (
    <div className="glass-card neon-glow mt-10 rounded-2xl p-8">
      <CheckCircle2 className="size-10 text-cyan-400" />
      <p className="mt-4 text-lg font-semibold text-white">Submission received</p>

      {isDb && result?.scoringStatus === "scored" ? (
        <p className="mt-2 text-zinc-400">
          Scored by AI Judge — attempt {result.attemptNumber}/{result.maxAttempts}. Your
          leaderboard entry is live.
        </p>
      ) : isDb && result?.scoringStatus === "pending" ? (
        <p className="mt-2 text-zinc-400">
          Saved to the database. Scoring is pending (set OPENAI_API_KEY or run{" "}
          <code className="text-cyan-400">npm run judge:pending</code>). Your result will
          appear on the leaderboard after review.
        </p>
      ) : (
        <p className="mt-2 text-zinc-400">
          Submission received. Your result will appear on the leaderboard after review.
        </p>
      )}

      {isDb && result?.finalScore != null && (
        <dl className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded-lg border border-white/10 bg-black/20 py-3">
            <dt className="text-xs text-zinc-500">Quality</dt>
            <dd className="font-mono text-lg text-violet-300">{result.qualityScore}</dd>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 py-3">
            <dt className="text-xs text-zinc-500">Cost score</dt>
            <dd className="font-mono text-lg text-cyan-400">{result.costEfficiencyScore}</dd>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 py-3">
            <dt className="text-xs text-zinc-500">Final</dt>
            <dd className="font-mono text-lg font-semibold text-white">{result.finalScore}</dd>
          </div>
        </dl>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/leaderboard"
          className="inline-flex justify-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-2.5 text-sm font-semibold text-black"
        >
          View Leaderboard
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-white/15 px-6 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
        >
          Submit another
        </button>
      </div>
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
