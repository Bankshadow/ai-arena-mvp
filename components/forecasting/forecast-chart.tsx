"use client";

import type { ForecastPoint } from "@/lib/forecasting/types";

type ForecastChartProps = {
  points: ForecastPoint[];
  valueLabel?: string;
  height?: number;
};

export function ForecastChart({ points, valueLabel = "Value", height = 160 }: ForecastChartProps) {
  if (points.length === 0) return null;

  const values = points.flatMap((p) => [p.actual ?? p.predicted, p.lower, p.upper]);
  const min = Math.min(...values) * 0.95;
  const max = Math.max(...values) * 1.05;
  const range = max - min || 1;
  const w = 600;
  const pad = { top: 12, right: 8, bottom: 24, left: 8 };
  const chartH = height - pad.top - pad.bottom;
  const step = (w - pad.left - pad.right) / Math.max(points.length - 1, 1);

  const y = (v: number) => pad.top + chartH - ((v - min) / range) * chartH;
  const x = (i: number) => pad.left + i * step;

  const actualPath = points
    .map((p, i) => (p.actual != null ? `${i === 0 || points[i - 1]?.actual == null ? "M" : "L"} ${x(i)} ${y(p.actual)}` : ""))
    .filter(Boolean)
    .join(" ");

  const forecastStart = points.findIndex((p) => p.actual === null);
  const forecastPath =
    forecastStart >= 0
      ? points
          .slice(forecastStart)
          .map((p, j) => `${j === 0 ? "M" : "L"} ${x(forecastStart + j)} ${y(p.predicted)}`)
          .join(" ")
      : "";

  const bandPath = (() => {
    const upper = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.upper)}`)
      .join(" ");
    const lower = [...points]
      .reverse()
      .map((p, j) => `${j === 0 ? "L" : "L"} ${x(points.length - 1 - j)} ${y(p.lower)}`)
      .join(" ");
    return `${upper} ${lower} Z`;
  })();

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${height}`} className="h-auto w-full min-w-[280px]" aria-label={valueLabel}>
        <path d={bandPath} fill="rgba(139,92,246,0.12)" stroke="none" />
        {actualPath && (
          <path d={actualPath} fill="none" stroke="rgb(34,211,238)" strokeWidth="2" />
        )}
        {forecastPath && (
          <path
            d={forecastPath}
            fill="none"
            stroke="rgb(167,139,250)"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
        )}
        {forecastStart >= 0 && (
          <line
            x1={x(forecastStart)}
            y1={pad.top}
            x2={x(forecastStart)}
            y2={height - pad.bottom}
            stroke="rgba(255,255,255,0.15)"
            strokeDasharray="4 4"
          />
        )}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-cyan-400" /> Historical
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-violet-400" /> Forecast
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-4 rounded-sm bg-violet-500/20" /> Confidence range
        </span>
      </div>
    </div>
  );
}
