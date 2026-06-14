import { NextResponse } from "next/server";

import { transitionCandidate } from "@/lib/marketplace/candidate-store";
import { refreshComponentCatalog } from "@/lib/marketplace/mock-catalog";

const ACTIONS = new Set(["approve", "reject", "publish", "archive"]);

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; action: string }> },
) {
  const { id, action } = await params;

  if (!ACTIONS.has(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const record = await transitionCandidate(
    id,
    action as "approve" | "reject" | "publish" | "archive",
  );

  if (!record) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  if (action === "publish") {
    refreshComponentCatalog();
  }

  return NextResponse.json({ ok: true, candidate: record });
}
