import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard | AI ARENA",
  description:
    "Live rankings for Executive Summary Battle #1 — quality, cost, and final efficiency scores.",
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
