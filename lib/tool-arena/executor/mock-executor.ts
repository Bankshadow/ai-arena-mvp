import { newId } from "@/lib/tournament/engine-mock";
import { getToolAgent } from "@/lib/tool-arena/agents";
import { canExecuteAction, effectivePermissionMode } from "@/lib/tool-arena/permissions/policy";
import { getToolAction } from "@/lib/tool-arena/registry/mock-plugins";
import type {
  ToolAgent,
  ToolAgentRun,
  ToolArenaChallenge,
  ToolCallLog,
  ToolExecutionResult,
  ToolPlugin,
} from "@/lib/tool-arena/types";

export type MockExecutorInput = {
  tournament_id: string;
  round: number;
  challenge: ToolArenaChallenge;
  agent: ToolAgent;
  plugins: ToolPlugin[];
  dry_run: boolean;
  sandbox: boolean;
};

export type MockExecutorOutput = {
  run: ToolAgentRun;
  call_logs: ToolCallLog[];
  execution_result: ToolExecutionResult;
  pending_approval_ids: string[];
};

function agentCallPlan(agent: ToolAgent, challenge: ToolArenaChallenge): string[] {
  const actions = challenge.required_actions.map((a) => `${a.plugin_id}.${a.action_name}`);
  if (agent.id === "minimal-tool") return actions.slice(0, Math.min(2, actions.length));
  if (agent.id === "tool-first") return [...actions, ...actions.filter((a) => a.includes("get") || a.includes("list"))].slice(0, 5);
  if (agent.id === "browser-api") {
    const browserFirst = actions.filter((a) => a.startsWith("browser."));
    const rest = actions.filter((a) => !a.startsWith("browser."));
    return [...browserFirst, ...rest];
  }
  return actions;
}

function mockOutput(pluginId: string, actionName: string, input: Record<string, unknown>) {
  return {
    ok: true,
    mock: true,
    plugin: pluginId,
    action: actionName,
    echo: input,
    timestamp: new Date().toISOString(),
  };
}

/** Mock tool execution — no external HTTP. OpenTabs/MCP adapter replaces this later. */
export function runMockToolAgent(input: MockExecutorInput): MockExecutorOutput {
  const agent = input.agent;
  const plan = agentCallPlan(agent, input.challenge);
  const runId = newId();
  const now = new Date().toISOString();
  const call_logs: ToolCallLog[] = [];
  const pending_approval_ids: string[] = [];
  let tool_overhead_ms = 0;
  let hadError = false;
  let permissionViolations = 0;

  for (const step of plan) {
    const [pluginId, actionName] = step.split(".");
    const plugin = input.plugins.find((p) => p.id === pluginId);
    const action = getToolAction(pluginId, actionName);
    if (!plugin || !action) continue;

    const mode = effectivePermissionMode(plugin, input.sandbox);
    const gate = canExecuteAction(plugin, action, mode);
    const useDryRun =
      input.dry_run || agent.id === "safety-first" || (action.kind === "write" && agent.permission_behavior === "strict");

    let status: ToolCallLog["status"] = "success";
    let error_message: string | null = null;

    if (!gate.allowed) {
      status = "denied";
      error_message = gate.reason;
      permissionViolations++;
    } else if (gate.requiresApproval && agent.id !== "safety-first") {
      status = "pending";
    } else if (useDryRun && action.kind === "write") {
      status = "dry_run";
    }

    const latency_ms = 80 + Math.floor(Math.random() * 220);
    tool_overhead_ms += latency_ms;

    const log: ToolCallLog = {
      id: newId(),
      tournament_id: input.tournament_id,
      challenge_id: input.challenge.id,
      agent_run_id: runId,
      agent_id: agent.id,
      tool_plugin_id: pluginId,
      action_name: actionName,
      input_json: { challenge_slug: input.challenge.slug, sandbox: input.sandbox },
      output_json:
        status === "denied"
          ? { error: gate.reason }
          : mockOutput(pluginId, actionName, { title: input.challenge.title }),
      status,
      permission_mode: mode,
      risk_level: action.risk_level,
      dry_run: useDryRun || status === "dry_run",
      latency_ms,
      error_message,
      created_at: now,
    };

    if (status === "pending") {
      pending_approval_ids.push(log.id);
    }
    if (status === "denied") hadError = true;

    call_logs.push(log);
  }

  const checks_total = input.challenge.success_criteria.length;
  const checks_passed = hadError
    ? Math.max(0, checks_total - 1)
    : permissionViolations > 0
      ? checks_total - 1
      : checks_total;

  const run: ToolAgentRun = {
    id: runId,
    tournament_id: input.tournament_id,
    round: input.round,
    challenge_id: input.challenge.id,
    agent_id: agent.id,
    agent_name: agent.name,
    status: pending_approval_ids.length > 0 ? "awaiting_approval" : "complete",
    plan_summary: `${agent.tool_usage_strategy} · ${call_logs.length} calls`,
    tool_call_count: call_logs.length,
    tokens_in: 900 + call_logs.length * 120,
    tokens_out: 400 + call_logs.length * 80,
    llm_cost_usd: 0.002 + call_logs.length * 0.0004,
    tool_overhead_ms,
    started_at: now,
    completed_at: now,
  };

  const execution_result: ToolExecutionResult = {
    id: newId(),
    agent_run_id: runId,
    final_state: { challenge: input.challenge.slug, mock: true, calls: call_logs.length },
    verification_passed: checks_passed === checks_total,
    verification_notes:
      checks_passed === checks_total
        ? "All success criteria verified (mock)."
        : `${checks_passed}/${checks_total} checks passed.`,
    checks_passed,
    checks_total,
    artifacts: [`mock://${input.challenge.slug}/${agent.id}`],
    created_at: now,
  };

  return { run, call_logs, execution_result, pending_approval_ids };
}

export function runMockVerification(
  challenge: ToolArenaChallenge,
  competitorResults: ToolExecutionResult[],
): ToolExecutionResult {
  const passed = competitorResults.filter((r) => r.verification_passed).length;
  const agent = getToolAgent("verification")!;
  return {
    id: newId(),
    agent_run_id: newId(),
    final_state: { verified_runs: passed, total: competitorResults.length },
    verification_passed: passed >= Math.ceil(competitorResults.length / 2),
    verification_notes: `Verification Agent: ${passed}/${competitorResults.length} competitor runs passed checks.`,
    checks_passed: passed,
    checks_total: competitorResults.length,
    artifacts: ["verification-report-mock"],
    created_at: new Date().toISOString(),
  };
}
