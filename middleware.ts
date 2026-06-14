import type { NextRequest } from "next/server";

import { isAdminRoute, verifyAdminAuth } from "@/lib/admin/auth";

export function middleware(request: NextRequest) {
  if (!isAdminRoute(request.nextUrl.pathname)) {
    return;
  }

  return verifyAdminAuth(request) ?? undefined;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
