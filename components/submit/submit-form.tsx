"use client";

import { FormEvent, useState, useTransition } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock, Send } from "lucide-react";

import { submitChallengeEntry } from "@/app/actions/submit-challenge";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";
import {
  validateSubmissionForm,
  type SubmissionFormFields,
} from "@/lib/validations/submission";
import type { Challenge } from "@/db/schema";
import type { SubmitChallengeSuccess } from "@/app/actions/submit-challenge";

const EMPTY_FORM: SubmissionFormFields = {
  name: "",
  email: "",
  promptUsed: "",
  modelUsed: "",
  estimatedCost: "",
  output: "",
};

type SubmitFormProps = {
  challenge: Challenge | null;
  dbError: string | null;
  challengeSlug?: string;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function statusBadge(status: string) {
  if (status === "open") {
    return (
      <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">Open</Badge>
    );
  }
  if (status === "closed") {
    return <Badge variant="secondary">Closed</Badge>;
  }
  return (
    <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-300">Beta — not open</Badge>
  );
}

export function SubmitForm({
  challenge,
  dbError,
  challengeSlug = DEFAULT_CHALLENGE_SLUG,
}: SubmitFormProps) {
  const costLimit = challenge ? parseFloat(challenge.costLimitUsd) : 1;
  const canSubmit = Boolean(challenge && challenge.status === "open" && !dbError);
  const deadlinePassed = challenge ? new Date() > challenge.deadlineAt : false;

  const [form, setForm] = useState<SubmissionFormFields>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof SubmissionFormFields, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SubmitChallengeSuccess | null>(null);
  const [touched, setTouched] = useState<Partial<Record<keyof SubmissionFormFields, boolean>>>({});
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof SubmissionFormFields>(
    key: K,
    value: SubmissionFormFields[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setServerError(null);
    if (touched[key] && challenge) {
      const result = validateSubmissionForm(
        { ...form, [key]: value },
        challengeSlug,
        costLimit
      );
      setErrors((prev) => ({ ...prev, [key]: result.fieldErrors?.[key] }));
    }
  }

  function handleBlur(key: keyof SubmissionFormFields) {
    if (!challenge) return;
    setTouched((prev) => ({ ...prev, [key]: true }));
    const result = validateSubmissionForm(form, challengeSlug, costLimit);
    setErrors((prev) => ({ ...prev, [key]: result.fieldErrors?.[key] }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!challenge) return;

    const result = validateSubmissionForm(form, challengeSlug, costLimit);
    setTouched({
      name: true,
      email: true,
      promptUsed: true,
      modelUsed: true,
      estimatedCost: true,
      output: true,
    });

    if (!result.success) {
      setErrors(result.fieldErrors ?? {});
      return;
    }

    setErrors({});
    setServerError(null);

    startTransition(async () => {
      const response = await submitChallengeEntry(result.data!);
      if (response.success) {
        setSuccess(response);
      } else {
        setServerError(response.error);
      }
    });
  }

  function handleReset() {
    setForm(EMPTY_FORM);
    setErrors({});
    setTouched({});
    setSuccess(null);
    setServerError(null);
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.1),transparent)]"
        aria-hidden
      />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" aria-hidden />

      <SiteHeader
        backHref="/challenge/executive-summary-battle"
        backLabel="Back to challenge"
      />

      <main className="relative mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        <div className="mb-8 space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary/80">
            Submit entry
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Challenge submission
            </h1>
            {challenge && statusBadge(challenge.status)}
          </div>
          <p className="text-muted-foreground">
            {challenge?.name ?? "Executive Summary Battle #1"} — entries are saved to the database.
            Scoring runs in a later step.
          </p>
        </div>

        {dbError && (
          <Card className="mb-6 border-destructive/30 bg-destructive/5">
            <CardContent className="flex gap-3 p-4 text-sm">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
              <p>{dbError}</p>
            </CardContent>
          </Card>
        )}

        {challenge && !dbError && challenge.status !== "open" && (
          <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
            <CardContent className="flex gap-3 p-4 text-sm text-amber-100/90">
              <Clock className="mt-0.5 size-5 shrink-0" />
              <p>
                Submissions are not open yet. Run{" "}
                <code className="rounded bg-black/30 px-1 py-0.5 text-xs">npm run challenge:open</code>{" "}
                after seeding, or join the{" "}
                <Link href="/#waitlist" className="underline">
                  beta waitlist
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        )}

        {challenge && deadlinePassed && (
          <Card className="mb-6 border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 text-sm text-destructive">
              The submission deadline has passed.
            </CardContent>
          </Card>
        )}

        {success ? (
          <Card className="border-primary/30 bg-gradient-to-b from-primary/10 to-card/40">
            <CardHeader className="text-center sm:text-left">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 sm:mx-0">
                <CheckCircle2 className="size-8 text-primary" />
              </div>
              <CardTitle className="mt-4 text-2xl">Submission received</CardTitle>
              <CardDescription className="text-base">
                Thanks, {success.displayName}. Attempt {success.attemptNumber} of{" "}
                {success.maxAttempts} is saved.
                {success.scoringStatus === "scored"
                  ? " Your entry has been scored."
                  : " Scoring is pending — run npm run judge:pending or check the leaderboard later."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="grid gap-3 rounded-lg border border-border bg-muted/20 p-4 text-sm sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Submission ID</dt>
                  <dd className="font-mono text-xs break-all">{success.submissionId}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium">{success.email}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Model</dt>
                  <dd className="font-medium">{success.modelUsed}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Estimated cost</dt>
                  <dd className="font-mono font-medium text-primary">
                    ${success.estimatedCostUsd.toFixed(2)}
                  </dd>
                </div>
                {success.scoringStatus === "scored" ? (
                  <>
                    <div>
                      <dt className="text-muted-foreground">Quality</dt>
                      <dd className="font-mono font-medium">{success.qualityScore}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Cost efficiency</dt>
                      <dd className="font-mono font-medium">{success.costEfficiencyScore}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Final score</dt>
                      <dd className="font-mono text-lg font-bold text-primary">
                        {success.finalScore}
                      </dd>
                    </div>
                  </>
                ) : (
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd className="font-medium text-amber-300/90">Pending score</dd>
                  </div>
                )}
              </dl>
              <div className="flex flex-col gap-3 sm:flex-row">
                {success.attemptNumber < success.maxAttempts && (
                  <Button type="button" variant="outline" className="flex-1" onClick={handleReset}>
                    Submit another attempt
                  </Button>
                )}
                <Button type="button" className="flex-1" asChild>
                  <Link href="/leaderboard">View leaderboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/80 bg-card/40">
            <CardHeader>
              <CardTitle className="text-xl">Your submission</CardTitle>
              <CardDescription>
                All fields required. Estimated cost must be ≤ $
                {costLimit.toFixed(2)}. Max {challenge?.maxAttempts ?? 3} attempts per email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {serverError && (
                <div
                  className="mb-6 flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                  role="alert"
                >
                  <AlertCircle className="size-5 shrink-0" />
                  <p>{serverError}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Ada Lovelace"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      disabled={!canSubmit || deadlinePassed || isPending}
                      aria-invalid={!!errors.name}
                    />
                    <FieldError message={errors.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      disabled={!canSubmit || deadlinePassed || isPending}
                      aria-invalid={!!errors.email}
                    />
                    <FieldError message={errors.email} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promptUsed">Prompt used</Label>
                  <Textarea
                    id="promptUsed"
                    placeholder="Paste the prompt or workflow instructions you used..."
                    className="min-h-[100px] font-mono text-xs sm:text-sm"
                    value={form.promptUsed}
                    onChange={(e) => updateField("promptUsed", e.target.value)}
                    onBlur={() => handleBlur("promptUsed")}
                    disabled={!canSubmit || deadlinePassed || isPending}
                    aria-invalid={!!errors.promptUsed}
                  />
                  <FieldError message={errors.promptUsed} />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="modelUsed">Model used</Label>
                    <Input
                      id="modelUsed"
                      placeholder="gpt-4o-mini, claude-3-5-sonnet..."
                      value={form.modelUsed}
                      onChange={(e) => updateField("modelUsed", e.target.value)}
                      onBlur={() => handleBlur("modelUsed")}
                      disabled={!canSubmit || deadlinePassed || isPending}
                      aria-invalid={!!errors.modelUsed}
                    />
                    <FieldError message={errors.modelUsed} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedCost">Estimated cost (USD)</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="estimatedCost"
                        type="text"
                        inputMode="decimal"
                        placeholder="0.08"
                        className="pl-7"
                        value={form.estimatedCost}
                        onChange={(e) => updateField("estimatedCost", e.target.value)}
                        onBlur={() => handleBlur("estimatedCost")}
                        disabled={!canSubmit || deadlinePassed || isPending}
                        aria-invalid={!!errors.estimatedCost}
                      />
                    </div>
                    <FieldError message={errors.estimatedCost} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="output">Output</Label>
                  <Textarea
                    id="output"
                    placeholder="Paste your executive summary, key risks, and recommendations..."
                    className="min-h-[200px]"
                    value={form.output}
                    onChange={(e) => updateField("output", e.target.value)}
                    onBlur={() => handleBlur("output")}
                    disabled={!canSubmit || deadlinePassed || isPending}
                    aria-invalid={!!errors.output}
                  />
                  <div className="flex justify-between gap-2">
                    <FieldError message={errors.output} />
                    <p className="text-xs text-muted-foreground">
                      {form.output.length} characters
                      {form.output.length < 50 && " · min 50"}
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-full sm:w-auto"
                  disabled={!canSubmit || deadlinePassed || isPending}
                >
                  <Send className="size-4" />
                  {isPending ? "Submitting…" : "Submit entry"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
