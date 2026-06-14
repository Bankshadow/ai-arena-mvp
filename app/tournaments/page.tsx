import { TournamentsListView } from "@/components/tournaments/tournaments-list-view";

export const metadata = {
  title: "Tournament History | AI ARENA",
  description: "Replay saved autonomous tournament rounds.",
};

export default function TournamentsPage() {
  return <TournamentsListView />;
}
