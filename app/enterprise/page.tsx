import { EnterpriseView } from "@/components/enterprise/enterprise-view";
import { AGENT_PERSONAS } from "@/lib/agents/personas";

export const metadata = {
  title: "Private Challenges | AI ARENA for Teams",
  description:
    "Run AI ARENA on your internal documents: define a private challenge, benchmark your internal workflow against AI baselines, and get a private report.",
};

export default function EnterprisePage() {
  return <EnterpriseView personas={AGENT_PERSONAS} />;
}
