import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

type SiteHeaderProps = {
  backHref?: string;
  backLabel?: string;
};

export function SiteHeader({
  backHref = "/",
  backLabel = "Back to home",
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-sm font-medium tracking-widest"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-xs text-primary">
            AI
          </span>
          ARENA
        </Link>
        <Button variant="ghost" size="sm" asChild>
          <Link href={backHref}>
            <ArrowLeft className="size-4" />
            {backLabel}
          </Link>
        </Button>
      </div>
    </header>
  );
}
