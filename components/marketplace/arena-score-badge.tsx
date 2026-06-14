import type { ArenaScoreBreakdown } from "@/lib/marketplace/types";

type Props = {
  score: ArenaScoreBreakdown;
  showBar?: boolean;
  size?: "sm" | "md";
};

export function ArenaScoreBadge({ score, showBar = true, size = "md" }: Props) {
  const text = size === "sm" ? "text-sm" : "text-lg";
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className={`font-mono font-semibold text-cyan-300 ${text}`}>{score.total}</span>
        <span className="text-xs text-zinc-500">Arena Score</span>
      </div>
      {showBar && (
        <div className="mt-1.5 h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
            style={{ width: `${score.total}%` }}
          />
        </div>
      )}
    </div>
  );
}
