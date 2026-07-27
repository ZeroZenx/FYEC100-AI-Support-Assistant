import { NextResponse } from "next/server";
import { createAdminSessionToken, getAdminSessionCookieName, inspectAdminSessionToken, type AdminRole } from "@/lib/adminSession";
import { getAdminTokenFromRequest, isAdminAccessAllowed } from "@/lib/adminAuth";
import { recordAuditEvent } from "@/lib/auditEvents";

export async function GET(request: Request) {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${getAdminSessionCookieName()}=`))
    ?.split("=")[1];

  return NextResponse.json(inspectAdminSessionToken(cookie));
}

export async function POST(request: Request) {
  const token = getAdminTokenFromRequest(request);
  const body = await safeJson(request);

  if (!isAdminAccessAllowed(token)) {
    await recordAuditEvent({
      actor: "unknown-admin",
      area: "admin-session",
      detail: "Failed local admin session creation attempt.",
      eventType: "admin-access",
      severity: "warning",
      source: "api"
    });

    return NextResponse.json({ error: "Admin token is required." }, { status: 401 });
  }

  let session;
  try {
    session = createAdminSessionToken("pilot-admin", normalizeRole(body?.role));
  } catch {
    return NextResponse.json(
      { error: "Admin session signing is not configured for this environment." },
      { status: 503 }
    );
  }
  await recordAuditEvent({
    actor: "pilot-admin",
    area: "admin-session",
    detail: "Created local admin session cookie.",
    eventType: "admin-access",
    severity: "info",
    source: "api"
  });

  const response = NextResponse.json({
    active: true,
    cookieName: session.cookieName,
    expiresAt: session.expiresAt
  });
  response.cookies.set(session.cookieName, session.token, {
    httpOnly: true,
    maxAge: session.maxAge,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}

async function safeJson(request: Request) {
  try {
    return (await request.json()) as { role?: string };
  } catch {
    return null;
  }
}

function normalizeRole(role?: string): AdminRole {
  const roles: AdminRole[] = [
    "developer",
    "governance",
    "it-system-admin",
    "lecturer",
    "lms-admin",
    "project-lead",
    "sponsor"
  ];

  return roles.includes(role as AdminRole) ? (role as AdminRole) : "project-lead";
}
