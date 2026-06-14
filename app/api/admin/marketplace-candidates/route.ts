import { NextResponse } from "next/server";

import { listMarketplaceCandidates } from "@/lib/marketplace/candidate-store";
import type { CandidateStatus } from "@/lib/marketplace/types";

const PENDING: CandidateStatus[] = ["detected", "review_needed", "draft", "approved"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const limit = Number(searchParams.get("limit") ?? "50");

  let status: CandidateStatus | CandidateStatus[] | undefined = PENDING;
  if (statusParam === "all") {
    status = undefined;
  } else if (statusParam) {
    status = statusParam as CandidateStatus;
  }

  const candidates = await listMarketplaceCandidates({ status, limit });
  return NextResponse.json({
    candidates,
    source: candidates.length > 0 ? "store" : "empty",
  });
}
