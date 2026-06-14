import { NextResponse } from "next/server";

import { lintMemoryKnowledgeBase } from "@/lib/memory/linter";
import { getServerKnowledgeBase } from "@/lib/memory/store";

export async function POST() {
  const kb = getServerKnowledgeBase();
  const report = lintMemoryKnowledgeBase({
    articles: kb.articles,
    links: kb.links,
    lessons: kb.lessons,
    proposals: kb.proposals,
    evidenceNotes: kb.evidenceNotes,
  });
  return NextResponse.json(report);
}
