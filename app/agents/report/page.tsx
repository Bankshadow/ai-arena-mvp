import { BenchmarkReportView } from "@/components/agents/benchmark-report";
import { getBenchmarkReport } from "@/lib/agents/report";

export const metadata = {
  title: "Benchmark Report · Executive Summary Battle #1 | AI ARENA",
  description:
    "Case study: 10 AI workflow strategies summarized the same board report. Here's what won — and why quality-per-dollar tells a different story.",
};

export default function BenchmarkReportPage() {
  const report = getBenchmarkReport();
  return <BenchmarkReportView report={report} />;
}
