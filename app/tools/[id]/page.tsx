import { ToolPluginDetailView } from "@/components/tool-arena/tool-plugin-detail-view";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return {
    title: `${id} | Tools | AI ARENA`,
  };
}

export default async function ToolPluginPage({ params }: Props) {
  const { id } = await params;
  return <ToolPluginDetailView pluginId={id} />;
}
