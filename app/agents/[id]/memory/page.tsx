import { AgentMemoryView } from "@/components/memory/agent-memory-view";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `${id} memory | AI ARENA` };
}

export default async function AgentMemoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AgentMemoryView agentId={id} />;
}
