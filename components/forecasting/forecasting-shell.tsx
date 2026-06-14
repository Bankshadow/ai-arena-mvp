"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp } from "lucide-react";

import { Nav } from "@/components/Nav";

export function ForecastingShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.08),transparent)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_0%_80%,rgba(34,211,238,0.06),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-25" />
      <Nav />
      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-violet-400/90">
          <TrendingUp className="size-4 text-cyan-400" /> Forecasting Intelligence
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-zinc-400">{subtitle}</p>}

        <nav className="mt-6 flex flex-wrap gap-2 border-b border-white/10 pb-4">
          <Link
            href="/forecasting"
            className={`rounded-lg px-3 py-1.5 text-sm ${
              pathname === "/forecasting"
                ? "bg-violet-500/20 text-violet-200"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Dashboard
          </Link>
        </nav>

        <div className="mt-8 space-y-8">{children}</div>
      </main>
    </div>
  );
}
