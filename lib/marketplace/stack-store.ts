import type { MarketplaceComponent, StackComponentEntry, WorkflowStack } from "@/lib/marketplace/types";

const DRAFT_KEY = "ai-arena-stack-draft";
const STACKS_KEY = "ai-arena-stacks";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `stack-${Date.now()}`;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function createEmptyStack(name = "My workflow stack"): WorkflowStack {
  const now = new Date().toISOString();
  const id = newId();
  return {
    id,
    slug: slugify(name) || id.slice(0, 8),
    name,
    description: "",
    components: [],
    estimated_cost_usd: 0,
    estimated_quality_score: 0,
    compatibility_warnings: [],
    visibility: "private",
    created_at: now,
    updated_at: now,
  };
}

export class StackStore {
  private draft: WorkflowStack;
  private saved: WorkflowStack[];

  constructor() {
    this.draft = createEmptyStack();
    this.saved = [];
    if (typeof window !== "undefined") {
      try {
        const d = localStorage.getItem(DRAFT_KEY);
        if (d) this.draft = JSON.parse(d) as WorkflowStack;
        const s = localStorage.getItem(STACKS_KEY);
        if (s) this.saved = JSON.parse(s) as WorkflowStack[];
      } catch {
        /* ignore */
      }
    }
  }

  getDraft(): WorkflowStack {
    return JSON.parse(JSON.stringify(this.draft)) as WorkflowStack;
  }

  saveDraft(stack: WorkflowStack): void {
    this.draft = { ...stack, updated_at: new Date().toISOString() };
    this.persistDraft();
  }

  private persistDraft(): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(this.draft));
  }

  addComponent(component: MarketplaceComponent, role: StackComponentEntry["role_in_stack"]): WorkflowStack {
    const entry: StackComponentEntry = {
      component_id: component.id,
      component_version: component.version,
      role_in_stack: role,
      order: this.draft.components.length,
    };
    if (this.draft.components.some((c) => c.component_id === component.id)) {
      return this.getDraft();
    }
    this.draft.components.push(entry);
    this.draft.updated_at = new Date().toISOString();
    this.persistDraft();
    return this.getDraft();
  }

  removeComponent(componentId: string): WorkflowStack {
    this.draft.components = this.draft.components
      .filter((c) => c.component_id !== componentId)
      .map((c, i) => ({ ...c, order: i }));
    this.draft.updated_at = new Date().toISOString();
    this.persistDraft();
    return this.getDraft();
  }

  reorder(componentIds: string[]): WorkflowStack {
    const map = new Map(this.draft.components.map((c) => [c.component_id, c]));
    this.draft.components = componentIds
      .map((id, order) => {
        const c = map.get(id);
        return c ? { ...c, order } : null;
      })
      .filter((c): c is StackComponentEntry => c !== null);
    this.persistDraft();
    return this.getDraft();
  }

  saveStack(name?: string): WorkflowStack {
    const toSave = {
      ...this.draft,
      name: name ?? this.draft.name,
      slug: slugify(name ?? this.draft.name) || this.draft.slug,
      updated_at: new Date().toISOString(),
    };
    const idx = this.saved.findIndex((s) => s.id === toSave.id);
    if (idx >= 0) this.saved[idx] = toSave;
    else this.saved.push(toSave);
    if (typeof window !== "undefined") {
      localStorage.setItem(STACKS_KEY, JSON.stringify(this.saved));
    }
    return toSave;
  }

  listSaved(): WorkflowStack[] {
    return JSON.parse(JSON.stringify(this.saved)) as WorkflowStack[];
  }

  getBySlug(slug: string): WorkflowStack | undefined {
    return this.saved.find((s) => s.slug === slug || s.id === slug);
  }

  clearDraft(): WorkflowStack {
    this.draft = createEmptyStack();
    this.persistDraft();
    return this.getDraft();
  }
}

export function defaultRoleForType(
  type: MarketplaceComponent["type"],
): StackComponentEntry["role_in_stack"] {
  switch (type) {
    case "agent_constitution":
      return "agent";
    case "judge_rubric":
      return "judge";
    case "challenge_template":
      return "challenge";
    case "model_router":
      return "router";
    case "evaluation_hook":
    case "storage_hook":
      return "hook";
    case "setup_pack":
      return "setup";
    case "cost_policy":
      return "policy";
    case "benchmark_report":
      return "report";
    default:
      return "agent";
  }
}
