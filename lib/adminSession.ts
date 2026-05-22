import { createHmac, timingSafeEqual } from "crypto";

const SESSION_COOKIE = "fyec100_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export type AdminSessionStatus = {
  active: boolean;
  actor?: string;
  cookieName: string;
  expiresAt?: string;
  reason: string;
  role?: AdminRole;
};

export type AdminRole =
  | "developer"
  | "governance"
  | "it-system-admin"
  | "lecturer"
  | "lms-admin"
  | "project-lead"
  | "sponsor";

export function getAdminSessionCookieName() {
  return SESSION_COOKIE;
}

export function createAdminSessionToken(actor = "pilot-admin", role: AdminRole = "project-lead") {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ actor, expiresAt, role }), "utf8").toString("base64url");
  const signature = sign(payload);

  return {
    cookieName: SESSION_COOKIE,
    expiresAt: new Date(expiresAt).toISOString(),
    maxAge: SESSION_TTL_MS / 1000,
    token: `${payload}.${signature}`
  };
}

export function inspectAdminSessionToken(token?: string | null): AdminSessionStatus {
  if (!token) {
    return {
      active: false,
      cookieName: SESSION_COOKIE,
      reason: "No admin session cookie was provided."
    };
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature || !safeCompare(signature, sign(payload))) {
    return {
      active: false,
      cookieName: SESSION_COOKIE,
      reason: "The admin session signature is invalid."
    };
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      actor?: string;
      expiresAt?: number;
      role?: AdminRole;
    };

    if (!decoded.expiresAt || decoded.expiresAt <= Date.now()) {
      return {
        active: false,
        cookieName: SESSION_COOKIE,
        expiresAt: decoded.expiresAt ? new Date(decoded.expiresAt).toISOString() : undefined,
        reason: "The admin session is expired."
      };
    }

    return {
      active: true,
      actor: decoded.actor || "pilot-admin",
      cookieName: SESSION_COOKIE,
      expiresAt: new Date(decoded.expiresAt).toISOString(),
      reason: "A valid local admin session is active.",
      role: decoded.role || "project-lead"
    };
  } catch {
    return {
      active: false,
      cookieName: SESSION_COOKIE,
      reason: "The admin session payload could not be decoded."
    };
  }
}

function sign(payload: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_ACCESS_TOKEN || "local-fyec100-session-secret";
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
