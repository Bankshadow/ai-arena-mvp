export * from "@/lib/forecasting/types";
export { buildForecastingDashboard, ANOMALY_RULES, MOCK_DAILY_COST_HISTORY } from "@/lib/forecasting/engine";
export { buildMockSeries } from "@/lib/forecasting/mock-series";

/** Future: Supabase time-series ingest + Python worker forecast port. */
export type ForecastWorkerPort = {
  runForecast(target: import("@/lib/forecasting/types").ForecastTarget, horizonHours: number): Promise<import("@/lib/forecasting/types").ForecastRun>;
  detectAnomalies(): Promise<import("@/lib/forecasting/types").AnomalyEvent[]>;
};
