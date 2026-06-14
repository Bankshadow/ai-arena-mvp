import type { PermissionLevel, RiskLevel, ToolAction, ToolPlugin } from "@/lib/tool-arena/types";

/** Resolve whether an action may run under current permission mode. */
export function canExecuteAction(
  plugin: ToolPlugin,
  action: ToolAction,
  mode: PermissionLevel,
): { allowed: boolean; requiresApproval: boolean; reason: string } {
  if (mode === "off" || !plugin.enabled) {
    return { allowed: false, requiresApproval: false, reason: "Plugin disabled or permission off" };
  }

  if (mode === "auto_all") {
    return { allowed: true, requiresApproval: false, reason: "Auto all (admin)" };
  }

  if (action.kind === "read") {
    if (mode === "ask") {
      return { allowed: true, requiresApproval: true, reason: "Read with ask mode" };
    }
    return { allowed: true, requiresApproval: false, reason: "Read allowed" };
  }

  // write actions
  if (mode === "ask") {
    return { allowed: true, requiresApproval: true, reason: "Write requires approval" };
  }

  if (mode === "auto_read") {
    return { allowed: false, requiresApproval: false, reason: "Write blocked in auto_read" };
  }

  if (mode === "auto_safe" && action.risk_level === "low" && !action.destructive) {
    return { allowed: true, requiresApproval: false, reason: "Low-risk write auto_safe" };
  }

  if (mode === "auto_safe" && action.risk_level !== "low") {
    return { allowed: true, requiresApproval: true, reason: "Medium/high write needs approval in auto_safe" };
  }

  return { allowed: false, requiresApproval: false, reason: "Write not permitted" };
}

export function effectivePermissionMode(
  plugin: ToolPlugin,
  sandbox: boolean,
): PermissionLevel {
  if (sandbox && plugin.id === "supabase") return "auto_safe";
  return plugin.permission_level;
}

export function permissionStatusLabel(
  plugin: ToolPlugin,
  challengeRequired: boolean,
): { ok: boolean; label: string; tone: "ok" | "warn" | "blocked" } {
  if (!challengeRequired) {
    return { ok: true, label: "Not required", tone: "ok" };
  }
  if (!plugin.enabled || plugin.permission_level === "off") {
    return { ok: false, label: "Blocked", tone: "blocked" };
  }
  if (plugin.permission_level === "ask") {
    return { ok: true, label: "Ask on write", tone: "warn" };
  }
  return { ok: true, label: PERMISSION_SHORT[plugin.permission_level], tone: "ok" };
}

const PERMISSION_SHORT: Record<PermissionLevel, string> = {
  off: "Off",
  ask: "Ask",
  auto_read: "Auto read",
  auto_safe: "Auto safe",
  auto_all: "Auto all",
};

export function riskTone(risk: RiskLevel): "emerald" | "amber" | "rose" {
  if (risk === "low") return "emerald";
  if (risk === "medium") return "amber";
  return "rose";
}
