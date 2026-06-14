"use client";

import { useEffect, useState } from "react";
import { Bot, Sparkles, Swords } from "lucide-react";
import Link from "next/link";

import { BattleResults } from "@/components/battles/battle-results";
import { Nav } from "@/components/Nav";
import { getAgentById } from "@/lib/agents/personas";
import { readArenaBridge } from "@/lib/bridge/arena-output";
import { DEFAULT_BATTLE_AGENTS } from "@/lib/battle/constants";
import { upsertLocalBattle } from "@/lib/battle/local-storage";
import type { BattleMode, SavedBattleRecord } from "@/lib/battle/saved-battle";
import type { BattleResult } from "@/lib/battle/types";
import type { GeneratedChallenge } from "@/lib/challenge/types";

type RunBattleResponse = BattleResult & {
  mode: BattleMode;
  savedBattleId: string;
  savedAt: string;
  persistError?: string | null;
};

type Phase = "setup" | "preview" | "running" | "results";

const TOPICS = [
  "product analytics rollout",
  "customer churn reduction",
  "AI compliance audit",
  "supply chain risk",
  "enterprise sales pipeline",
];

export function BattleView() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [difficulty, setDifficulty] = useState<GeneratedChallenge["difficulty"]>("medium");
  const [challenge, setChallenge] = useState<GeneratedChallenge | null>(null);
  const [result, setResult] = useState<RunBattleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [persistNote, setPersistNote] = useState<string | null>(null);
  const [arenaBridge, setArenaBridge] = useState<ReturnType<typeof readArenaBridge>>(null);

  useEffect(() => {
    setArenaBridge(readArenaBridge());
  }, []);

  const effectiveTopic = customTopic.trim() || topic;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);
    setPersistNote(null);

    try {
      const res = await fetch("/api/generate-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: effectiveTopic, difficulty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Generate failed");

      setChallenge(data as GeneratedChallenge);
      setPhase("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate challenge");
    } finally {
      setLoading(false);
    }
  }

  async function handleStartBattle() {
    if (!challenge) return;

    setLoading(true);
    setError(null);
    setPhase("running");

    try {
      const res = await fetch("/api/run-battle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge, agentIds: DEFAULT_BATTLE_AGENTS }),
      });
      const data = (await res.json()) as RunBattleResponse & { error?: string };
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Battle failed");
      }

      const record: SavedBattleRecord = {
        id: data.savedBattleId,
        challenge: data.challenge,
        entries: data.entries,
        winner: data.winner,
        passedCount: data.passedCount,
        mode: data.mode,
        savedAt: data.savedAt,
      };
      upsertLocalBattle(record);

      if (data.persistError) {
        setPersistNote(`Saved in browser only (${data.persistError}). Run supabase/schema.sql to enable cloud history.`);
      }

      setResult(data);
      setPhase("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run battle");
      setPhase("preview");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setPhase("setup");
    setChallenge(null);
    setResult(null);
    setError(null);
    setPersistNote(null);
  }

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(168,85,247,0.12),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400/80">
          MVP6 · AI Challenge Battle
        </p>
        <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
          <Swords className="size-8 text-violet-400" />
          Token Efficiency Battle
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          An AI designs the challenge. Five agents compete to meet the rubric using the fewest
          tokens. Winner = passes quality gate + lowest total tokens.
        </p>

        {arenaBridge && (
          <div className="mt-6 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
            Arena output loaded ({arenaBridge.output.length} chars, rank #{arenaBridge.rank ?? "?"}).
            {" "}
            <Link href="/submit" className="font-medium underline hover:text-white">
              Submit to leaderboard
            </Link>
            {" · "}
            <Link href="/arena" className="font-medium underline hover:text-white">
              Back to Arena
            </Link>
          </div>
        )}

        {phase === "setup" && (
          <section className="glass-card mt-8 space-y-5 rounded-2xl p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="size-5 text-violet-400" />
              1 · Generate challenge
            </h2>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">Topic preset</label>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTopic(t);
                      setCustomTopic("");
                    }}
                    className={`rounded-lg border px-3 py-1.5 text-xs capitalize transition ${
                      topic === t && !customTopic.trim()
                        ? "border-violet-500/50 bg-violet-500/15 text-violet-200"
                        : "border-white/10 text-zinc-400 hover:border-white/20"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-zinc-400">Or custom topic</label>
              <input
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g. fintech fraud detection playbook"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-violet-400/40"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-zinc-400">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as GeneratedChallenge["difficulty"])}
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-violet-400/40"
              >
                <option value="easy" className="bg-zinc-900">Easy (pass ≥ 60)</option>
                <option value="medium" className="bg-zinc-900">Medium (pass ≥ 65)</option>
                <option value="hard" className="bg-zinc-900">Hard (pass ≥ 72)</option>
              </select>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-zinc-500">
              Competitors:{" "}
              {DEFAULT_BATTLE_AGENTS.map((id) => getAgentById(id)?.name).join(", ")}
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full rounded-xl border border-violet-500/40 bg-violet-500/10 px-5 py-2.5 text-sm font-medium text-violet-200 hover:bg-violet-500/20 disabled:opacity-40"
            >
              {loading ? "Designing challenge…" : "Generate challenge"}
            </button>
          </section>
        )}

        {phase === "preview" && challenge && (
          <section className="mt-8 space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold">{challenge.title}</h2>
              <p className="mt-2 text-sm text-zinc-400">{challenge.brief}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <p className="text-xs text-zinc-500">Pass threshold</p>
                  <p className="font-mono text-violet-300">{challenge.passThreshold}/100</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <p className="text-xs text-zinc-500">Difficulty</p>
                  <p className="capitalize text-white">{challenge.difficulty}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <p className="text-xs text-zinc-500">Input length</p>
                  <p className="font-mono text-cyan-300">{challenge.inputDoc.length} chars</p>
                </div>
              </div>

              <details className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3">
                <summary className="cursor-pointer text-sm text-zinc-300">Source document</summary>
                <pre className="mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap text-xs text-zinc-500">
                  {challenge.inputDoc}
                </pre>
              </details>

              <details className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
                <summary className="cursor-pointer text-sm text-zinc-300">Required output format</summary>
                <pre className="mt-3 whitespace-pre-wrap text-xs text-zinc-500">{challenge.outputFormat}</pre>
              </details>

              <ul className="mt-3 list-inside list-disc text-xs text-zinc-500">
                {challenge.rubricCriteria.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleStartBattle}
              disabled={loading}
              className="flex-1 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-2.5 text-sm font-medium text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-40"
            >
              {loading ? "Running battle…" : "Start 5-agent battle"}
            </button>
              <button
                type="button"
                onClick={reset}
                disabled={loading}
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-zinc-400 hover:bg-white/5"
              >
                Back
              </button>
            </div>
          </section>
        )}

        {phase === "running" && (
          <section className="glass-card mt-8 flex flex-col items-center justify-center rounded-2xl p-12 text-center">
            <Bot className="size-12 animate-pulse text-violet-400" />
            <p className="mt-4 text-lg font-medium">Battle in progress…</p>
            <p className="mt-2 text-sm text-zinc-500">
              Running 5 agents in parallel, then judging each output. This may take 30–90 seconds.
            </p>
          </section>
        )}

        {phase === "results" && result && (
          <section className="mt-8 space-y-6">
            <BattleResults
              result={result}
              mode={result.mode}
              savedBattleId={result.savedBattleId}
              persistNote={persistNote}
            />
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-violet-500/40 bg-violet-500/10 px-5 py-2.5 text-sm font-medium text-violet-200 hover:bg-violet-500/20"
            >
              New battle
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
