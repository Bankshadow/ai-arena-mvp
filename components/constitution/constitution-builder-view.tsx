"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, GitCompare, Layers, Shield } from "lucide-react";

import { ConstitutionBattlePanel } from "@/components/constitution/constitution-battle-panel";
import { ConstitutionForm } from "@/components/constitution/constitution-form";
import { PromptDiffViewer } from "@/components/constitution/prompt-diff-viewer";
import { Nav } from "@/components/Nav";
import { getDefaultLeanBattle } from "@/lib/constitution/battle";
import {
  compareConstitutions,
  getVersionActualImpacts,
} from "@/lib/constitution/diff";
import { getMockConstitutionRecords } from "@/lib/constitution/mock-data";
import { computeConstitutionScore } from "@/lib/constitution/scoring";
import { ConstitutionStore } from "@/lib/constitution/store";
import type {
  AgentConstitutionRecord,
  ConstitutionFormInput,
  ConstitutionVersionLabel,
  PromptDiff,
} from "@/lib/constitution/types";

function emptyDraft(record?: AgentConstitutionRecord): ConstitutionFormInput {
  const base = record?.versions[record.versions.length - 1];
  if (base) {
    const { id: _id, constitutionId: _cid, constitutionScore: _s, createdAt: _c, updatedAt: _u, ...rest } = base;
    return { ...rest, version: `${base.version}-draft` as ConstitutionVersionLabel };
  }
  return {
    agentName: "New Agent",
    agentType: "competitor",
    agentId: "custom-agent",
    roleDefinition: "",
    primaryGoal: "",
    secondaryGoal: "",
    behaviorRules: [""],
    toolUsagePolicy: "",
    modelProviderPolicy: "",
    costPolicy: "",
    tokenPolicy: "",
    memoryPolicy: "",
    riskPolicy: "",
    refusalOrSkipRules: [""],
    outputFormatContract: "",
    selfReviewProtocol: "",
    evaluationPreference: "",
    marketplacePositioning: "",
    version: "v1.0",
  };
}

export function ConstitutionBuilderView() {
  const [store] = useState(() => new ConstitutionStore());
  const [records, setRecords] = useState<AgentConstitutionRecord[]>(() => getMockConstitutionRecords());
  const [selectedId, setSelectedId] = useState(records[0]?.id ?? "");
  const [selectedVersion, setSelectedVersion] = useState<ConstitutionVersionLabel>("v1.2");
  const [compareVersion, setCompareVersion] = useState<ConstitutionVersionLabel>("v1.1");
  const [draft, setDraft] = useState<ConstitutionFormInput>(() => emptyDraft(records[0]));
  const [diff, setDiff] = useState<PromptDiff | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const selectedRecord = useMemo(
    () => records.find((r) => r.id === selectedId) ?? null,
    [records, selectedId],
  );

  useEffect(() => {
    setRecords(store.list());
  }, [store]);

  useEffect(() => {
    if (!selectedRecord) return;
    const ver = selectedRecord.versions.find((v) => v.version === selectedVersion);
    if (ver) {
      const { id: _id, constitutionId: _cid, constitutionScore: _s, createdAt: _c, updatedAt: _u, ...rest } = ver;
      setDraft(rest);
    }
  }, [selectedRecord, selectedVersion]);

  useEffect(() => {
    if (!selectedRecord) {
      setDiff(null);
      return;
    }
    const from = selectedRecord.versions.find((v) => v.version === compareVersion);
    const to = selectedRecord.versions.find((v) => v.version === selectedVersion);
    if (from && to && from.version !== to.version) {
      const impacts = getVersionActualImpacts(from.version, to.version);
      setDiff(compareConstitutions(from, to, impacts));
    } else {
      setDiff(null);
    }
  }, [selectedRecord, selectedVersion, compareVersion]);

  const handleSave = useCallback(() => {
    if (!selectedRecord) return;
    setSaving(true);
    const score = computeConstitutionScore(draft as import("@/lib/constitution/types").AgentConstitution);
    store.saveVersion(selectedRecord.id, draft);
    setRecords(store.list());
    setSavedMessage(`Saved ${draft.version} · constitution score ${score}`);
    setSaving(false);
    setTimeout(() => setSavedMessage(null), 3000);
  }, [draft, selectedRecord, store]);

  const runBattle = useCallback(async (agentId: string, versions: string[]) => {
    const res = await fetch("/api/constitution/battle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId, versions }),
    });
    if (!res.ok) return null;
    return res.json();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.12),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400/80">
          Agent Operating System
        </p>
        <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
          <BookOpen className="size-8 text-cyan-400" />
          Constitution Builder
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Define the full operating specification for an AI agent — not just a prompt, but role,
          policies, output contract, and evaluation rules. Agents compete by{" "}
          <span className="text-violet-300">system design</span>, not output alone.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/agents"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
          >
            ← Agents
          </Link>
          <Link
            href="/tournament"
            className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-200"
          >
            Tournament engine
          </Link>
        </div>

        {savedMessage && (
          <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
            {savedMessage}
          </p>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <section className="glass-card rounded-2xl p-4">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                <Layers className="size-4 text-violet-400" /> Constitutions
              </p>
              <ul className="mt-3 space-y-1">
                {records.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(r.id);
                        setSelectedVersion(r.currentVersion);
                      }}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                        selectedId === r.id
                          ? "bg-violet-500/15 text-violet-100"
                          : "text-zinc-400 hover:bg-white/5"
                      }`}
                    >
                      <span className="font-medium">{r.agentName}</span>
                      <span className="mt-0.5 block text-xs text-zinc-600">
                        {r.agentType} · {r.currentVersion}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {selectedRecord && (
              <section className="glass-card rounded-2xl p-4">
                <p className="text-xs uppercase tracking-wider text-zinc-500">Version</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedRecord.versions.map((v) => (
                    <button
                      key={v.version}
                      type="button"
                      onClick={() => setSelectedVersion(v.version)}
                      className={`rounded-lg px-2 py-1 font-mono text-xs ${
                        selectedVersion === v.version
                          ? "bg-cyan-500/20 text-cyan-200"
                          : "border border-white/10 text-zinc-500"
                      }`}
                    >
                      {v.version}
                    </button>
                  ))}
                </div>
                <p className="mt-3 flex items-center gap-1 text-xs text-emerald-400">
                  <Shield className="size-3.5" />
                  Score {selectedRecord.versions.find((v) => v.version === selectedVersion)?.constitutionScore ?? "—"}
                </p>
              </section>
            )}
          </aside>

          <div className="space-y-6">
            <ConstitutionForm
              record={selectedRecord}
              draft={draft}
              onChange={setDraft}
              onSave={handleSave}
              saving={saving}
            />
          </div>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-2">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
              <GitCompare className="size-4 text-amber-400" /> Compare versions
            </p>
            {selectedRecord && (
              <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                <select
                  value={compareVersion}
                  onChange={(e) => setCompareVersion(e.target.value)}
                  className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs"
                >
                  {selectedRecord.versions.map((v) => (
                    <option key={v.version} value={v.version}>
                      {v.version}
                    </option>
                  ))}
                </select>
                <span className="text-zinc-600">→</span>
                <select
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                  className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs"
                >
                  {selectedRecord.versions.map((v) => (
                    <option key={v.version} value={v.version}>
                      {v.version}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <PromptDiffViewer diff={diff} />
          </div>

          <ConstitutionBattlePanel
            onRunBattle={runBattle}
            defaultResult={getDefaultLeanBattle()}
          />
        </div>
      </main>
    </div>
  );
}
