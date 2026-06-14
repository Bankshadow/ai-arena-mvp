"use client";

import type { AgentConstitutionRecord, ConstitutionFormInput } from "@/lib/constitution/types";
import { CONSTITUTION_FIELDS } from "@/lib/constitution/types";

type Props = {
  record: AgentConstitutionRecord | null;
  draft: ConstitutionFormInput;
  onChange: (draft: ConstitutionFormInput) => void;
  onSave: () => void;
  saving?: boolean;
};

const SECTIONS: { title: string; keys: (keyof ConstitutionFormInput)[] }[] = [
  {
    title: "Identity",
    keys: ["agentName", "agentType", "agentId", "version"],
  },
  {
    title: "Role and goal",
    keys: ["roleDefinition", "primaryGoal", "secondaryGoal", "behaviorRules"],
  },
  {
    title: "Model and provider policy",
    keys: ["modelProviderPolicy"],
  },
  {
    title: "Cost / token behavior",
    keys: ["costPolicy", "tokenPolicy"],
  },
  {
    title: "Tool usage rules",
    keys: ["toolUsagePolicy"],
  },
  {
    title: "Memory rules",
    keys: ["memoryPolicy", "riskPolicy", "refusalOrSkipRules"],
  },
  {
    title: "Output format",
    keys: ["outputFormatContract"],
  },
  {
    title: "Self-review rules",
    keys: ["selfReviewProtocol"],
  },
  {
    title: "Evaluation criteria",
    keys: ["evaluationPreference"],
  },
  {
    title: "Marketplace value",
    keys: ["marketplacePositioning"],
  },
];

function fieldMeta(key: keyof ConstitutionFormInput) {
  return CONSTITUTION_FIELDS.find((f) => f.key === key);
}

export function ConstitutionForm({ record, draft, onChange, onSave, saving }: Props) {
  function update<K extends keyof ConstitutionFormInput>(key: K, value: ConstitutionFormInput[K]) {
    onChange({ ...draft, [key]: value });
  }

  function renderField(key: keyof ConstitutionFormInput) {
    if (key === "agentName" || key === "agentId" || key === "version") {
      return (
        <label key={key} className="block">
          <span className="text-xs text-zinc-500 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
          <input
            value={String(draft[key])}
            onChange={(e) => update(key, e.target.value as ConstitutionFormInput[typeof key])}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200"
          />
        </label>
      );
    }

    if (key === "agentType") {
      return (
        <label key={key} className="block">
          <span className="text-xs text-zinc-500">Agent type</span>
          <select
            value={draft.agentType}
            onChange={(e) => update("agentType", e.target.value as ConstitutionFormInput["agentType"])}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200"
          >
            <option value="competitor">Competitor</option>
            <option value="creator">Creator</option>
            <option value="judge">Judge</option>
            <option value="orchestrator">Orchestrator</option>
          </select>
        </label>
      );
    }

    const meta = fieldMeta(key);
    if (!meta) return null;

    if (meta.list) {
      const items = draft[key] as string[];
      return (
        <div key={key} className="space-y-2">
          <span className="text-xs text-zinc-500">{meta.label}</span>
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={item}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = e.target.value;
                  update(key, next as ConstitutionFormInput[typeof key]);
                }}
                className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => update(key, items.filter((_, j) => j !== i) as ConstitutionFormInput[typeof key])}
                className="rounded-lg border border-red-500/30 px-2 text-xs text-red-300"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => update(key, [...items, ""] as ConstitutionFormInput[typeof key])}
            className="text-xs text-cyan-400 hover:text-cyan-300"
          >
            + Add rule
          </button>
        </div>
      );
    }

    return (
      <label key={key} className="block">
        <span className="text-xs text-zinc-500">{meta.label}</span>
        <textarea
          rows={meta.multiline ? 4 : 2}
          value={String(draft[key])}
          onChange={(e) => update(key, e.target.value as ConstitutionFormInput[typeof key])}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200"
        />
      </label>
    );
  }

  return (
    <div className="space-y-6">
      {record && (
        <p className="text-xs text-zinc-500">
          Editing constitution <span className="text-violet-300">{record.id}</span> · versions:{" "}
          {record.versions.map((v) => v.version).join(", ")}
        </p>
      )}

      {SECTIONS.map((section) => (
        <section
          key={section.title}
          className="glass-card rounded-2xl border border-white/10 p-5"
        >
          <h3 className="font-mono text-xs uppercase tracking-wider text-violet-400/80">
            {section.title}
          </h3>
          <div className="mt-4 space-y-4">
            {section.keys.map((key) => renderField(key))}
          </div>
        </section>
      ))}

      <button
        type="button"
        disabled={saving}
        onClick={onSave}
        className="w-full rounded-xl border border-violet-500/40 bg-violet-500/15 py-3 text-sm font-medium text-violet-100 hover:bg-violet-500/25 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save constitution version"}
      </button>
    </div>
  );
}
