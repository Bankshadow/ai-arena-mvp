import { AgentsView } from "@/components/agents/agents-view";
import { AGENT_PERSONAS } from "@/lib/agents/personas";
import { getAgentLeaderboard } from "@/lib/agents/simulate";

export const metadata = {
  title: "AI Agents | AI ARENA",
  description:
    "Ten AI workflow strategies compete on Executive Summary Battle #1 — scored on quality, cost, tokens, and speed.",
};

export default function AgentsPage() {
  const personas = AGENT_PERSONAS;
  const leaderboard = getAgentLeaderboard();

  return <AgentsView personas={personas} leaderboard={leaderboard} />;
}
