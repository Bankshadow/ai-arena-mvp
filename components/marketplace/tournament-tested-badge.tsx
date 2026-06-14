import { ShieldCheck } from "lucide-react";

type Props = {
  compact?: boolean;
};

export function TournamentTestedBadge({ compact }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 font-medium text-emerald-300 ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <ShieldCheck className={compact ? "size-3" : "size-3.5"} />
      Tournament-tested
    </span>
  );
}
