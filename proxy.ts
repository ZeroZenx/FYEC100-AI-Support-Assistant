import { NextResponse, type NextRequest } from "next/server";
import { isAdminAccessAllowed, isAdminProtectionRequired } from "@/lib/adminAuth";
import { getAdminSessionCookieName, inspectAdminSessionToken } from "@/lib/adminSession";

const PUBLIC_PAGES = new Set([
  "/",
  "/about",
  "/access-denied",
  "/accessibility-test",
  "/admin-login",
  "/chat",
  "/embed",
  "/roadmap",
  "/student-ai-guide",
  "/student-consent-privacy",
  "/student-feedback-follow-up",
  "/student-pilot-welcome"
]);

const PUBLIC_API_PREFIXES = [
  "/api/admin/session",
  "/api/chat",
  "/api/feedback",
  "/api/health",
  "/api/launch-audit",
  "/api/lti",
  "/api/ready",
  "/api/support-handoff"
];

export function proxy(request: NextRequest) {
  if (!isAdminProtectionRequired() || isPublicRequest(request)) {
    return NextResponse.next();
  }

  const headerToken = request.headers.get("x-admin-token");
  const session = inspectAdminSessionToken(
    request.cookies.get(getAdminSessionCookieName())?.value
  );

  if (isAdminAccessAllowed(headerToken) || session.active) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  const loginUrl = new URL("/admin-login", request.url);
  loginUrl.searchParams.set(
    "returnTo",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );
  return NextResponse.redirect(loginUrl);
}

function isPublicRequest(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname.startsWith("/images/") ||
    /\.(?:ico|jpg|jpeg|png|svg|webp|woff2?)$/.test(pathname)
  ) {
    return true;
  }

  if (PUBLIC_PAGES.has(pathname)) return true;
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"]
};
