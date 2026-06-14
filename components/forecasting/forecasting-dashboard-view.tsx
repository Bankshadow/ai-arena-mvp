"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Brain,
  Cloud,
  DollarSign,
  Minus,
  ShieldAlert,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

import { ForecastChart } from "@/components/forecasting/forecast-chart";
import { ForecastingShell } from "@/components/forecasting/forecasting-shell";
import { buildForecastingDashboard, MOCK_DAILY_COST_HISTORY } from "@/lib/forecasting";
import type { AnomalyEvent, AnomalySeverity } from "@/lib/forecasting/types";

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function severityStyles(severity: AnomalySeverity): string {
  switch (severity) {
    case "critical":
      return "border-red-500/40 bg-red-500/10 text-red-200";
    case "warning":
      return "border-amber-500/40 bg-amber-500/10 text-amber-200";
    default:
      return "border-cyan-500/30 bg-cyan-500/5 text-cyan-100";
  }
}

function TrendIcon({ trend }: { trend: "rising" | "stable" | "declining" }) {
  if (trend === "rising") return <ArrowUp className="size-4 text-emerald-400" />;
  if (trend === "declining") return <ArrowDown className="size-4 text-red-400" />;
  return <Minus className="size-4 text-zinc-500" />;
}

function AnomalyCard({ event }: { event: AnomalyEvent }) {
  return (
    <article
      className={`rounded-xl border p-4 ${severityStyles(event.severity)}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">{event.title}</p>
        <span className="shrink-0 rounded bg-black/30 px-2 py-0.5 font-mono text-[10px] uppercase">
          {event.code.replace(/_/g, " ")}
        </span>
      </div>
      <p className="mt-2 text-sm opacity-90">{event.message}</p>
      <p className="mt-2 font-mono text-xs opacity-70">
        {event.delta_pct > 0 ? "+" : ""}
        {event.delta_pct.toFixed(0)}% vs baseline
      </p>
    </article>
  );
}

export function ForecastingDashboardView() {
  const data = buildForecastingDashboard();
  const { summary } = data;

  return (
    <ForecastingShell
      title="Forecasting control room"
      subtitle="Predict tournament token usage, cost, agent performance, and provider risk — mock intelligence layer ready for Supabase + Python worker."
    >
      {/* 1. Summary cards */}
      <section>
        <p className="mb-4 font-mono text-xs uppercase tracking-wider text-zinc-500">
          Forecast summary · next 24h
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="glass-card rounded-2xl border border-cyan-500/20 p-4">
            <p className="flex items-center gap-2 text-xs text-zinc-500">
              <Zap className="size-3.5 text-cyan-400" /> Token usage
            </p>
            <p className="mt-2 text-2xl font-semibold text-cyan-100">
              {formatTokens(summary.next_24h_tokens)}
            </p>
            <p className="mt-1 text-xs text-zinc-600">predicted tokens</p>
          </div>
          <div className="glass-card rounded-2xl border border-emerald-500/20 p-4">
            <p className="flex items-center gap-2 text-xs text-zinc-500">
              <DollarSign className="size-3.5 text-emerald-400" /> LLM cost
            </p>
            <p className="mt-2 text-2xl font-semibold text-emerald-100">
              ${summary.next_24h_cost_usd.toFixed(3)}
            </p>
            <p className="mt-1 text-xs text-zinc-600">next 24h</p>
          </div>
          <div className="glass-card rounded-2xl border border-violet-500/20 p-4">
            <p className="flex items-center gap-2 text-xs text-zinc-500">
              <ArrowUpRight className="size-3.5 text-violet-400" /> Top rising agent
            </p>
            <p className="mt-2 text-lg font-semibold text-violet-100">
              {summary.top_rising_agent.agent_name}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Win rate {(summary.top_rising_agent.forecast_win_rate * 100).toFixed(0)}% forecast
            </p>
          </div>
          <div className="glass-card rounded-2xl border border-red-500/20 p-4">
            <p className="flex items-center gap-2 text-xs text-zinc-500">
              <ShieldAlert className="size-3.5 text-red-400" /> Highest risk provider
            </p>
            <p className="mt-2 text-lg font-semibold capitalize text-red-100">
              {summary.highest_risk_provider.provider}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Rate limit risk {(summary.highest_risk_provider.rate_limit_risk * 100).toFixed(0)}%
            </p>
          </div>
          <div className="glass-card rounded-2xl border border-amber-500/20 p-4 sm:col-span-2 lg:col-span-1">
            <p className="flex items-center gap-2 text-xs text-zinc-500">
              <Sparkles className="size-3.5 text-amber-400" /> Marketplace
            </p>
            <p className="mt-2 text-2xl font-semibold text-amber-100">
              +{summary.marketplace_candidates_forecast}
            </p>
            <p className="mt-1 text-xs text-zinc-600">candidates forecast</p>
          </div>
        </div>
        <p className="mt-3 font-mono text-[10px] text-zinc-600">
          Model: {data.model.name} v{data.model.version} · Generated{" "}
          {new Date(data.generated_at).toLocaleString()}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 2. Token forecast */}
        <section className="glass-card rounded-2xl p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
            Token usage forecast
          </p>
          <ForecastChart points={data.token_forecast.points} valueLabel="Tokens" />
          <div className="mt-4 rounded-lg border border-white/5 bg-black/20 p-3">
            <p className="text-sm text-zinc-300">{data.token_forecast.explanation.summary}</p>
            <ul className="mt-2 list-inside list-disc text-xs text-zinc-500">
              {data.token_forecast.explanation.factors.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-violet-400/80">
              Confidence {(data.token_forecast.explanation.confidence * 100).toFixed(0)}%
            </p>
          </div>
        </section>

        {/* 3. Cost forecast */}
        <section className="glass-card rounded-2xl p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
            Cost forecast
          </p>
          <ForecastChart points={data.cost_forecast.points} valueLabel="Cost USD" height={140} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/5 bg-black/20 p-3">
              <p className="text-xs text-zinc-500">Daily trend (7d)</p>
              <div className="mt-2 flex h-12 items-end gap-1">
                {MOCK_DAILY_COST_HISTORY.map((d) => {
                  const h = d.cost / 0.8;
                  return (
                    <div
                      key={d.date}
                      className="flex-1 rounded-t bg-emerald-500/40"
                      style={{ height: `${h * 100}%` }}
                      title={`${d.date}: $${d.cost}`}
                    />
                  );
                })}
              </div>
            </div>
            <div className="rounded-lg border border-white/5 bg-black/20 p-3">
              <p className="text-xs text-zinc-500">Monthly projection</p>
              <p className="mt-1 text-xl font-semibold text-emerald-200">
                ${summary.monthly_cost_projection_usd.toFixed(2)}
              </p>
              <p className="mt-2 text-xs text-amber-400/90">
                Spike risk {(summary.cost_spike_risk * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* 4. Agent win-rate */}
      <section className="glass-card rounded-2xl p-5">
        <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
          Agent win-rate forecast
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-zinc-500">
                <th className="pb-2 pr-4">Rank</th>
                <th className="pb-2 pr-4">Agent</th>
                <th className="pb-2 pr-4">Expected win rate</th>
                <th className="pb-2 pr-4">Confidence</th>
                <th className="pb-2">Trend</th>
              </tr>
            </thead>
            <tbody>
              {[...data.agent_profiles]
                .sort((a, b) => b.forecast_win_rate - a.forecast_win_rate)
                .map((agent, i) => (
                  <tr key={agent.agent_id} className="border-b border-white/5">
                    <td className="py-3 pr-4 font-mono text-zinc-500">{i + 1}</td>
                    <td className="py-3 pr-4 font-medium text-zinc-200">{agent.agent_name}</td>
                    <td className="py-3 pr-4">
                      <span className="text-violet-200">
                        {(agent.forecast_win_rate * 100).toFixed(0)}%
                      </span>
                      <span className="ml-2 text-xs text-zinc-600">
                        (now {(agent.current_win_rate * 100).toFixed(0)}%)
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded bg-violet-500/15 px-2 py-0.5 text-xs text-violet-200">
                        {(agent.confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="flex items-center gap-1 capitalize text-zinc-400">
                        <TrendIcon trend={agent.trend} />
                        {agent.trend}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Provider usage */}
      <section className="glass-card rounded-2xl p-5">
        <p className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-zinc-500">
          <Cloud className="size-4 text-cyan-400" /> Provider usage forecast
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {data.provider_forecasts.map((p) => (
            <div
              key={p.provider}
              className="rounded-xl border border-white/5 bg-black/20 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium capitalize text-zinc-200">{p.provider}</span>
                <span
                  className={`rounded px-2 py-0.5 text-xs ${
                    p.rate_limit_risk > 0.7
                      ? "bg-red-500/20 text-red-200"
                      : p.rate_limit_risk > 0.4
                        ? "bg-amber-500/20 text-amber-200"
                        : "bg-emerald-500/20 text-emerald-200"
                  }`}
                >
                  Risk {(p.rate_limit_risk * 100).toFixed(0)}%
                </span>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-zinc-500">
                <span>Now {p.current_pct}%</span>
                <span className="text-violet-300">Forecast {p.forecast_pct}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500/60 to-violet-500/60"
                  style={{ width: `${p.forecast_pct}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-zinc-400">{p.recommended_action}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Anomaly alerts */}
      <section>
        <p className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-zinc-500">
          <AlertTriangle className="size-4 text-amber-400" /> Anomaly alerts
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.anomalies.map((ev) => (
            <AnomalyCard key={ev.id} event={ev} />
          ))}
        </div>
      </section>

      {/* 7. Recommended actions */}
      <section className="glass-card rounded-2xl border border-violet-500/15 p-5">
        <p className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-zinc-500">
          <Brain className="size-4 text-violet-400" /> Recommended actions
        </p>
        <ul className="space-y-3">
          {data.recommendations.map((rec) => (
            <li
              key={rec.id}
              className="flex flex-wrap items-start gap-3 rounded-xl border border-white/5 bg-black/20 p-4"
            >
              <span
                className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-mono uppercase ${
                  rec.priority === "high"
                    ? "bg-red-500/20 text-red-200"
                    : rec.priority === "medium"
                      ? "bg-amber-500/20 text-amber-200"
                      : "bg-zinc-700/50 text-zinc-400"
                }`}
              >
                {rec.priority}
              </span>
              <div>
                <p className="font-medium text-zinc-200">{rec.title}</p>
                <p className="mt-1 text-sm text-zinc-500">{rec.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 8. Forecasting battle preview */}
      <section className="glass-card rounded-2xl border border-amber-500/20 p-5">
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-zinc-500">
          <Trophy className="size-4 text-amber-400" /> Forecasting battle preview
        </p>
        <h2 className="mt-2 text-lg font-semibold text-zinc-100">{data.battle.title}</h2>
        <p className="mt-2 text-sm text-zinc-400">
          &ldquo;Forecast next 7 days of tournament cost and token usage&rdquo;
        </p>
        <p className="mt-1 text-xs text-zinc-600">{data.battle.brief}</p>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase text-zinc-500">Competing agents</p>
            <ul className="mt-2 space-y-2">
              {data.battle_submissions.map((sub) => {
                const score = data.battle_scores.find((s) => s.submission_id === sub.id);
                return (
                  <li
                    key={sub.id}
                    className="rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-sm"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium text-zinc-200">{sub.agent_name}</span>
                      {score && (
                        <span className="font-mono text-amber-300">
                          #{score.rank} · {score.total_score.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      ${sub.predicted_cost_usd.toFixed(2)} · {formatTokens(sub.predicted_tokens)}{" "}
                      tokens
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">{sub.methodology}</p>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase text-zinc-500">Score breakdown</p>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-zinc-500">
                    <th className="pb-2">Agent</th>
                    <th className="pb-2">Accuracy</th>
                    <th className="pb-2">Calibration</th>
                    <th className="pb-2">Explanation</th>
                    <th className="pb-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data.battle_scores]
                    .sort((a, b) => a.rank - b.rank)
                    .map((s) => (
                      <tr key={s.submission_id} className="border-t border-white/5">
                        <td className="py-2 text-zinc-200">{s.agent_name}</td>
                        <td className="py-2">{s.accuracy_score}</td>
                        <td className="py-2">{s.calibration_score}</td>
                        <td className="py-2">{s.explanation_score}</td>
                        <td className="py-2 font-mono text-amber-200">{s.total_score.toFixed(1)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </ForecastingShell>
  );
}
