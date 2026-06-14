import type { ArenaScoreBreakdown } from "@/lib/marketplace/types";

type Props = {
  score: ArenaScoreBreakdown;
  highlight?: keyof ArenaScoreBreakdown;
};

const ROWS: { key: keyof ArenaScoreBreakdown; label: string; color: string }[] = [
  { key: "battle", label: "Battle", color: "from-emerald-500 to-emerald-600" },
  { key: "cost_efficiency", label: "Cost", color: "from-cyan-500 to-cyan-600" },
  { key: "reliability", label: "Reliable", color: "from-violet-500 to-violet-600" },
  { key: "reusability", label: "Reuse", color: "from-amber-500 to-amber-600" },
  { key: "enterprise_readiness", label: "Enterprise", color: "from-rose-500 to-rose-600" },
];

export function ComponentMetricsBar({ score, highlight }: Props) {
  return (
    <div className="space-y-3">
      {ROWS.map(({ key, label, color }) => {
        const value = score[key] as number;
        return (
          <div key={key}>
            <div className="mb-1 flex justify-between text-xs">
              <span className={highlight === key ? "text-cyan-300" : "text-zinc-500"}>{label}</span>
              <span className="font-mono text-zinc-300">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${color}`}
                style={{ width: `${Math.min(100, value)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
