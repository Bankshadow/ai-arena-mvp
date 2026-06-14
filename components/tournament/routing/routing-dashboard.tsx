"use client";

import { useTranslations } from "@/components/i18n/locale-provider";
import { translateGuardAction, translateRiskLevel } from "@/lib/i18n/helpers";
import type {
  ProviderUsageEntry,
  RoutingTimelineEntry,
  TournamentRoutingMeta,
} from "@/lib/tournament/routing/types";

type Props = {
  routing: TournamentRoutingMeta | undefined;
  narrow?: boolean;
};

const RISK_STYLES = {
  low: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  medium: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  high: "border-red-500/40 bg-red-500/10 text-red-200",
};

export function RoutingDashboard({ routing, narrow }: Props) {
  const t = useTranslations();
  const d = t.tournament.routing.dashboard;
  const tc = t.tournament.common;
  const guard = routing?.guard;
  const usage = routing?.providerUsage ?? [];
  const timeline = routing?.routingTimeline ?? [];
  const saved = routing?.costSavedEstimateUsd ?? 0;

  return (
    <div className={`grid gap-3 ${narrow ? "grid-cols-1" : "gap-6 xl:grid-cols-2"}`}>
      <section className={`rounded-xl border border-white/10 bg-black/20 ${narrow ? "p-3" : "glass-card rounded-2xl p-5"}`}>
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          {d.rateLimitTitle}
        </h3>
        {guard ? (
          <div className="mt-3 space-y-2">
            <div
              className={`inline-flex rounded-lg border px-2 py-0.5 text-[10px] font-medium uppercase ${RISK_STYLES[guard.riskLevel]}`}
            >
              {d.risk}: {translateRiskLevel(guard.riskLevel, t)}
            </div>
            <p className="text-[11px] leading-snug text-zinc-400">{guard.message}</p>
            <dl className={`grid gap-2 text-[10px] text-zinc-500 ${narrow ? "grid-cols-2" : "grid-cols-2"}`}>
              <Stat label={d.estApiCalls} value={String(guard.apiCallCount)} />
              <Stat
                label={d.estTokens}
                value={`${(guard.estimatedInputTokens + guard.estimatedOutputTokens).toLocaleString()}`}
              />
              <Stat
                label={d.action}
                value={translateGuardAction(guard.recommendedAction, t)}
              />
              <Stat label={d.canRun} value={guard.canRun ? tc.yes : tc.no} />
            </dl>
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-600">{d.runToAssess}</p>
        )}
        <div className="mt-3 rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-3 py-2">
          <p className="text-[10px] text-zinc-500">{d.costSaved}</p>
          <p className="font-mono text-sm text-cyan-300">${saved.toFixed(4)}</p>
        </div>
      </section>

      <section className={`rounded-xl border border-white/10 bg-black/20 ${narrow ? "p-3" : "glass-card rounded-2xl p-5"}`}>
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          {d.timelineTitle}
        </h3>
        {timeline.length === 0 ? (
          <p className="mt-3 text-[11px] text-zinc-600">{d.noTimeline}</p>
        ) : (
          <ol className="mt-3 max-h-36 space-y-1.5 overflow-y-auto pr-1 text-[10px]">
            {timeline.map((entry, i) => (
              <TimelineRow key={`${entry.timestamp}-${i}`} entry={entry} narrow={narrow} />
            ))}
          </ol>
        )}
      </section>

      {!narrow && (
      <section className="glass-card rounded-2xl p-5 xl:col-span-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          {d.usageTitle}
        </h3>
        {usage.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600">{d.noUsage}</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-xs">
              <thead className="text-left text-zinc-500">
                <tr>
                  <th className="pb-2">{d.table.time}</th>
                  <th className="pb-2">{d.table.task}</th>
                  <th className="pb-2">{d.table.provider}</th>
                  <th className="pb-2">{d.table.model}</th>
                  <th className="pb-2 text-right">{d.table.tokens}</th>
                  <th className="pb-2 text-right">{d.table.cost}</th>
                  <th className="pb-2 text-right">{d.table.latency}</th>
                  <th className="pb-2">{d.table.status}</th>
                </tr>
              </thead>
              <tbody>
                {[...usage].reverse().slice(0, 12).map((row) => (
                  <UsageRow key={row.id} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className="font-mono text-zinc-300">{value}</dd>
    </div>
  );
}

function TimelineRow({ entry, narrow }: { entry: RoutingTimelineEntry; narrow?: boolean }) {
  return (
    <li className={`flex min-w-0 items-center gap-1.5 rounded-lg border border-white/5 bg-black/20 px-2 py-1.5 ${narrow ? "flex-col items-start" : "flex-wrap"}`}>
      <span className="truncate text-zinc-400">{entry.step}</span>
      <span className="rounded bg-violet-500/20 px-1 py-0.5 font-mono text-[9px] text-violet-300">
        {entry.provider}
      </span>
      {!narrow && <span className="truncate text-zinc-500">{entry.model}</span>}
    </li>
  );
}

function UsageRow({ row }: { row: ProviderUsageEntry }) {
  const status = row.status ?? "success";
  const statusStyle =
    status === "success"
      ? "text-emerald-400"
      : status === "cached"
        ? "text-cyan-400"
        : status === "skipped"
          ? "text-zinc-500"
          : "text-red-400";

  return (
    <tr className="border-t border-white/5">
      <td className="py-2 text-zinc-500">
        {new Date(row.timestamp).toLocaleTimeString()}
      </td>
      <td className="py-2 text-zinc-400">{row.taskType.replace(/_/g, " ")}</td>
      <td className="py-2 font-mono text-cyan-300">{row.provider}</td>
      <td className="py-2 text-zinc-500">{row.model}</td>
      <td className="py-2 text-right font-mono text-violet-300">
        {(row.inputTokens + row.outputTokens).toLocaleString()}
      </td>
      <td className="py-2 text-right font-mono text-emerald-400">
        ${row.estimatedCostUsd.toFixed(4)}
      </td>
      <td className="py-2 text-right text-zinc-500">{row.latencyMs}ms</td>
      <td className={`py-2 text-xs capitalize ${statusStyle}`}>{status}</td>
    </tr>
  );
}
