export const TOURNAMENT_PHASES = [
  "overview",
  "challenge",
  "agents",
  "judging",
  "leaderboard",
  "marketplace-proof",
] as const;

export type TournamentPhase = (typeof TOURNAMENT_PHASES)[number];

export const PHASE_ACCENTS: Record<
  TournamentPhase,
  { border: string; text: string; bg: string }
> = {
  overview: {
    border: "border-violet-500/30",
    text: "text-violet-300",
    bg: "from-violet-500/10",
  },
  challenge: {
    border: "border-amber-500/30",
    text: "text-amber-300",
    bg: "from-amber-500/10",
  },
  agents: {
    border: "border-cyan-500/30",
    text: "text-cyan-300",
    bg: "from-cyan-500/10",
  },
  judging: {
    border: "border-indigo-500/30",
    text: "text-indigo-300",
    bg: "from-indigo-500/10",
  },
  leaderboard: {
    border: "border-emerald-500/30",
    text: "text-emerald-300",
    bg: "from-emerald-500/10",
  },
  "marketplace-proof": {
    border: "border-emerald-500/25",
    text: "text-emerald-200",
    bg: "from-emerald-500/10",
  },
};

export function phaseAnchorId(phase: TournamentPhase): string {
  return `tournament-phase-${phase}`;
}
