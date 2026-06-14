import { MarketplaceDetailView } from "@/components/marketplace/marketplace-detail-view";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return {
    title: `${slug} | Marketplace | AI ARENA`,
  };
}

export default async function MarketplaceDetailPage({ params }: Props) {
  const { slug } = await params;
  return <MarketplaceDetailView slug={slug} />;
}
