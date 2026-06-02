import { LeaderboardView } from "@/components/leaderboard/leaderboard-view";
import { mapApprovedToLeaderboardRows } from "@/lib/leaderboard/map-rows";
import { mockToRows } from "@/lib/leaderboard/merge-rows";
import { fetchApprovedSubmissions, isSupabaseConfigured } from "@/lib/supabase/submissions";

export default async function LeaderboardPage() {
  if (!isSupabaseConfigured()) {
    return <LeaderboardView rows={mockToRows()} source="mock" />;
  }

  const approved = await fetchApprovedSubmissions();
  if (approved.length === 0) {
    return <LeaderboardView rows={[]} source="empty" />;
  }

  return (
    <LeaderboardView rows={mapApprovedToLeaderboardRows(approved)} source="supabase" />
  );
}
