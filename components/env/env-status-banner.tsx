import { AlertTriangle, Info } from "lucide-react";

import { cn } from "@/lib/utils";

type Variant = "info" | "warning";

type EnvStatusBannerProps = {
  title: string;
  detail?: string;
  variant?: Variant;
  className?: string;
};

export function EnvStatusBanner({
  title,
  detail,
  variant = "info",
  className,
}: EnvStatusBannerProps) {
  const Icon = variant === "warning" ? AlertTriangle : Info;
  const styles =
    variant === "warning"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-100"
      : "border-cyan-500/30 bg-cyan-500/10 text-cyan-100";

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
        styles,
        className,
      )}
      role="status"
    >
      <Icon className="mt-0.5 size-5 shrink-0 opacity-80" />
      <div>
        <p className="font-medium">{title}</p>
        {detail ? <p className="mt-1 text-xs opacity-90">{detail}</p> : null}
      </div>
    </div>
  );
}
