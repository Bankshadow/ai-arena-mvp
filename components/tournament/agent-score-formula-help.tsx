"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export function AgentScoreFormulaHelp() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-white/10 bg-black/25">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-xs text-zinc-400 hover:text-zinc-200"
      >
        <HelpCircle className="size-3.5 shrink-0 text-violet-400" />
        <span>Agent score formula</span>
        <ChevronDown className={`ml-auto size-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-white/10 px-4 py-3 text-sm text-zinc-400">
          <p className="font-mono text-violet-200">
            Agent score = Quality 60 + Efficiency 30 + Marketplace 10 − Penalties
          </p>
          <ul className="mt-2 space-y-1 text-xs text-zinc-500">
            <li>Quality — accuracy, completeness, structure, usefulness, format</li>
            <li>Efficiency — cost, tokens, latency, workflow simplicity</li>
            <li>Marketplace — reusability, enterprise value, repeatability</li>
            <li>Penalties — cost cap, formatting, hallucination, missing sections</li>
          </ul>
        </div>
      )}
    </div>
  );
}
