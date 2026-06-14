import Link from "next/link";
import { Layers, Workflow } from "lucide-react";

import { Nav } from "@/components/Nav";

export default function WorkspacePage() {
  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(167,139,250,0.12),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400/90">Lab · Workspace</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Workflow Stack Workspace</h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          Compose battle-tested components into a Workflow Stack. Start from marketplace winners or
          tournament Replay, then export to your production pipeline.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/stack-builder"
            className="glass-card group rounded-2xl border border-cyan-500/25 p-6 transition hover:border-cyan-500/50"
          >
            <Layers className="size-8 text-cyan-400" />
            <h2 className="mt-4 text-lg font-semibold">Stack Builder</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Add Battle-tested Components and publish a Workflow Stack.
            </p>
          </Link>
          <Link
            href="/workflows"
            className="glass-card group rounded-2xl border border-violet-500/25 p-6 transition hover:border-violet-500/50"
          >
            <Workflow className="size-8 text-violet-400" />
            <h2 className="mt-4 text-lg font-semibold">Workflows</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Browse saved workflow templates and tournament-proven patterns.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
