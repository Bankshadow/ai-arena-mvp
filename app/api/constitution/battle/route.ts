import { NextResponse } from "next/server";
import { z } from "zod";

import { runConstitutionBattle } from "@/lib/constitution/battle";

const BodySchema = z.object({
  agentId: z.string(),
  versions: z.array(z.string()).min(2),
  challengeTitle: z.string().optional(),
  challengeBrief: z.string().optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  try {
    const result = runConstitutionBattle(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
