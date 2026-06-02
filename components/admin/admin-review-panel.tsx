"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";

import { Nav } from "@/components/Nav";
import { createBrowserSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { computeCostScore, computeFinalScore } from "@/lib/supabase/scoring";
import type { SubmissionRow, SubmissionStatus } from "@/lib/supabase/types";
import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";

type Filter = SubmissionStatus | "all";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

function statusBadge(status: SubmissionStatus) {
  if (status === "approved") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (status === "rejected") return "border-red-500/30 bg-red-500/10 text-red-300";
  return "border-amber-500/30 bg-amber-500/10 text-amber-300";
}

export function AdminReviewPanel() {
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
    const supabase = createBrowserSupabase();
    if (!supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let query = supabase
      .from("submissions")
      .select("*")
      .eq("challenge_id", DEFAULT_CHALLENGE_SLUG)
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data, error: fetchError } = await query;
    setLoading(false);

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    setRows(data ?? []);
  }, [filter]);

  useEffect(() => {
    if (configured) load();
    else setLoading(false);
  }, [configured, load]);

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
      setError("Quality score must be between 0 and 100.");
      return;
    }

    const supabase = createBrowserSupabase();
    if (!supabase) return;

    setActionId(row.id);
    setError(null);

    const cost = Number(row.estimated_cost);
    const costScore = computeCostScore(cost);
    const finalScore = computeFinalScore(quality, costScore);

    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        status: "approved",
        quality_score: quality,
        cost_score: costScore,
        final_score: finalScore,
        admin_notes: draft.adminNotes.trim() || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    setActionId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await load();
    setExpandedId(null);
  }

  async function handleReject(row: SubmissionRow) {
    const draft = getDraft(row);
    const supabase = createBrowserSupabase();
    if (!supabase) return;

    setActionId(row.id);
    setError(null);

    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        status: "rejected",
        admin_notes: draft.adminNotes.trim() || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    setActionId(null);
    if (updateError) {
      setError(updateError.message);
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
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-400/80">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Submission review</h1>
        <p className="mt-2 text-zinc-400">Challenge #1 — manual quality review and scoring</p>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <span>Admin panel is unprotected in MVP mode. Do not share this URL publicly.</span>
        </div>

        {!configured && (
          <p className="mt-4 text-sm text-red-400">
            Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
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
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="mt-12 flex justify-center text-zinc-500">
            <Loader2 className="size-8 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="glass-card mt-8 rounded-xl p-8 text-center text-sm text-zinc-400">
            No submissions in this filter.
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
                      <DetailBlock label="Prompt used" value={row.prompt_used} mono />
                      <DetailBlock label="Output result" value={row.output_result} />
                      {row.workflow_notes && (
                        <DetailBlock label="Workflow notes" value={row.workflow_notes} />
                      )}
                      <div className="grid gap-4 sm:grid-cols-3 text-sm">
                        <div>
                          <p className="text-xs text-zinc-500">Model</p>
                          <p className="mt-0.5">{row.model_used}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Role</p>
                          <p className="mt-0.5">{row.role ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Submitted</p>
                          <p className="mt-0.5 text-xs">
                            {new Date(row.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-xs font-medium text-zinc-400">
                            Quality score (0–100)
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
                          <span className="text-xs font-medium text-zinc-400">Admin notes</span>
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
                          <dt className="text-xs text-zinc-500">Cost score (auto)</dt>
                          <dd className="font-mono text-cyan-400">{previewCostScore}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-zinc-500">Final score (auto)</dt>
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
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={actionId === row.id}
                          onClick={() => handleReject(row)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-5 py-2 text-sm font-medium text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                        >
                          <X className="size-4" />
                          Reject
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
