import { BattleView } from "@/components/battle/battle-view";

export const metadata = {
  title: "Token Battle | AI ARENA",
  description:
    "AI-generated challenges where 5 agents compete to meet the rubric using the fewest tokens.",
};

export default function BattlePage() {
  return <BattleView />;
}
