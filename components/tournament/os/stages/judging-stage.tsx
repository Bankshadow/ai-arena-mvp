"use client";

import { useState } from "react";

import { AgentScoreFormulaHelp } from "@/components/tournament/agent-score-formula-help";
import { JudgeScorecardGrid } from "@/components/tournament/os/judge-scorecard-grid";
import { TournamentStageShell } from "@/components/tournament/os/tournament-stage-shell";
import { JudgeEvaluationPanel } from "@/components/workflow/judge-evaluation-panel";
import { ScoreHelp } from "@/components/scoring/score-help";
import { useTranslations } from "@/components/i18n/locale-provider";
import type { AgentRun, Evaluation } from "@/lib/tournament/types";

type Props = {
  evaluations: Evaluation[];
  runs: AgentRun[];
};

export function JudgingStage({ evaluations, runs }: Props) {
  const os = useTranslations().tournament.os;
  const [showFormula, setShowFormula] = useState(false);

  return (
    <TournamentStageShell
      phase="judging"
      action={
        <button
          type="button"
          onClick={() => setShowFormula((s) => !s)}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          {showFormula ? os.judging.hideFormula : os.judging.showFormula}
        </button>
      }
    >
      <JudgeEvaluationPanel evaluations={evaluations} embedded />

      <JudgeScorecardGrid evaluations={evaluations} runs={runs} />

      {showFormula && (
        <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
          <ScoreHelp system="agent_simulation" />
          <AgentScoreFormulaHelp />
        </div>
      )}
    </TournamentStageShell>
  );
}
