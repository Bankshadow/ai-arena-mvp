import { notFound } from "next/navigation";

import { ResearchReportDetailView } from "@/components/research/research-report-detail-view";
import { getServerReport } from "@/lib/research/store";

export default async function ResearchReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = getServerReport(id);
  if (!report) notFound();
  return <ResearchReportDetailView report={report} />;
}
