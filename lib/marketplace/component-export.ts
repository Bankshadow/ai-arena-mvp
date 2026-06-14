import type { MarketplaceComponent } from "@/lib/marketplace/types";

export function exportComponentJson(component: MarketplaceComponent): string {
  return JSON.stringify(
    {
      id: component.id,
      title: component.title,
      type: component.type,
      version: component.version,
      proof_status: component.proof_status,
      battle_score: component.proof.avg_score,
      proof: component.proof,
      arena_score: component.arena_score,
      payload_preview: component.payload_preview,
      install_notes: component.install_notes,
      exported_at: new Date().toISOString(),
      source: "AI ARENA Marketplace",
    },
    null,
    2,
  );
}

export function exportComponentMarkdown(component: MarketplaceComponent): string {
  const p = component.proof;
  return [
    `# ${component.title}`,
    "",
    component.description,
    "",
    "## Battle proof",
    `- Battle score: ${p.avg_score}/100`,
    `- Win rate: ${(p.win_rate * 100).toFixed(0)}%`,
    `- Avg cost: $${p.avg_cost_usd.toFixed(4)}`,
    `- Avg tokens: ${p.avg_tokens.toLocaleString()}`,
    `- Tested runs: ${p.tournament_runs}`,
    "",
    "## Install",
    component.install_notes,
    "",
    "## Payload preview",
    "```",
    component.payload_preview,
    "```",
  ].join("\n");
}

export function downloadComponentFile(
  component: MarketplaceComponent,
  format: "json" | "markdown",
): void {
  const content =
    format === "json" ? exportComponentJson(component) : exportComponentMarkdown(component);
  const ext = format === "json" ? "json" : "md";
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${component.slug}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}
