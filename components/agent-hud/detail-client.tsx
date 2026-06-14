"use client";

import { notFound } from "next/navigation";

import { AgentHudDetailView } from "@/components/agent-hud/detail-view";
import { useAgentHud } from "@/components/agent-hud/agent-hud-provider";

export function AgentHudDetailClient({ agentId }: { agentId: string }) {
  const { getDetail } = useAgentHud();
  const detail = getDetail(agentId);
  if (!detail) notFound();
  return <AgentHudDetailView detail={detail} />;
}
