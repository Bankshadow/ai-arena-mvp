import type { ForecastPoint } from "@/lib/forecasting/types";

const HOURS = 24;

function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3600_000).toISOString();
}

function hoursAhead(n: number): string {
  return new Date(Date.now() + n * 3600_000).toISOString();
}

/** Generate mock historical + forecast points (last 12h actual, next 12h forecast). */
export function buildMockSeries(
  base: number,
  variance: number,
  trend: number,
  forecastBump: number,
): ForecastPoint[] {
  const points: ForecastPoint[] = [];

  for (let i = 12; i >= 1; i--) {
    const actual = base + trend * (12 - i) + (Math.sin(i) * variance) / 2;
    points.push({
      timestamp: hoursAgo(i),
      actual: Math.round(actual * 100) / 100,
      predicted: Math.round(actual * 100) / 100,
      lower: actual * 0.9,
      upper: actual * 1.1,
    });
  }

  const lastActual = points[points.length - 1]?.actual ?? base;
  for (let i = 1; i <= 12; i++) {
    const predicted = lastActual + forecastBump * i + (Math.cos(i) * variance) / 3;
    points.push({
      timestamp: hoursAhead(i),
      actual: null,
      predicted: Math.round(predicted * 100) / 100,
      lower: Math.round(predicted * 0.85 * 100) / 100,
      upper: Math.round(predicted * 1.15 * 100) / 100,
    });
  }

  return points;
}

export const MOCK_DAILY_COST_HISTORY = [
  { date: "2026-06-08", cost: 0.42 },
  { date: "2026-06-09", cost: 0.51 },
  { date: "2026-06-10", cost: 0.48 },
  { date: "2026-06-11", cost: 0.55 },
  { date: "2026-06-12", cost: 0.62 },
  { date: "2026-06-13", cost: 0.58 },
  { date: "2026-06-14", cost: 0.71 },
];

export { HOURS };
