"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Archive, Loader2, Package, Send, X } from "lucide-react";

import { ComponentTypeBadge } from "@/components/marketplace/component-type-badge";
import { EvidenceTable } from "@/components/marketplace/evidence-table";
import {
  CANDIDATE_STATUS_LABELS,
  type CandidateStatus,
  type MarketplaceCandidateRecord,
} from "@/lib/marketplace/types";

type Props = {
  /** When false, still loads mock/in-memory candidates from API. */
  liveAvailable: boolean;
};

const STATUS_STYLE: Record<CandidateStatus, string> = {
  detected: "border-cyan-500/40 bg-cyan-500/10 text-cyan-200",
  draft: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300",
  review_needed: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  published: "border-violet-500/40 bg-violet-500/10 text-violet-200",
  archived: "border-red-500/40 bg-red-500/10 text-red-300",
};

export function AdminMarketplaceCandidatesPanel({ liveAvailable }: Props) {
  const [candidates, setCandidates] = useState<MarketplaceCandidateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/marketplace-candidates?status=all&limit=50", {
        credentials: "include",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? `HTTP ${res.status}`);
        return;
      }
      const data = (await res.json()) as { candidates: MarketplaceCandidateRecord[] };
      setCandidates(
        data.candidates.filter((c) => c.status !== "published" && c.status !== "archived"),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction(id: string, action: "approve" | "reject" | "publish" | "archive") {
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/marketplace-candidates/${id}/${action}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? `Action failed (${res.status})`);
        return;
      }
      await load();
    } finally {
      setActionId(null);
    }
  }

  return (
    <section className="glass-card rounded-2xl border border-white/10 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Package className="size-5 text-emerald-400" />
          Marketplace candidates
        </h2>
        <p className="text-xs text-zinc-500">
          Tournament → Proof → Component → Stack → Export
          {!liveAvailable && " · mock store"}
        </p>
      </div>
      <p className="mt-1 text-sm text-zinc-500">
        Detected after each round — review before publish. Nothing auto-lists.
      </p>

      {error && (
        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="size-4 animate-spin" /> Loading candidates…
        </p>
      ) : candidates.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-600">
          No pending candidates. Run a tournament round to detect proof-backed assets.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {candidates.map((c) => (
            <li key={c.id} className="rounded-xl border border-white/10 bg-black/25 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <ComponentTypeBadge type={c.component_type} small />
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] ${STATUS_STYLE[c.status]}`}
                    >
                      {CANDIDATE_STATUS_LABELS[c.status]}
                    </span>
                  </div>
                  <p className="mt-2 font-medium text-zinc-100">{c.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{c.description}</p>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    <div>
                      <dt className="text-zinc-600">Runs</dt>
                      <dd className="font-mono text-zinc-300">{c.tested_runs}</dd>
                    </div>
                    <div>
                      <dt className="text-zinc-600">Avg score</dt>
                      <dd className="font-mono text-emerald-300">{c.avg_score.toFixed(0)}</dd>
                    </div>
                    <div>
                      <dt className="text-zinc-600">Avg cost</dt>
                      <dd className="font-mono text-cyan-300">${c.avg_cost.toFixed(4)}</dd>
                    </div>
                    <div>
                      <dt className="text-zinc-600">Round</dt>
                      <dd className="font-mono text-violet-300">{c.source_round}</dd>
                    </div>
                  </dl>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionBtn
                    label="Approve"
                    icon={Check}
                    disabled={actionId === c.id}
                    onClick={() => runAction(c.id, "approve")}
                    className="border-emerald-500/30 text-emerald-300"
                  />
                  <ActionBtn
                    label="Reject"
                    icon={X}
                    disabled={actionId === c.id}
                    onClick={() => runAction(c.id, "reject")}
                    className="border-red-500/30 text-red-300"
                  />
                  <ActionBtn
                    label="Publish"
                    icon={Send}
                    disabled={actionId === c.id || c.status !== "approved"}
                    onClick={() => runAction(c.id, "publish")}
                    className="border-violet-500/30 text-violet-300"
                  />
                  <ActionBtn
                    label="Archive"
                    icon={Archive}
                    disabled={actionId === c.id}
                    onClick={() => runAction(c.id, "archive")}
                    className="border-zinc-500/30 text-zinc-400"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                className="mt-3 text-xs text-cyan-400 hover:underline"
              >
                {expandedId === c.id ? "Hide evidence" : "View evidence"}
              </button>

              {expandedId === c.id && (
                <div className="mt-3 space-y-3">
                  <EvidenceTable evidence={c.evidence} />
                  {c.component_id && (
                    <Link
                      href={`/components/${c.component_id}`}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      Open component →
                    </Link>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ActionBtn({
  label,
  icon: Icon,
  onClick,
  disabled,
  className,
}: {
  label: string;
  icon: typeof Check;
  onClick: () => void;
  disabled?: boolean;
  className: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs disabled:opacity-40 ${className}`}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}
