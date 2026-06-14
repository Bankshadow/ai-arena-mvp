import { NextResponse } from "next/server";

import { listConstitutionRecords } from "@/lib/constitution/store";

export async function GET() {
  return NextResponse.json({ records: listConstitutionRecords() });
}
