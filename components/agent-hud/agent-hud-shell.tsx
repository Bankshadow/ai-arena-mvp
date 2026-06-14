"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radar } from "lucide-react";

import { Nav } from "@/components/Nav";

const LINKS = [{ href: "/agent-hud", label: "Fleet HUD" }];

export function AgentHudShell({
  title,
  subtitle,
  children,
  backHref,
  backLabel,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(217,70,239,0.08),transparent)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_0%_80%,rgba(34,211,238,0.06),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-25" />
      <Nav />
      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
        {backHref && (
          <Link href={backHref} className="text-sm text-zinc-400 hover:text-white">
            ← {backLabel ?? "Back"}
          </Link>
        )}
        <p className="mt-2 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-fuchsia-400/90">
          <Radar className="size-4 text-cyan-400" /> Agent Observability HUD
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-zinc-400">{subtitle}</p>}

        <nav className="mt-6 flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                pathname === l.href || pathname.startsWith(`${l.href}/`)
                  ? "bg-fuchsia-500/15 text-fuchsia-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
