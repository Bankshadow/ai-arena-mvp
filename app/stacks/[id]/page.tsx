import { StackDetailLoader } from "@/components/marketplace/stack-detail-view";

export const metadata = {
  title: "Saved Stack | AI ARENA",
};

export default async function StackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StackDetailLoader slug={id} />;
}
