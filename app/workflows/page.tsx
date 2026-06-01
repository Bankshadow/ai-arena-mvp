import { GitBranch } from "lucide-react";

import { Nav } from "@/components/Nav";
import { WorkflowGrid } from "@/components/workflows/workflow-grid";
import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";
import { MOCK_WORKFLOWS } from "@/lib/data/mock-mvp";
import { hasDatabaseUrl } from "@/lib/env";
import { getTopWorkflowsByChallengeSlug } from "@/lib/queries/workflows";

export const metadata = {
  title: "Workflow Library | AI ARENA",
  description: "Top workflows from Executive Summary Battle #1",
};

export default async function WorkflowsPage() {
  let workflows = MOCK_WORKFLOWS;
  let source: "database" | "mock" = "mock";

  if (hasDatabaseUrl()) {
    try {
      const fromDb = await getTopWorkflowsByChallengeSlug(DEFAULT_CHALLENGE_SLUG, 3);
      if (fromDb && fromDb.length > 0) {
        workflows = fromDb;
        source = "database";
      }
    } catch {
      /* use mock */
    }
  }

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.1),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400/80">
          Workflow library
        </p>
        <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
          <GitBranch className="size-8 text-violet-400" />
          Top workflows
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Winning strategies from Executive Summary Battle #1 — study how leaders balanced
          quality and token spend.
        </p>

        <WorkflowGrid workflows={workflows} source={source} />
      </main>
    </div>
  );
}
