"use client";

import { useState } from "react";

import { MemoryShell } from "@/components/memory/memory-shell";
import { useMemory } from "@/components/memory/memory-provider";
import { queryMemory } from "@/lib/memory/query";

export function MemoryQueryView() {
  const { kb } = useMemory();
  const [q, setQ] = useState("");
  const [result, setResult] = useState<ReturnType<typeof queryMemory> | null>(null);

  function search(e: React.FormEvent) {
    e.preventDefault();
    setResult(queryMemory(q, kb.articles, kb.lessons));
  }

  return (
    <MemoryShell title="Query tournament memory" subtitle="Ask about past rounds, agents, cost, routing (mock keyword search).">
      <form onSubmit={search} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. lean cost, groq routing, failure mode"
          className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm"
        />
        <button
          type="submit"
          className="rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-5 text-sm text-cyan-100"
        >
          Query
        </button>
      </form>

      {result && (
        <div className="mt-8 space-y-6">
          <section className="glass-card rounded-2xl p-5">
            <p className="text-xs uppercase text-zinc-500">Answer</p>
            <p className="mt-2 text-zinc-200">{result.answer}</p>
            <p className="mt-2 text-xs text-zinc-600">
              Confidence {(result.confidence * 100).toFixed(0)}%
            </p>
          </section>
          {result.matched_articles.length > 0 && (
            <section className="glass-card rounded-2xl p-5">
              <p className="text-xs uppercase text-zinc-500">Matched articles</p>
              <ul className="mt-2 space-y-1 text-sm text-cyan-400">
                {result.matched_articles.map((a) => (
                  <li key={a.id}>{a.title}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <p className="mt-8 text-xs text-zinc-600">
        Try: lean, premium failure, groq, constitution, marketplace
      </p>
    </MemoryShell>
  );
}
