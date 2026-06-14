import { NextResponse } from "next/server";

import { getServerKnowledgeBase } from "@/lib/memory/store";
import { queryMemory } from "@/lib/memory/query";

export async function POST(request: Request) {
  const { query } = (await request.json()) as { query?: string };
  const kb = getServerKnowledgeBase();
  const result = queryMemory(query ?? "", kb.articles, kb.lessons);
  return NextResponse.json(result);
}
