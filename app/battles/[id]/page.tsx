import { BattleDetailView } from "@/components/battles/battle-detail-view";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Battle ${id.slice(0, 8)}… | AI ARENA`,
    description: "Replay a saved 5-agent token efficiency battle.",
  };
}

export default async function BattleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BattleDetailView battleId={id} />;
}
