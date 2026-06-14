"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Play,
  RefreshCw,
  X,
} from "lucide-react";
import type { AgentPersonaId } from "@/lib/agents/types";
import { AGENT_PERSONAS } from "@/lib/agents/personas";

import { Nav } from "@/components/Nav";
import { useTranslations } from "@/components/i18n/locale-provider";
import { isSupabaseConfigured } from "@/lib/supabase";
import { computeCostScore, computeFinalScore } from "@/lib/supabase/scoring";
import type { SubmissionRow, SubmissionStatus } from "@/lib/supabase/types";
import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";

type Filter = SubmissionStatus | "all";

function statusBadge(status: SubmissionStatus) {
  if (status === "approved") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (status === "rejected") return "border-red-500/30 bg-red-500/10 text-red-300";
  return "border-amber-500/30 bg-amber-500/10 text-amber-300";
}

export function AdminReviewPanel() {
  const t = useTranslations();
  const a = t.admin;
  const filters: { value: Filter; label: string }[] = [
    { value: "pending", label: a.filters.pending },
    { value: "approved", label: a.filters.approved },
    { value: "rejected", label: a.filters.rejected },
    { value: "all", label: a.filters.all },
  ];
  const [adminReady, setAdminReady] = useState(false);
  const configured = isSupabaseConfigured();
  const [filter, setFilter] = useState<Filter>("pending");
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<
    Record<string, { qualityScore: string; adminNotes: string }>
  >({});
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!adminReady) {
      setError(a.serviceRoleMissing);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const statusParam = filter === "all" ? "all" : filter;
      const res = await fetch(
        `/api/admin/submissions?status=${statusParam}&challengeId=${DEFAULT_CHALLENGE_SLUG}`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? `HTTP ${res.status}`);
        return;
      }
      const data = (await res.json()) as { submissions: SubmissionRow[] };
      setRows(data.submissions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [filter, adminReady, a.serviceRoleMissing]);

  useEffect(() => {
    fetch("/api/admin/status", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { ready?: boolean }) => setAdminReady(Boolean(d.ready)))
      .catch(() => setAdminReady(false));
  }, []);

  useEffect(() => {
    if (adminReady) load();
    else if (!configured) setLoading(false);
  }, [adminReady, configured, load]);

  function getDraft(row: SubmissionRow) {
    return (
      drafts[row.id] ?? {
        qualityScore: row.quality_score != null ? String(row.quality_score) : "",
        adminNotes: row.admin_notes ?? "",
      }
    );
  }

  function updateDraft(id: string, patch: Partial<{ qualityScore: string; adminNotes: string }>) {
    const row = rows.find((r) => r.id === id);
    setDrafts((prev) => {
      const base =
        prev[id] ??
        (row
          ? {
              qualityScore: row.quality_score != null ? String(row.quality_score) : "",
              adminNotes: row.admin_notes ?? "",
            }
          : { qualityScore: "", adminNotes: "" });
      return { ...prev, [id]: { ...base, ...patch } };
    });
  }

  async function handleApprove(row: SubmissionRow) {
    const draft = getDraft(row);
    const quality = parseFloat(draft.qualityScore);
    if (Number.isNaN(quality) || quality < 0 || quality > 100) {
      setError(a.qualityError);
      return;
    }

    setActionId(row.id);
    setError(null);

    const res = await fetch(`/api/admin/submissions/${row.id}/approve`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        qualityScore: quality,
        adminNotes: draft.adminNotes.trim() || undefined,
      }),
    });

    setActionId(null);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? `HTTP ${res.status}`);
      return;
    }
    await load();
    setExpandedId(null);
  }

  async function handleReject(row: SubmissionRow) {
    const draft = getDraft(row);

    setActionId(row.id);
    setError(null);

    const res = await fetch(`/api/admin/submissions/${row.id}/reject`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes: draft.adminNotes.trim() || undefined }),
    });

    setActionId(null);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? `HTTP ${res.status}`);
      return;
    }
    await load();
    setExpandedId(null);
  }

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(239,68,68,0.08),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-400/80">{a.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{a.title}</h1>
        <p className="mt-2 text-zinc-400">{a.subtitle}</p>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <span>{a.warning}</span>
        </div>

        {!adminReady && (
          <p className="mt-4 text-sm text-red-400">{a.serviceRoleMissing}</p>
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {/* Real Agent Runner */}
        <AgentRunPanel />

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`rounded-full px-4 py-1.5 text-sm transition ${
                  filter === f.value
                    ? "bg-white/15 text-white"
                    : "border border-white/10 text-zinc-400 hover:bg-white/5"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => load()}
            className="ml-auto flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-400 hover:bg-white/5"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            {a.refresh}
          </button>
        </div>

        {loading ? (
          <div className="mt-12 flex justify-center text-zinc-500">
            <Loader2 className="size-8 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="glass-card mt-8 rounded-xl p-8 text-center text-sm text-zinc-400">
            {a.empty}
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {rows.map((row) => {
              const expanded = expandedId === row.id;
              const draft = getDraft(row);
              const cost = Number(row.estimated_cost);
              const previewCostScore = computeCostScore(cost);
              const qualityNum = parseFloat(draft.qualityScore);
              const previewFinal =
                !Number.isNaN(qualityNum) && qualityNum >= 0 && qualityNum <= 100
                  ? computeFinalScore(qualityNum, previewCostScore)
                  : null;

              return (
                <li key={row.id} className="glass-card overflow-hidden rounded-xl">
                  <button
                    type="button"
                    className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02]"
                    onClick={() => setExpandedId(expanded ? null : row.id)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{row.name}</span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs ${statusBadge(row.status)}`}
                        >
                          {row.status}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-zinc-500">
                        {row.email} · {row.model_used} · ${cost.toFixed(2)}
                      </p>
                    </div>
                    {row.final_score != null && (
                      <span className="font-mono text-sm text-cyan-400">
                        {Number(row.final_score).toFixed(1)}
                      </span>
                    )}
                    {expanded ? (
                      <ChevronUp className="size-5 text-zinc-500" />
                    ) : (
                      <ChevronDown className="size-5 text-zinc-500" />
                    )}
                  </button>

                  {expanded && (
                    <div className="border-t border-white/10 px-5 py-5 space-y-4">
                      <DetailBlock label={a.fields.promptUsed} value={row.prompt_used} mono />
                      <DetailBlock label={a.fields.outputResult} value={row.output_result} />
                      {row.workflow_notes && (
                        <DetailBlock label={a.fields.workflowNotes} value={row.workflow_notes} />
                      )}
                      <div className="grid gap-4 sm:grid-cols-3 text-sm">
                        <div>
                          <p className="text-xs text-zinc-500">{a.fields.model}</p>
                          <p className="mt-0.5">{row.model_used}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">{a.fields.role}</p>
                          <p className="mt-0.5">{row.role ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">{a.fields.submitted}</p>
                          <p className="mt-0.5 text-xs">
                            {new Date(row.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-xs font-medium text-zinc-400">
                            {a.fields.qualityScore}
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={1}
                            value={draft.qualityScore}
                            onChange={(e) =>
                              updateDraft(row.id, { qualityScore: e.target.value })
                            }
                            className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-500/50"
                          />
                        </label>
                        <label className="block">
                          <span className="text-xs font-medium text-zinc-400">{a.fields.adminNotes}</span>
                          <input
                            type="text"
                            value={draft.adminNotes}
                            onChange={(e) =>
                              updateDraft(row.id, { adminNotes: e.target.value })
                            }
                            className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-500/50"
                          />
                        </label>
                      </div>

                      <dl className="flex flex-wrap gap-6 rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm">
                        <div>
                          <dt className="text-xs text-zinc-500">{a.fields.costScoreAuto}</dt>
                          <dd className="font-mono text-cyan-400">{previewCostScore}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-zinc-500">{a.fields.finalScoreAuto}</dt>
                          <dd className="font-mono text-violet-300">
                            {previewFinal != null ? previewFinal.toFixed(1) : "—"}
                          </dd>
                        </div>
                      </dl>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={actionId === row.id}
                          onClick={() => handleApprove(row)}
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                        >
                          {actionId === row.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Check className="size-4" />
                          )}
                          {a.approve}
                        </button>
                        <button
                          type="button"
                          disabled={actionId === row.id}
                          onClick={() => handleReject(row)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-5 py-2 text-sm font-medium text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                        >
                          <X className="size-4" />
                          {a.reject}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}

type RunState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "done"; agentId: string; run: Record<string, unknown>; score: Record<string, unknown>; fullOutput: string }
  | { status: "error"; message: string };

function AgentRunPanel() {
  const [agentId, setAgentId] = useState<AgentPersonaId>("sprinter");
  const [state, setState] = useState<RunState>({ status: "idle" });

  async function handleRun() {
    setState({ status: "running" });
    try {
      const res = await fetch("/api/run-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, challengeSlug: "executive-summary-battle" }),
      });
      const json = await res.json();
      if (!res.ok) {
        setState({ status: "error", message: json.error ?? res.statusText });
        return;
      }
      setState({ status: "done", agentId, run: json.run, score: json.score, fullOutput: json.fullOutput });
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : String(err) });
    }
  }

  return (
    <section className="mt-8 glass-card rounded-2xl p-6 border border-violet-500/20">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-0.5 text-xs text-violet-300 font-mono uppercase tracking-widest">
          Real LLM
        </span>
        <h2 className="text-lg font-semibold">Run Real Agent</h2>
        <span className="text-xs text-zinc-500">Calls Anthropic API + AI Judge in real time</span>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Agent persona</label>
          <select
            value={agentId}
            onChange={(e) => setAgentId(e.target.value as AgentPersonaId)}
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-violet-400/40"
          >
            {AGENT_PERSONAS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.modelPref}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleRun}
          disabled={state.status === "running"}
          className="inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-5 py-2 text-sm font-medium text-violet-200 hover:bg-violet-500/20 disabled:opacity-40"
        >
          {state.status === "running" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Play className="size-4" />
          )}
          {state.status === "running" ? "Running…" : "Run agent"}
        </button>
      </div>

      {state.status === "running" && (
        <p className="mt-4 text-sm text-zinc-400 animate-pulse">Calling real Anthropic API + AI Judge…</p>
      )}

      {state.status === "error" && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {state.message}
        </p>
      )}

      {state.status === "done" && (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {[
              { label: "Model", value: String(state.run.modelUsed) },
              { label: "Cost", value: `$${Number(state.run.costUsd).toFixed(4)}` },
              { label: "Tokens in/out", value: `${state.run.tokensIn}/${state.run.tokensOut}` },
              { label: "Latency", value: `${(Number(state.run.latencyMs) / 1000).toFixed(1)}s` },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                <p className="text-xs text-zinc-500">{item.label}</p>
                <p className="font-mono text-cyan-400">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm sm:grid-cols-5">
            {Object.entries(state.run.rubric as Record<string, number>).map(([k, v]) => (
              <div key={k} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                <p className="text-xs text-zinc-500 capitalize">{k}</p>
                <p className="font-mono text-violet-300">{v}</p>
              </div>
            ))}
            <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
              <p className="text-xs text-zinc-500">Final score</p>
              <p className="font-mono font-semibold text-white">{String(state.score.finalScore)}</p>
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500">Agent output</p>
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-4 text-xs text-zinc-300">
              {state.fullOutput}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
}

function DetailBlock({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <pre
        className={`mt-1 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-zinc-300 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </pre>
    </div>
  );
}
