import { NextResponse } from "next/server";

import { filterComponents, getMockComponentCatalog } from "@/lib/marketplace/mock-catalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? undefined;
  const components = type
    ? filterComponents({ type: type as import("@/lib/marketplace/types").ComponentType })
    : getMockComponentCatalog();

  return NextResponse.json({ components, total: components.length });
}
