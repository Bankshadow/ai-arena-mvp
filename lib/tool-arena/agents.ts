import type { ToolAgent } from "@/lib/tool-arena/types";

export const TOOL_ARENA_AGENTS: ToolAgent[] = [
  {
    id: "tool-first",
    name: "Tool-First Agent",
    role: "competitor",
    specialty: "Max tool throughput",
    description: "Plans fast, executes many tool calls, verifies at the end.",
    accent: "cyan",
    tool_usage_strategy: "Plan → parallel reads → sequential writes → verify",
    permission_behavior: "aggressive",
    verification_behavior: "on_write",
    retry_policy: { max_retries: 2, backoff_ms: 400 },
    risk_tolerance: "medium",
    fallback_behavior: "mock_only",
  },
  {
    id: "browser-api",
    name: "Browser API Agent",
    role: "competitor",
    specialty: "OpenTabs-style APIs",
    description: "Prefers browser_session plugins for web app internal APIs.",
    accent: "violet",
    tool_usage_strategy: "Discover session → fetch_api → post_api when allowed",
    permission_behavior: "balanced",
    verification_behavior: "always",
    retry_policy: { max_retries: 1, backoff_ms: 600 },
    risk_tolerance: "medium",
    fallback_behavior: "skip_tool",
  },
  {
    id: "safety-first",
    name: "Safety-First Agent",
    role: "competitor",
    specialty: "Audit & dry-run",
    description: "Dry-runs writes, respects ask gates, minimal risk surface.",
    accent: "emerald",
    tool_usage_strategy: "Dry-run all writes → request approval → execute once",
    permission_behavior: "strict",
    verification_behavior: "always",
    retry_policy: { max_retries: 1, backoff_ms: 800 },
    risk_tolerance: "low",
    fallback_behavior: "skip_tool",
  },
  {
    id: "minimal-tool",
    name: "Minimal Tool Agent",
    role: "competitor",
    specialty: "Fewest calls",
    description: "Heavy LLM planning, minimal tool usage, optimizes efficiency score.",
    accent: "amber",
    tool_usage_strategy: "Single read batch → one write → done",
    permission_behavior: "strict",
    verification_behavior: "on_write",
    retry_policy: { max_retries: 0, backoff_ms: 0 },
    risk_tolerance: "low",
    fallback_behavior: "mock_only",
  },
  {
    id: "verification",
    name: "Verification Agent",
    role: "verification",
    specialty: "State checks",
    description: "Validates final workflow state and audit completeness.",
    accent: "rose",
    tool_usage_strategy: "Read-only verification passes on competitor outputs",
    permission_behavior: "strict",
    verification_behavior: "always",
    retry_policy: { max_retries: 0, backoff_ms: 0 },
    risk_tolerance: "low",
    fallback_behavior: "fail_run",
  },
];

export const TOOL_COMPETITOR_IDS = TOOL_ARENA_AGENTS.filter((a) => a.role === "competitor").map(
  (a) => a.id,
);

export function getToolAgent(id: string): ToolAgent | undefined {
  return TOOL_ARENA_AGENTS.find((a) => a.id === id);
}
