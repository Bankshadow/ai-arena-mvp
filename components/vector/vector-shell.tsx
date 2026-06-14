"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database } from "lucide-react";

import { Nav } from "@/components/Nav";

const LINKS = [{ href: "/vectors", label: "Dashboard" }];

export function VectorShell({
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
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_50%,rgba(100,116,139,0.08),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-25" />
      <Nav />
      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-emerald-400/90">
          <Database className="size-4 text-slate-400" /> Vector Memory Layer
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-zinc-400">{subtitle}</p>}

        <nav className="mt-6 flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                pathname === l.href
                  ? "bg-emerald-500/20 text-emerald-200"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/memory/search"
            className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-300"
          >
            Memory search
          </Link>
        </nav>

        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
