import { NextResponse } from "next/server";
import { z } from "zod";

import { runMemoryCompilePipeline } from "@/lib/memory/pipeline";
import type { TournamentState } from "@/lib/tournament/types";

const BodySchema = z.object({
  state: z.custom<TournamentState>().optional(),
});

export async function POST(request: Request) {
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    /* empty body ok */
  }

  const parsed = BodySchema.safeParse(body);
  const state = parsed.success && parsed.data.state ? parsed.data.state : null;

  if (!state || state.tournament.evaluations.length === 0) {
    return NextResponse.json({
      ok: false,
      message: "Provide tournament state with evaluations to compile memory.",
    });
  }

  const { knowledgeBase, meta } = runMemoryCompilePipeline(state);

  return NextResponse.json({
    ok: true,
    message: `Compiled ${knowledgeBase.articles?.length ?? 0} articles, ${knowledgeBase.lessons?.length ?? 0} lessons`,
    meta,
    knowledgeBase,
    articles: knowledgeBase.articles?.length ?? 0,
  });
}
