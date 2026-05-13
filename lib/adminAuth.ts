import { NextResponse } from "next/server";

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

  return NextResponse.json(
    {
      error:
        "Admin access required. Provide the pilot admin token using x-admin-token or adminToken."
    },
    { status: 401 }
  );
}
