import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isPlaceholderEnvValue } from "@/lib/env";

const ADMIN_PATHS = ["/admin"];
const ADMIN_API_PREFIX = "/api/admin";

export function isAdminRoute(pathname: string): boolean {
  return (
    ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname.startsWith(ADMIN_API_PREFIX)
  );
}

function adminCredentialsConfigured(): boolean {
  const user = process.env.ADMIN_USERNAME?.trim();
  const pass = process.env.ADMIN_PASSWORD?.trim();
  if (!user || !pass) return false;
  if (isPlaceholderEnvValue(user) || isPlaceholderEnvValue(pass)) return false;
  return true;
}

function unauthorizedResponse(): NextResponse {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="AI ARENA Admin"' },
  });
}

function forbiddenResponse(): NextResponse {
  return new NextResponse("Admin credentials not configured on server", { status: 503 });
}

/** Verify HTTP Basic Auth for admin routes. */
export function verifyAdminAuth(request: NextRequest): NextResponse | null {
  if (!adminCredentialsConfigured()) {
    if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
      return forbiddenResponse();
    }
    return null;
  }

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) {
    return unauthorizedResponse();
  }

  const decoded = atob(header.slice(6));
  const colon = decoded.indexOf(":");
  const user = colon >= 0 ? decoded.slice(0, colon) : decoded;
  const pass = colon >= 0 ? decoded.slice(colon + 1) : "";

  const expectedUser = process.env.ADMIN_USERNAME!.trim();
  const expectedPass = process.env.ADMIN_PASSWORD!.trim();

  if (user !== expectedUser || pass !== expectedPass) {
    return unauthorizedResponse();
  }

  return null;
}
