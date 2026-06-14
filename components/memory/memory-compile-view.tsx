"use client";

import { useState } from "react";

import { MemoryShell } from "@/components/memory/memory-shell";
import { useMemory } from "@/components/memory/memory-provider";
import { listLocalTournamentRounds } from "@/lib/tournament/local-storage";
import type { TournamentState } from "@/lib/tournament/types";

function getLatestTournamentState(): TournamentState | null {
  const rounds = listLocalTournamentRounds();
  return rounds[0]?.state ?? null;
}

export function MemoryCompileView() {
  const { mergeFromTournament, mergeKb, kb } = useMemory();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function runCompile() {
    setBusy(true);
    setMessage(null);

    const state = getLatestTournamentState();
    if (!state || state.tournament.evaluations.length === 0) {
      setMessage("Run a tournament round first — compile needs evaluation data.");
      setBusy(false);
      return;
    }

    try {
      const res = await fetch("/api/memory/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        message: string;
        knowledgeBase?: Parameters<typeof mergeKb>[0];
      };
      if (data.ok && data.knowledgeBase) {
        mergeKb(data.knowledgeBase);
        setMessage(data.message);
      } else if (data.ok) {
        mergeFromTournament(state);
        setMessage(data.message);
      } else {
        mergeFromTournament(state);
        setMessage(data.message ?? "Compiled locally (API skipped)");
      }
    } catch {
      mergeFromTournament(state);
      setMessage("Compiled from latest saved tournament (offline)");
    } finally {
      setBusy(false);
    }
  }

  const latest = getLatestTournamentState();

  return (
    <MemoryShell
      title="Run memory compile"
      subtitle="Admin: extract lessons from latest tournament data and compile knowledge articles (mock pipeline)."
    >
      <div className="glass-card max-w-xl rounded-2xl p-6">
        <p className="text-sm text-zinc-400">
          Pipeline: capture events → extract lessons → compile articles → update agent lessons →
          constitution proposals → marketplace evidence → lint.
        </p>
        <p className="mt-4 text-xs text-zinc-600">
          Source:{" "}
          {latest
            ? `Round ${latest.tournament.round} · ${latest.tournament.evaluations.length} evaluations`
            : "No saved tournament rounds"}
        </p>
        <p className="mt-1 text-xs text-zinc-600">
          Last compile: {kb.compileRuns[0]?.completed_at ?? "never"} · {kb.articles.length} articles
          in KB
        </p>
        <button
          type="button"
          disabled={busy || !latest}
          onClick={runCompile}
          className="mt-6 w-full rounded-xl border border-cyan-500/40 bg-cyan-500/15 py-3 text-sm font-medium text-cyan-100 disabled:opacity-50"
        >
          {busy ? "Compiling…" : "Run memory compile (mock)"}
        </button>
        {message && <p className="mt-4 text-sm text-emerald-400">{message}</p>}
      </div>
    </MemoryShell>
  );
}
