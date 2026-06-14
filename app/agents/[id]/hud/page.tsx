import { notFound } from "next/navigation";

import { AgentHudDetailClient } from "@/components/agent-hud/detail-client";
import { AGENT_HUD_IDS, getAgentHudEntry } from "@/lib/agent-hud/registry/agent-registry";

export function generateStaticParams() {
  return AGENT_HUD_IDS.map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = getAgentHudEntry(id);
  if (!entry) return { title: "Agent HUD | AI ARENA" };
  return {
    title: `${entry.name} · HUD | AI ARENA`,
    description: `Observability dashboard for ${entry.name}.`,
  };
}

export default async function AgentHudDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!getAgentHudEntry(id)) notFound();
  return <AgentHudDetailClient agentId={id} />;
}
