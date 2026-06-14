import { getComponentById } from "@/lib/marketplace/mock-catalog";
import type { StackExportFormat, WorkflowStack } from "@/lib/marketplace/types";

function resolveComponents(stack: WorkflowStack) {
  return stack.components
    .map((e) => ({ entry: e, component: getComponentById(e.component_id) }))
    .filter((x): x is { entry: (typeof stack.components)[0]; component: NonNullable<ReturnType<typeof getComponentById>> } => !!x.component);
}

export function exportStackJson(stack: WorkflowStack): string {
  const items = resolveComponents(stack).map(({ entry, component }) => ({
    id: component.id,
    type: component.type,
    title: component.title,
    version: component.version,
    role: entry.role_in_stack,
    arena_score: component.arena_score.total,
    proof: component.proof,
  }));

  return JSON.stringify(
    {
      name: stack.name,
      description: stack.description,
      estimated_cost_usd: stack.estimated_cost_usd,
      estimated_quality_score: stack.estimated_quality_score,
      components: items,
      exported_at: new Date().toISOString(),
      source: "AI ARENA Stack Builder",
    },
    null,
    2,
  );
}

export function exportStackMarkdown(stack: WorkflowStack): string {
  const items = resolveComponents(stack);
  const lines = [
    `# ${stack.name}`,
    "",
    stack.description || "_Tournament-tested workflow stack from AI ARENA._",
    "",
    "## Metrics",
    `- Estimated cost: $${stack.estimated_cost_usd.toFixed(4)}/run`,
    `- Estimated quality: ${stack.estimated_quality_score}/100`,
    `- Components: ${items.length}`,
    "",
    "## Components",
    "",
  ];

  for (const { entry, component } of items) {
    lines.push(
      `### ${entry.order + 1}. ${component.title} (\`${component.type}\`)`,
      `- Version: ${component.version}`,
      `- Role: ${entry.role_in_stack}`,
      `- Arena Score: ${component.arena_score.total}`,
      `- Win rate: ${(component.proof.win_rate * 100).toFixed(0)}%`,
      `- Avg cost: $${component.proof.avg_cost_usd.toFixed(4)}`,
      "",
      component.description,
      "",
    );
  }

  if (stack.compatibility_warnings.length) {
    lines.push("## Warnings", "");
    for (const w of stack.compatibility_warnings) {
      lines.push(`- **${w.severity}**: ${w.message}`);
    }
  }

  return lines.join("\n");
}

export function exportStackCursor(stack: WorkflowStack): string {
  const items = resolveComponents(stack);
  const lines = [
    "# AI ARENA Tournament-Tested Stack",
    "",
    "Add to `.cursor/rules/` or project instructions:",
    "",
    "## Stack overview",
    `- Name: ${stack.name}`,
    `- Est. cost/run: $${stack.estimated_cost_usd.toFixed(4)}`,
    `- Est. quality: ${stack.estimated_quality_score}/100`,
    "",
    "## Components to install",
    "",
  ];

  for (const { entry, component } of items) {
    lines.push(
      `### ${component.title}`,
      `Type: ${component.type} | Role: ${entry.role_in_stack}`,
      "",
      component.payload_preview || component.description,
      "",
      `Install: ${component.install_notes}`,
      "",
    );
  }

  lines.push(
    "## Cursor rule snippet",
    "",
    "```markdown",
    "When running executive summary workflows:",
    ...items.map(({ component }) => `- Use ${component.title} (${component.type}) — Arena Score ${component.arena_score.total}`),
    "```",
  );

  return lines.join("\n");
}

export function exportStackClaudeCode(stack: WorkflowStack): string {
  const items = resolveComponents(stack);
  const lines = [
    "# Claude Code Setup — AI ARENA Stack",
    "",
    "## CLAUDE.md additions",
    "",
    "This stack was tournament-tested in AI ARENA.",
    "",
    "### Workflow components",
    "",
  ];

  for (const { entry, component } of items) {
    lines.push(
      `- **${component.title}** (${component.type}, ${entry.role_in_stack})`,
      `  - Arena Score: ${component.arena_score.total}`,
      `  - ${component.description.slice(0, 120)}…`,
    );
  }

  lines.push(
    "",
    "## Suggested commands",
    "",
    "```bash",
    "# Copy stack config",
    "cat stack.json  # from AI ARENA export",
    "```",
    "",
    "## MCP / hooks",
    "",
    ...items
      .filter(({ component }) => component.type === "mcp_integration" || component.type === "evaluation_hook")
      .map(({ component }) => `- Configure ${component.title} per install notes.`),
  );

  return lines.join("\n");
}

export function exportStack(format: StackExportFormat, stack: WorkflowStack): string {
  switch (format) {
    case "json":
      return exportStackJson(stack);
    case "markdown":
      return exportStackMarkdown(stack);
    case "cursor":
      return exportStackCursor(stack);
    case "claude-code":
      return exportStackClaudeCode(stack);
    case "supabase-snippet":
      return `-- AI ARENA stack: ${stack.name}\n-- Components: ${stack.components.map((c) => c.component_id).join(", ")}\n-- Export full schema in MVP 4`;
    case "api-plan":
      return `# API route plan\nPOST /api/run-agent — wire ${stack.components.filter((c) => c.role_in_stack === "agent").length} agent(s)\nPOST /api/judge-output — wire judge rubric`;
    default:
      return exportStackJson(stack);
  }
}

export function downloadFilename(format: StackExportFormat, stack: WorkflowStack): string {
  const base = stack.slug || "stack";
  const ext =
    format === "json"
      ? "json"
      : format === "markdown"
        ? "md"
        : format === "cursor"
          ? "cursor.txt"
          : format === "claude-code"
            ? "claude-code.md"
            : "txt";
  return `${base}.${ext}`;
}
