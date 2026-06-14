import { TournamentDetailView } from "@/components/tournaments/tournament-detail-view";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Round ${id.slice(0, 8)}… | AI ARENA`,
    description: "Replay a saved tournament round.",
  };
}

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TournamentDetailView roundId={id} />;
}
