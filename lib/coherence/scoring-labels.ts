/** Product-wide scoring definitions for tooltips and labels. */

export type ScoringSystemId =
  | "challenge"
  | "agent_simulation"
  | "marketplace";

export type ScoringSystem = {
  id: ScoringSystemId;
  label: string;
  formula: string;
  help: string;
};

export const SCORING_SYSTEMS: Record<ScoringSystemId, ScoringSystem> = {
  challenge: {
    id: "challenge",
    label: "Challenge scoring",
    formula: "80% quality + 20% cost",
    help: "Human submissions on fixed challenges. Quality rubric (0–100) weighted 80%; cost efficiency weighted 20%.",
  },
  agent_simulation: {
    id: "agent_simulation",
    label: "Agent simulation scoring",
    formula: "Quality + cost + token + speed + robustness",
    help: "Tournament agent runs combine adjusted quality with normalized cost, token, speed, and robustness subscores.",
  },
  marketplace: {
    id: "marketplace",
    label: "Marketplace score",
    formula: "Battle score + reliability + reusability",
    help: "Components promoted from tournament winners. Arena Score blends battle performance, workflow reliability, and stack reusability.",
  },
};

export function getScoringSystem(id: ScoringSystemId): ScoringSystem {
  return SCORING_SYSTEMS[id];
}
