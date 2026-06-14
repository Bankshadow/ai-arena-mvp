"use client";

export function AgentScoreFormulaHelp() {
  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3">
      <p className="font-mono text-sm text-violet-200">
        Agent score = Quality 60 + Efficiency 30 + Marketplace 10 − Penalties
      </p>
      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
        Quality covers accuracy, completeness, and structure. Efficiency covers cost, tokens, and
        latency. Marketplace covers reusability and enterprise value.
      </p>
    </div>
  );
}
