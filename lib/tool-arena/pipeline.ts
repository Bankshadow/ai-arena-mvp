import { newId } from "@/lib/tournament/engine-mock";
import { TOOL_COMPETITOR_IDS, getToolAgent } from "@/lib/tool-arena/agents";
import { runMockToolAgent, runMockVerification } from "@/lib/tool-arena/executor/mock-executor";
import { getToolChallenge } from "@/lib/tool-arena/registry/mock-challenges";
import { computeToolArenaScore, rankToolScores } from "@/lib/tool-arena/scoring";
import type {
  ToolAgentRun,
  ToolArenaState,
  ToolArenaStoreData,
  ToolCallLog,
  ToolExecutionResult,
  ToolMarketplaceCandidate,
} from "@/lib/tool-arena/types";
import type { ScoreInput } from "@/lib/tool-arena/scoring";

export type ToolArenaRunResult = {
  state: ToolArenaState;
  verification_summary: string;
  marketplace_candidates: ToolMarketplaceCandidate[];
};

/** Run one mock Tool Arena round — no external calls. */
export function runToolArenaRound(data: ToolArenaStoreData): ToolArenaRunResult {
  const challengeId = data.state.selected_challenge_id ?? data.challenges[0]?.id;
  const challenge = getToolChallenge(challengeId ?? "") ?? data.challenges[0];
  if (!challenge) {
    return {
      state: data.state,
      verification_summary: "No challenge available.",
      marketplace_candidates: [],
    };
  }

  const round = data.state.round + 1;
  const tournament_id = data.state.tournament_id;
  const now = new Date().toISOString();

  const active_runs: ToolAgentRun[] = [];
  const call_logs: ToolCallLog[] = [];
  const execution_results: ToolExecutionResult[] = [];
  const scoreInputs: ScoreInput[] = [];
  const pending_approvals: string[] = [];

  for (const agentId of TOOL_COMPETITOR_IDS) {
    const agent = getToolAgent(agentId)!;
    const result = runMockToolAgent({
      tournament_id,
      round,
      challenge,
      agent,
      plugins: data.plugins,
      dry_run: data.state.dry_run,
      sandbox: data.state.sandbox,
    });
    active_runs.push(result.run);
    call_logs.push(...result.call_logs);
    execution_results.push(result.execution_result);
    pending_approvals.push(...result.pending_approval_ids);
    scoreInputs.push({
      id: newId(),
      tournament_id,
      round,
      challenge_id: challenge.id,
      agent_id: agent.id,
      agent_name: agent.name,
      agent_run_id: result.run.id,
      run: result.run,
      call_logs: result.call_logs,
      execution: result.execution_result,
    });
  }

  const competitorExecutions = execution_results.filter((e) => e);
  const verification = runMockVerification(challenge, competitorExecutions);
  execution_results.push(verification);

  const scores = rankToolScores(scoreInputs.map((s) => computeToolArenaScore(s)));

  const marketplace_candidates: ToolMarketplaceCandidate[] = scores.slice(0, 2).map((s, i) => {
    const stack = data.stacks[i] ?? data.stacks[0];
    const agentLogs = call_logs.filter((l) => l.agent_id === s.agent_id).slice(0, 2);
    return {
      id: newId(),
      stack_id: stack.id,
      slug: stack.slug,
      title: stack.name,
      tournament_id,
      round,
      agent_id: s.agent_id,
      agent_name: s.agent_name,
      task_success_rate: s.task_success / 35,
      avg_tool_calls: active_runs.find((r) => r.agent_id === s.agent_id)?.tool_call_count ?? 0,
      avg_latency_ms:
        active_runs.find((r) => r.agent_id === s.agent_id)?.tool_overhead_ms ?? 0,
      avg_cost_usd: active_runs.find((r) => r.agent_id === s.agent_id)?.llm_cost_usd ?? 0,
      safety_score: s.safety_audit / 10,
      compatible_tools: stack.plugin_ids,
      required_permissions: ["ask", "auto_safe"],
      audit_examples: agentLogs.map((l) => ({
        action: `${l.tool_plugin_id}.${l.action_name}`,
        status: l.status,
        dry_run: l.dry_run,
      })),
      status: "seed" as const,
      created_at: now,
    };
  });

  const state: ToolArenaState = {
    ...data.state,
    round,
    phase: "complete",
    selected_challenge_id: challenge.id,
    active_runs,
    call_logs,
    execution_results,
    scores,
    leaderboard: scores,
    marketplace_candidates: [...marketplace_candidates, ...data.state.marketplace_candidates].slice(
      0,
      10,
    ),
    pending_approvals,
    started_at: data.state.started_at ?? now,
    completed_at: now,
  };

  return {
    state,
    verification_summary: verification.verification_notes,
    marketplace_candidates,
  };
}
