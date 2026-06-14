import { notFound } from "next/navigation";

import { WorkflowDetailView } from "@/components/workflows/workflow-detail-view";
import { getWorkflowBySlug } from "@/lib/workflows/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const workflow = getWorkflowBySlug(slug);
  return {
    title: workflow ? `${workflow.title} | AI ARENA` : "Workflow | AI ARENA",
    description: workflow?.strategySummary ?? "Workflow detail",
  };
}

export default async function WorkflowDetailPage({ params }: Props) {
  const { slug } = await params;
  const workflow = getWorkflowBySlug(slug);
  if (!workflow) notFound();
  return <WorkflowDetailView workflow={workflow} />;
}
