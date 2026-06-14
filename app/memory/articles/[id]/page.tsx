import { notFound } from "next/navigation";

import { MemoryArticleDetailView } from "@/components/memory/memory-article-detail-view";
import { getServerKnowledgeBase } from "@/lib/memory/store";

export default async function MemoryArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kb = getServerKnowledgeBase();
  const article = kb.articles.find((a) => a.id === id || a.slug === id);
  if (!article) notFound();
  return <MemoryArticleDetailView article={article} />;
}
