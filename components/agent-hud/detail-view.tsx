"use client";

import { ActivityStream } from "@/components/agent-hud/activity-stream";
import { AgentHudShell } from "@/components/agent-hud/agent-hud-shell";
import { CostProfilePanel } from "@/components/agent-hud/cost-profile-panel";
import { HealthGauge } from "@/components/agent-hud/health-gauge";
import { MistakesPanel } from "@/components/agent-hud/mistakes-panel";
import { ModelUsagePanel, ToolUsagePanel } from "@/components/agent-hud/tool-usage-panel";
import { PerformanceTimeline } from "@/components/agent-hud/performance-timeline";
import { RiskBadge } from "@/components/agent-hud/risk-badge";
import { StatusPill } from "@/components/agent-hud/status-pill";
import type { AgentHudDetail } from "@/lib/agent-hud/types";

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-card rounded-2xl border border-white/10 p-5">
      {eyebrow && (
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fuchsia-400/70">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-1 text-lg font-semibold text-zinc-100">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function AgentHudDetailView({ detail }: { detail: AgentHudDetail }) {
  const { profile, health } = detail;

  return (
    <AgentHudShell
      title={profile.name}
      subtitle={`Agent HUD · ${profile.agentType} · ${profile.primaryProvider}/${profile.primaryModel}`}
      backHref="/agent-hud"
      backLabel="Fleet HUD"
    >
      {/* 1. Agent Identity + 3. Runtime Status */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="Agent identity" eyebrow="§01">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Type</dt>
              <dd className="font-mono capitalize text-zinc-200">{profile.agentType}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Constitution</dt>
              <dd className="font-mono text-fuchsia-300">{profile.constitutionVersion}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Win rate</dt>
              <dd className="font-mono text-emerald-300">{Math.round(profile.winRate * 100)}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Avg score</dt>
              <dd className="font-mono text-violet-300">{profile.averageScore.toFixed(1)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Total tokens</dt>
              <dd className="font-mono text-zinc-300">{profile.totalTokens.toLocaleString()}</dd>
            </div>
          </dl>
        </Section>

        <Section title="Runtime status" eyebrow="§03">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={profile.status} />
            <RiskBadge level={profile.riskLevel} />
          </div>
          <p className="mt-3 text-sm text-zinc-300">
            {profile.currentTask ?? "No active task"}
          </p>
          {profile.riskAlerts.length > 0 && (
            <ul className="mt-3 space-y-1">
              {profile.riskAlerts.map((a) => (
                <li key={a} className="text-xs text-rose-300/90">
                  ⚠ {a}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 font-mono text-xs text-zinc-500">
            Memory freshness {Math.round(profile.memoryFreshness * 100)}%
          </p>
        </Section>

        <Section title="Health score" eyebrow="§00">
          <HealthGauge score={health.score} components={health.components} />
          <p className="mt-2 text-xs text-zinc-400">{health.summary}</p>
          <p className="mt-1 font-mono text-[10px] uppercase text-zinc-500">
            Trend: {health.trend}
          </p>
        </Section>
      </div>

      {/* 2. Constitution */}
      <div className="mt-6">
        <Section title="Constitution summary" eyebrow="§02">
          <p className="text-sm text-zinc-300">{detail.constitution.primaryGoal}</p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-zinc-400">
            {detail.constitution.keyRules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p className="mt-3 font-mono text-xs text-zinc-500">
            Score {detail.constitution.score}/100 · Updated{" "}
            {new Date(detail.constitution.lastUpdatedAt).toLocaleDateString()}
          </p>
        </Section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* 4. Memory */}
        <Section title="Memory lessons" eyebrow="§04">
          <ul className="space-y-2">
            {detail.memoryLessons.map((l) => (
              <li key={l.id} className="rounded-lg border border-white/5 bg-black/20 p-3">
                <div className="flex justify-between text-xs">
                  <span className="font-mono uppercase text-cyan-400/80">{l.type}</span>
                  <span className="text-zinc-500">{Math.round(l.confidence * 100)}%</span>
                </div>
                <p className="mt-1 text-sm font-medium text-zinc-200">{l.title}</p>
                <p className="mt-0.5 text-xs text-zinc-400">{l.summary}</p>
              </li>
            ))}
          </ul>
        </Section>

        {/* 5. Performance */}
        <Section title="Performance timeline" eyebrow="§05">
          <PerformanceTimeline points={detail.performanceTimeline} />
        </Section>
      </div>

      {/* 6. Tournament */}
      <div className="mt-6">
        <Section title="Tournament history" eyebrow="§06">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-zinc-500">
                  <th className="pb-2 pr-4">Tournament</th>
                  <th className="pb-2 pr-4">Round</th>
                  <th className="pb-2 pr-4">Rank</th>
                  <th className="pb-2 pr-4">Score</th>
                  <th className="pb-2">Cost</th>
                </tr>
              </thead>
              <tbody>
                {detail.tournamentHistory.map((t) => (
                  <tr key={t.id} className="border-b border-white/5">
                    <td className="py-2 pr-4 text-zinc-300">{t.tournamentName}</td>
                    <td className="py-2 pr-4 font-mono text-zinc-400">{t.round}</td>
                    <td className="py-2 pr-4 font-mono text-cyan-300">#{t.rank}</td>
                    <td className="py-2 pr-4 font-mono text-violet-300">{t.score.toFixed(1)}</td>
                    <td className="py-2 font-mono text-zinc-400">${t.costUsd.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      {/* 7. Mistakes */}
      <div className="mt-6">
        <Section title="Mistakes and corrections" eyebrow="§07">
          <MistakesPanel mistakes={detail.mistakes} corrections={detail.corrections} />
        </Section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* 8. Cost */}
        <Section title="Cost and token profile" eyebrow="§08">
          <CostProfilePanel profile={detail.costProfile} />
        </Section>

        {/* 9. Model */}
        <Section title="Model provider usage" eyebrow="§09">
          <ModelUsagePanel usage={detail.modelUsage} />
        </Section>
      </div>

      {/* 10. Tools */}
      <div className="mt-6">
        <Section title="Tool usage / action trace" eyebrow="§10">
          <ToolUsagePanel usage={detail.toolUsage} />
        </Section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* 11. Skills */}
        <Section title="Skills / capabilities" eyebrow="§11">
          <div className="space-y-3">
            {detail.skills.skills.map((s) => (
              <div key={s.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-zinc-300">{s.name}</span>
                  <span className="font-mono text-zinc-500">{s.level}/100</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400"
                    style={{ width: `${s.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-zinc-500">Capabilities</p>
          <ul className="mt-1 flex flex-wrap gap-1">
            {detail.skills.capabilities.map((c) => (
              <li
                key={c}
                className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-200"
              >
                {c}
              </li>
            ))}
          </ul>
        </Section>

        {/* 12. Marketplace */}
        <Section title="Marketplace assets" eyebrow="§12">
          <ul className="space-y-2">
            {detail.marketplaceAssets.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/5 bg-black/20 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-200">{a.name}</p>
                  <p className="font-mono text-[10px] uppercase text-zinc-500">
                    {a.type} · {a.status}
                  </p>
                </div>
                <div className="text-right font-mono text-xs">
                  <p className="text-amber-300">★ {a.rating.toFixed(1)}</p>
                  <p className="text-zinc-500">{a.downloads} dl</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* 13. Activity */}
        <Section title="Activity stream" eyebrow="§13">
          <ActivityStream events={detail.activity} />
        </Section>

        {/* 14. Improvements */}
        <Section title="Recommended improvements" eyebrow="§14">
          <ul className="space-y-2">
            {detail.improvements.map((imp) => (
              <li
                key={imp.id}
                className="rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/5 p-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase ${
                      imp.priority === "high"
                        ? "bg-rose-500/20 text-rose-300"
                        : imp.priority === "medium"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-zinc-500/20 text-zinc-400"
                    }`}
                  >
                    {imp.priority}
                  </span>
                  <p className="text-sm font-medium text-zinc-200">{imp.title}</p>
                </div>
                <p className="mt-1 text-xs text-zinc-400">{imp.rationale}</p>
                <p className="mt-1 font-mono text-[10px] text-emerald-400/80">
                  {imp.estimatedImpact}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </AgentHudShell>
  );
}
