import type { ToolArenaChallenge } from "@/lib/tool-arena/types";

export const MOCK_TOOL_CHALLENGES: ToolArenaChallenge[] = [
  {
    id: "chal-github-discord",
    slug: "github-discord-handoff",
    title: "GitHub issue + Discord summary",
    brief:
      "Create a GitHub issue from the PRD excerpt and post a one-paragraph summary to Discord #eng-updates.",
    required_plugins: ["github", "discord"],
    required_actions: [
      { plugin_id: "github", action_name: "create_issue" },
      { plugin_id: "discord", action_name: "post_message" },
    ],
    success_criteria: [
      "Issue created with correct title prefix",
      "Discord message references issue number",
      "No destructive repo actions",
    ],
    difficulty: "medium",
    sandbox_only: true,
  },
  {
    id: "chal-notion-actions",
    slug: "notion-action-items",
    title: "Notion page → action items",
    brief: "Read a Notion meeting notes page and create a structured action items sub-page.",
    required_plugins: ["notion"],
    required_actions: [
      { plugin_id: "notion", action_name: "get_page" },
      { plugin_id: "notion", action_name: "create_page" },
    ],
    success_criteria: ["Page read successfully", "Action items match bullet count", "Links preserved"],
    difficulty: "easy",
    sandbox_only: true,
  },
  {
    id: "chal-figma-qa",
    slug: "figma-qa-review",
    title: "Figma QA review",
    brief: "Review the mobile checkout Figma file and add QA comments on spacing issues.",
    required_plugins: ["figma"],
    required_actions: [
      { plugin_id: "figma", action_name: "get_file" },
      { plugin_id: "figma", action_name: "add_comment" },
    ],
    success_criteria: ["File loaded", "At least 2 QA comments", "Comments reference frame IDs"],
    difficulty: "medium",
    sandbox_only: true,
  },
  {
    id: "chal-github-sprint",
    slug: "github-sprint-plan",
    title: "GitHub issues → sprint plan",
    brief: "Summarize open GitHub issues and draft a sprint plan outline in Notion.",
    required_plugins: ["github", "notion"],
    required_actions: [
      { plugin_id: "github", action_name: "list_issues" },
      { plugin_id: "notion", action_name: "create_page" },
    ],
    success_criteria: ["Issues grouped by label", "Sprint plan has 3 milestones"],
    difficulty: "hard",
    sandbox_only: true,
  },
  {
    id: "chal-slack-status",
    slug: "slack-status-update",
    title: "Status page + Slack notify",
    brief: "Update project status via browser internal API and notify Slack channel.",
    required_plugins: ["browser", "discord"],
    required_actions: [
      { plugin_id: "browser", action_name: "post_api" },
      { plugin_id: "discord", action_name: "post_message" },
    ],
    success_criteria: ["Status API returns 200 (mock)", "Slack message sent"],
    difficulty: "hard",
    sandbox_only: true,
  },
  {
    id: "chal-supabase-log",
    slug: "supabase-benchmark-log",
    title: "Capture benchmark → Supabase",
    brief: "Run verification checks and insert tournament benchmark row into Supabase.",
    required_plugins: ["supabase"],
    required_actions: [
      { plugin_id: "supabase", action_name: "select_rows" },
      { plugin_id: "supabase", action_name: "insert_row" },
    ],
    success_criteria: ["Row inserted with tournament_id", "Audit log complete"],
    difficulty: "easy",
    sandbox_only: true,
  },
];

export function getToolChallenge(idOrSlug: string): ToolArenaChallenge | undefined {
  return MOCK_TOOL_CHALLENGES.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
}
