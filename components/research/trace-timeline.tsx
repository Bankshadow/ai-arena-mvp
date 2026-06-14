import type { ResearchTrace } from "@/lib/research/types";

const PHASE_COLORS: Record<string, string> = {
  decomposing: "border-violet-500/40 bg-violet-500/10",
  selecting_sources: "border-indigo-500/40 bg-indigo-500/10",
  retrieving: "border-teal-500/40 bg-teal-500/10",
  evaluating: "border-cyan-500/40 bg-cyan-500/10",
  reasoning: "border-amber-500/40 bg-amber-500/10",
  reporting: "border-emerald-500/40 bg-emerald-500/10",
};

export function TraceTimeline({ trace }: { trace: ResearchTrace }) {
  return (
    <ol className="relative space-y-0 border-l border-white/10 pl-6">
      {trace.steps.map((step) => (
        <li key={step.id} className="relative pb-6 last:pb-0">
          <span
            className={`absolute -left-[1.65rem] flex size-3 rounded-full border-2 ${
              PHASE_COLORS[step.phase] ?? "border-zinc-500 bg-zinc-800"
            }`}
          />
          <div className="rounded-lg border border-white/5 bg-black/20 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-xs uppercase text-indigo-300">{step.phase}</p>
              <span className="text-[10px] text-zinc-600">{step.duration_ms}ms</span>
            </div>
            <p className="mt-1 text-sm font-medium text-zinc-200">{step.action}</p>
            <p className="mt-1 text-xs text-zinc-500">{step.output_summary}</p>
            {step.evidence_ids.length > 0 && (
              <p className="mt-1 text-[10px] text-teal-500">
                {step.evidence_ids.length} evidence item(s)
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
