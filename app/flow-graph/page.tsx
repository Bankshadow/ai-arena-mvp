import { EngineMap } from "@/components/workflow/engine-map";
import { MarketplacePipeline } from "@/components/workflow/marketplace-pipeline";
import { ProofStatsBanner } from "@/components/workflow/proof-stats-cards";
import { WorkflowLoopBanner } from "@/components/workflow/workflow-loop-banner";
import { Nav } from "@/components/Nav";

export default function FlowGraphPage() {
  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(167,139,250,0.15),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-6xl space-y-6 px-4 pb-24 pt-10 sm:px-6">
        <header>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400/90">Lab · Flow Graph</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Engine Map</h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            How data flows from Tournament Round through Agent Battle, Judge Evaluation, Memory Lesson,
            Marketplace Candidate, and into your Workflow Stack.
          </p>
        </header>

        <WorkflowLoopBanner />
        <EngineMap />
        <MarketplacePipeline activeStage={4} />
        <ProofStatsBanner />
      </main>
    </div>
  );
}
