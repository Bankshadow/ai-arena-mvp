import { LeaderboardView } from "@/components/leaderboard/leaderboard-view";
import type { LeaderboardRow } from "@/components/LeaderboardTable";
import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";
import { hasDatabaseUrl } from "@/lib/env";
import { entryToRow, mockToRows } from "@/lib/leaderboard/merge-rows";
import {
  formatLeaderboardUpdatedAt,
  getLeaderboardByChallengeSlug,
} from "@/lib/queries/leaderboard";

export default async function LeaderboardPage() {
  let initialRows: LeaderboardRow[] = [];
  let source: "database" | "mock" | "empty" = "mock";
  let updatedLabel: string | undefined;

  if (hasDatabaseUrl()) {
    try {
      const data = await getLeaderboardByChallengeSlug(DEFAULT_CHALLENGE_SLUG);
      if (data && data.entries.length > 0) {
        initialRows = data.entries.map((e) => entryToRow(e));
        source = "database";
        updatedLabel = formatLeaderboardUpdatedAt(data.updatedAt);
      } else if (data) {
        source = "empty";
        initialRows = [];
      }
    } catch {
      source = "mock";
      initialRows = mockToRows();
    }
  } else {
    initialRows = mockToRows();
  }

  return (
    <LeaderboardView
      initialRows={initialRows}
      source={source}
      updatedLabel={updatedLabel}
    />
  );
}
