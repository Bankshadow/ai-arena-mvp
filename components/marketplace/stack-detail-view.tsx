"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getComponentById } from "@/lib/marketplace/mock-catalog";
import { useStackStoreInstance } from "@/components/marketplace/stack-provider";
import { Nav } from "@/components/Nav";
import type { WorkflowStack } from "@/lib/marketplace/types";

type Props = { stack: WorkflowStack };

export function StackDetailView({ stack }: Props) {
  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />
      <main className="relative mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6">
        <Link href="/stack-builder" className="inline-flex items-center gap-2 text-sm text-zinc-500">
          <ArrowLeft className="size-4" /> Stack Builder
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">{stack.name}</h1>
        <p className="mt-2 text-zinc-500">{stack.components.length} components · saved stack</p>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="glass-card rounded-xl p-4">
            <dt className="text-zinc-600">Est. cost</dt>
            <dd className="font-mono text-emerald-400">${stack.estimated_cost_usd.toFixed(4)}</dd>
          </div>
          <div className="glass-card rounded-xl p-4">
            <dt className="text-zinc-600">Est. quality</dt>
            <dd className="font-mono text-cyan-300">{stack.estimated_quality_score}/100</dd>
          </div>
        </dl>
        <ol className="mt-8 space-y-2">
          {stack.components.map((entry, i) => {
            const c = getComponentById(entry.component_id);
            return (
              <li key={entry.component_id} className="glass-card rounded-xl px-4 py-3">
                <span className="font-mono text-xs text-zinc-600">{i + 1}.</span>{" "}
                {c ? (
                  <Link href={`/components/${c.id}`} className="text-violet-300 hover:underline">
                    {c.title}
                  </Link>
                ) : (
                  entry.component_id
                )}
                <span className="ml-2 text-xs text-zinc-600">({entry.role_in_stack})</span>
              </li>
            );
          })}
        </ol>
      </main>
    </div>
  );
}

export function StackDetailLoader({ slug }: { slug: string }) {
  const store = useStackStoreInstance();
  const stack = store.getBySlug(slug);
  if (!stack) notFound();
  return <StackDetailView stack={stack} />;
}
