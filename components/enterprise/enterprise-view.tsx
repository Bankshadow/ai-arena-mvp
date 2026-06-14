"use client";

import { useState } from "react";
import { Building2, Lock, Upload } from "lucide-react";

import { Nav } from "@/components/Nav";
import { HUMAN_ID, rankHuman, type HumanResult } from "@/lib/agents/human";
import type { AgentPersona, AgentPersonaId } from "@/lib/agents/types";

type Props = { personas: AgentPersona[] };

const RUBRIC_DIMS = ["Accuracy", "Completeness", "Structure", "Risk ID", "Recommendation", "Cost efficiency"];
const DEFAULT_WEIGHTS = [25, 20, 15, 10, 10, 20];

export function EnterpriseView({ personas }: Props) {
  const [challengeName, setChallengeName] = useState("Q3 Board Report Summary");
  const [docName, setDocName] = useState("");
  const [weights, setWeights] = useState<number[]>(DEFAULT_WEIGHTS);
  const [selected, setSelected] = useState<AgentPersonaId[]>(["frugal", "laureate", "scholar", "atlas"]);
  const [internalName, setInternalName] = useState("Internal RAG pipeline");
  const [internalCost, setInternalCost] = useState(0.25);
  const [internalQuality, setInternalQuality] = useState(72);
  const [result, setResult] = useState<HumanResult | null>(null);

  const weightTotal = weights.reduce((a, b) => a + b, 0);

  function toggleAgent(id: AgentPersonaId) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function run() {
    // Map the quality slider to a representative output for the heuristic judge.
    const filler = "executive summary key risks business impact recommendations ".repeat(
      Math.max(1, Math.round(internalQuality / 10)),
    );
    setResult(
      rankHuman(
        { name: internalName, modelUsed: "internal", costUsd: internalCost, output: filler },
        selected.length ? selected : undefined,
      ),
    );
  }

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.1),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400/80">
            MVP4 · AI ARENA for Teams
          </p>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs text-emerald-300">
            <Building2 className="size-3.5" /> Acme Corp · Enterprise
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-xs text-zinc-400">
            <Lock className="size-3.5" /> Private · data-isolated
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Private challenge benchmark</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Run the arena on your internal documents. Define a private challenge with a custom
          rubric, then benchmark your internal workflow against AI Agent baselines — results
          stay inside your org.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Step 1: challenge config */}
          <section className="glass-card space-y-4 rounded-2xl p-6">
            <h2 className="text-lg font-semibold">1 · Challenge & rubric</h2>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">Challenge name</label>
              <input
                value={challengeName}
                onChange={(e) => setChallengeName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">Internal document</label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/15 bg-black/20 px-3 py-2.5 text-sm text-zinc-400 hover:border-cyan-400/40">
                <Upload className="size-4" />
                {docName || "Upload PDF / DOCX (mock — stays private)"}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setDocName(e.target.files?.[0]?.name ?? "")}
                />
              </label>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm text-zinc-400">
                <span>Custom rubric weights</span>
                <span className={weightTotal === 100 ? "text-emerald-400" : "text-amber-400"}>
                  total {weightTotal}/100
                </span>
              </div>
              <div className="space-y-2">
                {RUBRIC_DIMS.map((dim, i) => (
                  <div key={dim} className="flex items-center gap-3">
                    <span className="w-32 text-xs text-zinc-400">{dim}</span>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      value={weights[i]}
                      onChange={(e) => {
                        const next = [...weights];
                        next[i] = Number(e.target.value);
                        setWeights(next);
                      }}
                      className="flex-1 accent-violet-500"
                    />
                    <span className="w-8 text-right font-mono text-xs text-cyan-400">{weights[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Step 2: competitors */}
          <section className="glass-card space-y-4 rounded-2xl p-6">
            <h2 className="text-lg font-semibold">2 · Baselines & your workflow</h2>
            <div>
              <p className="mb-2 text-sm text-zinc-400">AI baseline agents</p>
              <div className="grid grid-cols-2 gap-2">
                {personas.map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={() => toggleAgent(p.id)}
                      className="accent-violet-500"
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="border-t border-white/10 pt-4">
              <label className="mb-1 block text-sm text-zinc-400">Your internal workflow</label>
              <input
                value={internalName}
                onChange={(e) => setInternalName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
              />
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">
                    Cost/run: <span className="font-mono text-cyan-400">${internalCost.toFixed(2)}</span>
                  </label>
                  <input
                    type="range" min={0.01} max={1} step={0.01} value={internalCost}
                    onChange={(e) => setInternalCost(Number(e.target.value))}
                    className="w-full accent-violet-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">
                    Quality: <span className="font-mono text-violet-300">{internalQuality}</span>
                  </label>
                  <input
                    type="range" min={40} max={98} value={internalQuality}
                    onChange={(e) => setInternalQuality(Number(e.target.value))}
                    className="w-full accent-violet-500"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={run}
              disabled={selected.length === 0}
              className="w-full rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-2.5 text-sm font-medium text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-40"
            >
              Run private benchmark
            </button>
          </section>
        </div>

        {/* private report */}
        {result && (
          <section className="mt-8 glass-card rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{challengeName} — private report</h2>
              <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                <Lock className="size-3.5" /> Visible to Acme Corp only
              </span>
            </div>
            <p className="mt-2 text-sm text-zinc-400">
              {internalName} ranked <span className="text-white">#{result.you.rank}</span> of{" "}
              {result.board.length}, beating {result.beat} of {result.board.length - 1} AI baselines.
            </p>
            <div className="mt-4 overflow-x-auto rounded-lg border border-white/10">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-4 py-2.5">#</th>
                    <th className="px-4 py-2.5">Competitor</th>
                    <th className="px-4 py-2.5 text-right">Quality</th>
                    <th className="px-4 py-2.5 text-right">Cost</th>
                    <th className="px-4 py-2.5 text-right">Value</th>
                    <th className="px-4 py-2.5 text-right">Final</th>
                  </tr>
                </thead>
                <tbody>
                  {result.board.map((e) => {
                    const mine = e.agent.id === HUMAN_ID;
                    return (
                      <tr key={e.agent.id} className={mine ? "bg-emerald-500/10" : "border-t border-white/5"}>
                        <td className="px-4 py-2.5 font-mono text-zinc-500">{e.rank}</td>
                        <td className="px-4 py-2.5">
                          {mine ? (
                            <span className="font-semibold text-emerald-200">{e.agent.name} (internal)</span>
                          ) : (
                            <span className="text-zinc-300">{e.agent.name}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-violet-300">{e.score.qualityAdj}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-cyan-400">${e.run.costUsd.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-emerald-400">{e.score.valueScore}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-white">{e.score.finalScore}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
