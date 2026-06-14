"use client";

import Link from "next/link";

import { MemoryShell } from "@/components/memory/memory-shell";
import { useMemory } from "@/components/memory/memory-provider";

export function ConstitutionProposalsView() {
  const { kb } = useMemory();
  const proposals = kb.proposals;

  return (
    <MemoryShell
      title="Constitution update proposals"
      subtitle="Memory compiler suggestions for agent operating spec changes — review before applying."
    >
      <Link href="/agents/constitution-builder" className="text-sm text-violet-400 hover:underline">
        Open Constitution Builder →
      </Link>

      {proposals.length === 0 ? (
        <p className="mt-8 text-zinc-600">No proposals yet — compile memory after a tournament round.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {proposals.map((p) => (
            <li key={p.id} className="glass-card rounded-2xl border border-violet-500/20 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-zinc-100">
                    {p.agent_name}: {p.current_version} → {p.proposed_version}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Round {p.round} · {(p.confidence * 100).toFixed(0)}% confidence · {p.status}
                  </p>
                </div>
                {p.article_id && (
                  <Link href={`/memory/articles/${p.article_id}`} className="text-xs text-cyan-400">
                    Evidence →
                  </Link>
                )}
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {p.field_changes.map((fc, i) => (
                  <li key={i} className="rounded-lg bg-black/20 px-3 py-2">
                    <span className="font-mono text-violet-300">{fc.field}</span>
                    <p className="text-xs text-zinc-500">{fc.rationale}</p>
                    <p className="mt-1 text-xs text-red-400/80 line-through">{fc.before}</p>
                    <p className="text-xs text-emerald-400">{fc.after}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </MemoryShell>
  );
}
