import { BattlesListView } from "@/components/battles/battles-list-view";

export const metadata = {
  title: "Battle History | AI ARENA",
  description: "Replay saved 5-agent token efficiency battles.",
};

export default function BattlesPage() {
  return <BattlesListView />;
}
