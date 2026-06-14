import { NextResponse } from "next/server";
import { z } from "zod";

import { judgeOutput } from "@/lib/judge/rubric-judge";

const BodySchema = z.object({
  output: z.string().min(40, "Output must be at least 40 characters"),
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
    const judged = await judgeOutput(parsed.data.output);
    return NextResponse.json(judged);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
