import { NextResponse } from "next/server";
import { z } from "zod";

import { generateChallenge } from "@/lib/challenge/generate-challenge";

const BodySchema = z.object({
  topic: z.string().max(120).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json().catch(() => ({}));
  } catch {
    body = {};
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  try {
    const challenge = await generateChallenge(parsed.data);
    return NextResponse.json(challenge);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
