import { notFound } from "next/navigation";

import { AgentDetail } from "@/components/agents/agent-detail";
import { AGENT_PERSONAS } from "@/lib/agents/personas";
import { getAgentEntry } from "@/lib/agents/simulate";

export function generateStaticParams() {
  return AGENT_PERSONAS.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = getAgentEntry(id);
  if (!entry) return { title: "Agent | AI ARENA" };
  return {
    title: `${entry.agent.name} · Submission | AI ARENA`,
    description: `${entry.agent.name} (${entry.agent.archetype}) on Executive Summary Battle #1.`,
  };
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = getAgentEntry(id);
  if (!entry) notFound();

  return <AgentDetail entry={entry} />;
}
