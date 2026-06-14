import { notFound } from "next/navigation";

import { ComponentDetailView } from "@/components/marketplace/component-detail-view";
import { getComponentById, getMockComponentCatalog } from "@/lib/marketplace/mock-catalog";

export function generateStaticParams() {
  return getMockComponentCatalog().map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const component = getComponentById(id);
  if (!component) return { title: "Component | AI ARENA" };
  return {
    title: `${component.title} | AI ARENA`,
    description: component.description,
  };
}

export default async function ComponentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const component = getComponentById(id);
  if (!component) notFound();

  return <ComponentDetailView component={component} />;
}
