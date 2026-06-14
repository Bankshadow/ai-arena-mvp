import { LeaderboardView } from "@/components/leaderboard/leaderboard-view";
import {
  buildMockUnifiedLeaderboard,
  buildUnifiedLeaderboard,
} from "@/lib/leaderboard/unified";
import { isSupabaseConfigured } from "@/lib/supabase";

export default async function LeaderboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <LeaderboardView
        rows={buildMockUnifiedLeaderboard()}
        source="mock"
        meta={{ sources: { human: 0, agent: 10, "agent-live": 0, battle: 0, tournament: 0 }, total: 10 }}
      />
    );
  }

  const { rows, meta } = await buildUnifiedLeaderboard();

  return (
    <LeaderboardView
      rows={rows}
      source={rows.length > 0 ? "unified" : "empty"}
      meta={meta}
    />
  );
}
