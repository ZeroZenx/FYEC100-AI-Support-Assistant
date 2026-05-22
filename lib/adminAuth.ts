import { NextResponse } from "next/server";
import { getAdminSessionCookieName, inspectAdminSessionToken } from "@/lib/adminSession";

const ADMIN_TOKEN_PARAM = "adminToken";
const ADMIN_TOKEN_HEADER = "x-admin-token";

export function getAdminAuthStatus() {
  return {
    configured: Boolean(process.env.ADMIN_ACCESS_TOKEN),
    headerName: ADMIN_TOKEN_HEADER,
    queryParam: ADMIN_TOKEN_PARAM
  };
}

export function isAdminAccessAllowed(token?: string | null) {
  const expectedToken = process.env.ADMIN_ACCESS_TOKEN;

  if (!expectedToken) {
    return true;
  }

  return token === expectedToken;
}

export function getAdminTokenFromRequest(request: Request) {
  const url = new URL(request.url);

  return (
    request.headers.get(ADMIN_TOKEN_HEADER) ||
    url.searchParams.get(ADMIN_TOKEN_PARAM)
  );
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
    {
      error:
        "Admin access required. Provide the pilot admin token using x-admin-token or adminToken."
    },
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
