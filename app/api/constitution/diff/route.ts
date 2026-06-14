import { NextResponse } from "next/server";
import { z } from "zod";

import {
  compareConstitutions,
  getVersionActualImpacts,
} from "@/lib/constitution/diff";
import { getConstitutionRecordById } from "@/lib/constitution/mock-data";

const BodySchema = z.object({
  constitutionId: z.string(),
  fromVersion: z.string(),
  toVersion: z.string(),
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

  const record = getConstitutionRecordById(parsed.data.constitutionId);
  if (!record) {
    return NextResponse.json({ error: "Constitution not found" }, { status: 404 });
  }

  const from = record.versions.find((v) => v.version === parsed.data.fromVersion);
  const to = record.versions.find((v) => v.version === parsed.data.toVersion);
  if (!from || !to) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  const impacts = getVersionActualImpacts(from.version, to.version);
  const diff = compareConstitutions(from, to, impacts);

  return NextResponse.json(diff);
}
