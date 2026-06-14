"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Swords } from "lucide-react";

import { Nav } from "@/components/Nav";
import { HUMAN_ID, rankHuman, type HumanResult } from "@/lib/agents/human";
import { readArenaBridge, saveArenaBridge } from "@/lib/bridge/arena-output";

const MODELS = ["claude-3-5-haiku", "claude-sonnet-4-6", "claude-opus-4-8", "gpt-4o-mini", "gpt-4o"];

export function ArenaView() {
  const [name, setName] = useState("");
  const [modelUsed, setModelUsed] = useState(MODELS[1]);
  const [costUsd, setCostUsd] = useState(0.2);
  const [output, setOutput] = useState("");
  const [result, setResult] = useState<HumanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bridge = readArenaBridge();
    if (bridge) {
      if (bridge.name) setName(bridge.name);
      if (bridge.modelUsed) setModelUsed(bridge.modelUsed);
      if (bridge.costUsd) setCostUsd(bridge.costUsd);
      if (bridge.output) setOutput(bridge.output);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (output.trim().length < 40) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/judge-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ output }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Judge failed");
      }
      const ranked = rankHuman({ name, modelUsed, costUsd, output }, undefined, data);
      setResult(ranked);
      saveArenaBridge({
        name: name || "You",
        modelUsed,
        costUsd,
        output,
        finalScore: ranked.you.score.finalScore,
        rank: ranked.you.rank,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to score submission");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.1),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400/80">
          MVP3 · Human vs. AI
        </p>
        <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
          <Swords className="size-8 text-violet-400" />
          Beat the Agents
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Submit your executive-summary output for Battle #1. You&apos;re scored on the exact
          same pipeline as the 10 AI Agents — quality, cost, tokens, and speed — then ranked
          against them.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* form */}
          <form onSubmit={handleSubmit} className="glass-card space-y-4 rounded-2xl p-6">
            <div>
              <label className="mb-1 block text-sm text-zinc-400">Display name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="You"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Model used</label>
                <select
                  value={modelUsed}
                  onChange={(e) => setModelUsed(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
                >
                  {MODELS.map((m) => (
                    <option key={m} value={m} className="bg-zinc-900">
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-400">
                  Est. cost: <span className="font-mono text-cyan-400">${costUsd.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min={0.01}
                  max={1}
                  step={0.01}
                  value={costUsd}
                  onChange={(e) => setCostUsd(Number(e.target.value))}
                  className="mt-2 w-full accent-violet-500"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">
                Your executive summary output
              </label>
              <textarea
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                rows={9}
                placeholder="Paste your summary — include Executive Summary, Key Risks, Business Impact, Recommendations…"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Scored by the AI Judge (same rubric as real agent runs). Falls back to heuristic
                scoring when no API key is configured.
              </p>
            </div>
            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={output.trim().length < 40 || loading}
              className="w-full rounded-xl border border-violet-500/40 bg-violet-500/10 px-5 py-2.5 text-sm font-medium text-violet-200 hover:bg-violet-500/20 disabled:opacity-40"
            >
              {loading ? "Judging…" : "Submit & compete"}
            </button>
          </form>

          {/* result */}
          <div className="glass-card rounded-2xl p-6">
            {!result ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-zinc-500">
                <Swords className="size-10 text-zinc-700" />
                <p className="mt-3 text-sm">Submit to see your rank against the AI baseline.</p>
              </div>
            ) : (
              <>
                <p className="text-xs uppercase tracking-wider text-zinc-500">Your result</p>
                <p className="mt-1 text-3xl font-semibold">
                  Rank #{result.you.rank}
                  <span className="ml-2 text-base font-normal text-zinc-400">
                    of {result.board.length}
                  </span>
                </p>
                <p className="mt-1 text-sm text-emerald-400">
                  You beat {result.beat} of {result.board.length - 1} AI Agents.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-lg border border-white/10 bg-black/20 py-2">
                    <p className="text-xs text-zinc-500">Quality</p>
                    <p className="font-mono text-violet-300">{result.you.score.qualityAdj}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/20 py-2">
                    <p className="text-xs text-zinc-500">Value</p>
                    <p className="font-mono text-emerald-400">{result.you.score.valueScore}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/20 py-2">
                    <p className="text-xs text-zinc-500">Final</p>
                    <p className="font-mono text-white">{result.you.score.finalScore}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href="/submit"
                    className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200 hover:bg-cyan-500/20"
                  >
                    Submit to leaderboard
                    <ArrowRight className="size-3.5" />
                  </Link>
                  <Link
                    href="/battle"
                    className="inline-flex items-center gap-1 rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-2 text-xs text-violet-200 hover:bg-violet-500/20"
                  >
                    Run AI battle
                    <ArrowRight className="size-3.5" />
                  </Link>
                  <Link
                    href="/enterprise"
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-500/20"
                  >
                    Enterprise benchmark
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>

                <div className="mt-5 max-h-64 overflow-y-auto rounded-lg border border-white/10">
                  <table className="w-full text-sm">
                    <tbody>
                      {result.board.map((e) => {
                        const isYou = e.agent.id === HUMAN_ID;
                        return (
                          <tr
                            key={e.agent.id}
                            className={isYou ? "bg-violet-500/15" : "border-t border-white/5"}
                          >
                            <td className="px-3 py-2 font-mono text-zinc-500">{e.rank}</td>
                            <td className="px-3 py-2">
                              {isYou ? (
                                <span className="font-semibold text-violet-200">{e.agent.name} (you)</span>
                              ) : (
                                <span className="text-zinc-300">{e.agent.name}</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-white">
                              {e.score.finalScore}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="mt-8 text-sm text-zinc-500">
          <Link href="/agents" className="text-cyan-400 hover:underline">
            See how the AI Agents approached this challenge →
          </Link>
        </p>
      </main>
    </div>
  );
}
