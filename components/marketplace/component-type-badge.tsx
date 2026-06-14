import type { ComponentType } from "@/lib/marketplace/types";
import { COMPONENT_TYPE_COLORS, COMPONENT_TYPE_LABELS } from "@/lib/marketplace/types";

const COLOR_CLASS: Record<string, string> = {
  violet: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  cyan: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  rose: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  zinc: "border-white/20 bg-white/5 text-zinc-400",
};

type Props = { type: ComponentType; small?: boolean };

export function ComponentTypeBadge({ type, small }: Props) {
  const color = COMPONENT_TYPE_COLORS[type];
  return (
    <span
      className={`inline-block rounded-full border font-medium ${COLOR_CLASS[color] ?? COLOR_CLASS.zinc} ${
        small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      {COMPONENT_TYPE_LABELS[type]}
    </span>
  );
}
