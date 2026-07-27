import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { getAdminSessionCookieName, inspectAdminSessionToken } from "@/lib/adminSession";

const ADMIN_TOKEN_PARAM = "adminToken";
const ADMIN_TOKEN_HEADER = "x-admin-token";

export function getAdminAuthStatus() {
  return {
    configured: Boolean(process.env.ADMIN_ACCESS_TOKEN),
    headerName: ADMIN_TOKEN_HEADER,
    protectionRequired: isAdminProtectionRequired(),
    queryParam: ADMIN_TOKEN_PARAM,
    sessionSecretConfigured: Boolean(process.env.ADMIN_SESSION_SECRET)
  };
}

export function isAdminProtectionRequired() {
  return process.env.NODE_ENV === "production" || process.env.PROTECT_ADMIN_ROUTES === "true";
}

export function isAdminAccessAllowed(token?: string | null) {
  const expectedToken = process.env.ADMIN_ACCESS_TOKEN;

  if (!expectedToken) {
    return !isAdminProtectionRequired();
  }

  return safeCompare(token || "", expectedToken);
}

export function getAdminTokenFromRequest(request: Request) {
  const url = new URL(request.url);
  const queryToken =
    process.env.NODE_ENV === "production" ? null : url.searchParams.get(ADMIN_TOKEN_PARAM);

  return request.headers.get(ADMIN_TOKEN_HEADER) || queryToken;
}

export function requireAdminAccess(request: Request) {
  const token = getAdminTokenFromRequest(request);

  if (isAdminAccessAllowed(token)) {
    return null;
  }

  const session = inspectAdminSessionToken(getCookieValue(request, getAdminSessionCookieName()));
  if (session.active) {
    return null;
  }

  return NextResponse.json(
    { error: "Admin access required. Sign in or provide the admin access header." },
    { status: 401 }
  );
}

function getCookieValue(request: Request, name: string) {
  return request.headers
    .get("cookie")
    ?.split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
