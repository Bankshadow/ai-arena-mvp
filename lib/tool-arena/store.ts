import { MOCK_TOOL_CHALLENGES } from "@/lib/tool-arena/registry/mock-challenges";
import { MOCK_TOOL_PLUGINS } from "@/lib/tool-arena/registry/mock-plugins";
import type {
  ToolArenaState,
  ToolArenaStoreData,
  ToolMarketplaceCandidate,
  ToolPermission,
  ToolPlugin,
  ToolWorkflowStack,
} from "@/lib/tool-arena/types";

const STORE_KEY = "ai-arena-tool-arena";

export const MOCK_TOOL_STACKS: ToolWorkflowStack[] = [
  {
    id: "stack-github-triage",
    slug: "github-issue-triage",
    name: "GitHub Issue Triage Stack",
    description: "List issues → create labeled issue → log to Supabase.",
    plugin_ids: ["github", "supabase"],
    action_sequence: ["github.list_issues", "github.create_issue", "supabase.insert_row"],
    task_success_rate: 0.82,
    avg_tool_calls: 4.2,
    avg_latency_ms: 890,
    avg_cost_usd: 0.0042,
    safety_score: 0.91,
    tournament_tested: true,
    source_tournament_id: null,
    source_round: null,
  },
  {
    id: "stack-notion-notes",
    slug: "notion-meeting-notes",
    name: "Notion Meeting Notes Workflow",
    description: "Read notes page and create action items.",
    plugin_ids: ["notion"],
    action_sequence: ["notion.get_page", "notion.create_page"],
    task_success_rate: 0.88,
    avg_tool_calls: 2.1,
    avg_latency_ms: 620,
    avg_cost_usd: 0.0028,
    safety_score: 0.94,
    tournament_tested: true,
    source_tournament_id: null,
    source_round: null,
  },
  {
    id: "stack-discord-update",
    slug: "discord-update",
    name: "Discord Update Workflow",
    description: "Post tournament summaries to Discord after GitHub issue creation.",
    plugin_ids: ["github", "discord"],
    action_sequence: ["github.create_issue", "discord.post_message"],
    task_success_rate: 0.76,
    avg_tool_calls: 3.5,
    avg_latency_ms: 740,
    avg_cost_usd: 0.0035,
    safety_score: 0.86,
    tournament_tested: false,
    source_tournament_id: null,
    source_round: null,
  },
  {
    id: "stack-figma-qa",
    slug: "figma-qa-review",
    name: "Figma QA Review Workflow",
    description: "Design file review with QA comments.",
    plugin_ids: ["figma"],
    action_sequence: ["figma.get_file", "figma.add_comment"],
    task_success_rate: 0.79,
    avg_tool_calls: 2.8,
    avg_latency_ms: 810,
    avg_cost_usd: 0.0031,
    safety_score: 0.9,
    tournament_tested: true,
    source_tournament_id: null,
    source_round: null,
  },
  {
    id: "stack-supabase-logger",
    slug: "supabase-benchmark-logger",
    name: "Supabase Benchmark Logger",
    description: "Capture and persist tournament benchmark rows.",
    plugin_ids: ["supabase"],
    action_sequence: ["supabase.select_rows", "supabase.insert_row"],
    task_success_rate: 0.93,
    avg_tool_calls: 2,
    avg_latency_ms: 450,
    avg_cost_usd: 0.0019,
    safety_score: 0.96,
    tournament_tested: true,
    source_tournament_id: null,
    source_round: null,
  },
  {
    id: "stack-multi-pm",
    slug: "multi-tool-pm",
    name: "Multi-tool Project Management Stack",
    description: "GitHub + Notion + Discord coordination stack.",
    plugin_ids: ["github", "notion", "discord"],
    action_sequence: ["github.list_issues", "notion.create_page", "discord.post_message"],
    task_success_rate: 0.71,
    avg_tool_calls: 5.6,
    avg_latency_ms: 1200,
    avg_cost_usd: 0.0068,
    safety_score: 0.84,
    tournament_tested: false,
    source_tournament_id: null,
    source_round: null,
  },
];

function initialPermissions(plugins: ToolPlugin[]): ToolPermission[] {
  return plugins.map((p) => ({
    id: `perm-${p.id}`,
    plugin_id: p.id,
    mode: p.permission_level,
    tournament_sandbox: true,
    workflow_version: "v1",
    updated_at: new Date().toISOString(),
  }));
}

function emptyState(): ToolArenaState {
  return {
    tournament_id: `tool-arena-${Date.now().toString(36)}`,
    round: 0,
    phase: "idle",
    dry_run: true,
    sandbox: true,
    selected_challenge_id: MOCK_TOOL_CHALLENGES[0]?.id ?? null,
    active_runs: [],
    call_logs: [],
    execution_results: [],
    scores: [],
    leaderboard: [],
    marketplace_candidates: [],
    pending_approvals: [],
    started_at: null,
    completed_at: null,
  };
}

export function seedToolArenaStore(): ToolArenaStoreData {
  const plugins = JSON.parse(JSON.stringify(MOCK_TOOL_PLUGINS)) as ToolPlugin[];
  return {
    plugins,
    permissions: initialPermissions(plugins),
    challenges: MOCK_TOOL_CHALLENGES,
    stacks: MOCK_TOOL_STACKS,
    state: emptyState(),
    audit_log: [],
  };
}

export class ToolArenaStore {
  private data: ToolArenaStoreData;

  constructor() {
    this.data = seedToolArenaStore();
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) this.data = JSON.parse(raw) as ToolArenaStoreData;
      } catch {
        /* ignore */
      }
    }
  }

  private persist(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(this.data));
    } catch {
      /* quota */
    }
  }

  getData(): ToolArenaStoreData {
    return JSON.parse(JSON.stringify(this.data)) as ToolArenaStoreData;
  }

  getPlugin(id: string): ToolPlugin | undefined {
    return this.data.plugins.find((p) => p.id === id);
  }

  updatePlugin(id: string, patch: Partial<ToolPlugin>): ToolPlugin | undefined {
    const idx = this.data.plugins.findIndex((p) => p.id === id);
    if (idx < 0) return undefined;
    this.data.plugins[idx] = { ...this.data.plugins[idx], ...patch };
    const perm = this.data.permissions.find((p) => p.plugin_id === id);
    if (perm && patch.permission_level) {
      perm.mode = patch.permission_level;
      perm.updated_at = new Date().toISOString();
    }
    this.persist();
    return this.data.plugins[idx];
  }

  setState(state: ToolArenaState): void {
    this.data.state = state;
    this.data.audit_log = [...state.call_logs, ...this.data.audit_log].slice(0, 200);
    for (const log of state.call_logs) {
      const plugin = this.data.plugins.find((p) => p.id === log.tool_plugin_id);
      if (plugin) {
        plugin.audit_count += 1;
        plugin.last_used_at = log.created_at;
      }
    }
    this.persist();
  }

  setSelectedChallenge(challengeId: string): void {
    this.data.state.selected_challenge_id = challengeId;
    this.persist();
  }

  addMarketplaceCandidates(candidates: ToolMarketplaceCandidate[]): void {
    this.data.state.marketplace_candidates = [
      ...candidates,
      ...this.data.state.marketplace_candidates,
    ].slice(0, 20);
    this.persist();
  }
}
