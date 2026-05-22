import { appendFile, readFile } from "fs/promises";
import path from "path";
import { recordAuditEvent } from "@/lib/auditEvents";
import { verifyLtiJwtSignature } from "@/lib/ltiJwt";
import {
  normalizeMoodleLaunchContext,
  type MoodleLaunchContext,
  type MoodleRole
} from "@/lib/moodleContext";

const STATE_PATH = path.join(process.cwd(), "data", "lti-launch-states.jsonl");
const LTI_MESSAGE_TYPE = "LtiResourceLinkRequest";

export type LtiLaunchState = {
  clientId: string;
  deploymentId: string;
  expiresAt: string;
  issuer: string;
  nonce: string;
  returnUrl: string;
  state: string;
  targetLinkUri: string;
  timestamp: string;
};

export type LtiValidationResult = {
  checks: Array<{ label: string; message: string; status: "pass" | "warn" | "fail" }>;
  claims: Record<string, unknown>;
  embedUrl?: string;
  ok: boolean;
  stateRecord?: LtiLaunchState;
  trustedContext?: MoodleLaunchContext;
};

export async function createLtiLaunchState(input: {
  clientId?: string | null;
  issuer?: string | null;
  loginHint?: string | null;
  ltiMessageHint?: string | null;
  targetLinkUri?: string | null;
}) {
  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:4100";
  const stateRecord: LtiLaunchState = {
    clientId: input.clientId || process.env.LTI_CLIENT_ID || "",
    deploymentId: process.env.LTI_DEPLOYMENT_ID || "",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    issuer: input.issuer || process.env.LTI_PLATFORM_ISSUER || "",
    nonce: crypto.randomUUID(),
    returnUrl: `${appBaseUrl}/api/lti/launch`,
    state: crypto.randomUUID(),
    targetLinkUri: input.targetLinkUri || `${appBaseUrl}/embed`,
    timestamp: new Date().toISOString()
  };

  await appendFile(STATE_PATH, `${JSON.stringify(stateRecord)}\n`, "utf8");
  await recordAuditEvent({
    actor: "lti-login",
    area: "lti",
    detail: `Created LTI OIDC state for issuer ${stateRecord.issuer || "not configured"}.`,
    eventType: "lti-launch",
    relatedId: stateRecord.state,
    severity: "info",
    source: "api/lti/login"
  });

  return {
    authorizationUrl: buildAuthorizationUrl({
      loginHint: input.loginHint,
      ltiMessageHint: input.ltiMessageHint,
      stateRecord
    }),
    configured: Boolean(process.env.LTI_PLATFORM_AUTH_URL && stateRecord.clientId),
    missing: [
      !process.env.LTI_PLATFORM_AUTH_URL ? "LTI_PLATFORM_AUTH_URL" : "",
      !stateRecord.clientId ? "LTI_CLIENT_ID or client_id" : ""
    ].filter(Boolean),
    stateRecord
  };
}

export async function readLtiLaunchStates() {
  try {
    const content = await readFile(STATE_PATH, "utf8");

    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as LtiLaunchState)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }

    return [];
  }
}

export async function validateLtiLaunch(input: {
  idToken?: string | null;
  state?: string | null;
}) {
  const states = await readLtiLaunchStates();
  const stateRecord = states.find((item) => item.state === input.state);
  const claims = decodeJwtPayload(input.idToken);
  const checks: LtiValidationResult["checks"] = [];

  checks.push(check(Boolean(input.state), "State present", "Launch POST includes state."));
  checks.push(
    check(Boolean(stateRecord), "State found", "State exists in local launch state store.")
  );
  checks.push(
    check(
      Boolean(stateRecord && new Date(stateRecord.expiresAt).getTime() > Date.now()),
      "State not expired",
      "State is within the local 10-minute launch window."
    )
  );
  checks.push(check(Boolean(input.idToken), "ID token present", "Launch POST includes id_token."));
  checks.push(
    check(Object.keys(claims).length > 0, "JWT payload decoded", "ID token payload can be decoded.")
  );
  const signature = input.idToken
    ? verifyLtiJwtSignature(input.idToken)
    : { message: "ID token is missing.", ok: false };
  checks.push(check(signature.ok, "JWT signature validation", signature.message));
  checks.push(
    checkMatch(claims.iss, stateRecord?.issuer || process.env.LTI_PLATFORM_ISSUER, "Issuer")
  );
  checks.push(
    checkAudience(claims.aud, stateRecord?.clientId || process.env.LTI_CLIENT_ID)
  );
  checks.push(
    checkMatch(
      claims["https://purl.imsglobal.org/spec/lti/claim/deployment_id"],
      stateRecord?.deploymentId || process.env.LTI_DEPLOYMENT_ID,
      "Deployment ID"
    )
  );
  checks.push(checkMatch(claims.nonce, stateRecord?.nonce, "Nonce"));
  checks.push(
    checkMatch(
      claims["https://purl.imsglobal.org/spec/lti/claim/message_type"],
      LTI_MESSAGE_TYPE,
      "Message type"
    )
  );
  checks.push(
    check(
      Number(claims.exp ?? 0) * 1000 > Date.now(),
      "Token expiration",
      "Token has not expired."
    )
  );

  const ok = checks.every((item) => item.status === "pass");
  const trustedContext = ok ? mapClaimsToContext(claims) : undefined;
  const embedUrl = trustedContext
    ? `/embed?courseId=${encodeURIComponent(
        trustedContext.courseId
      )}&courseShortName=${encodeURIComponent(
        trustedContext.courseShortName
      )}&launchSource=lti&role=${trustedContext.role}`
    : undefined;

  await recordAuditEvent({
    actor: "lti-launch",
    area: "lti",
    detail: ok
      ? "LTI launch validation passed and trusted Moodle context was mapped."
      : "LTI launch validation failed one or more local checks.",
    eventType: ok ? "lti-launch" : "lti-validation-failure",
    relatedId: input.state ?? undefined,
    severity: ok ? "info" : "warning",
    source: "api/lti/launch"
  });

  return {
    checks,
    claims,
    embedUrl,
    ok,
    stateRecord,
    trustedContext
  };
}

export function createTestLtiIdToken(input: {
  clientId: string;
  deploymentId: string;
  issuer: string;
  nonce: string;
  role?: MoodleRole;
}) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: input.clientId,
    exp: now + 600,
    iat: now,
    iss: input.issuer,
    nonce: input.nonce,
    sub: "local-lti-test-user",
    "https://purl.imsglobal.org/spec/lti/claim/context": {
      id: "FYEC100",
      label: "FYEC100",
      title: "FYEC100 First Year Experience"
    },
    "https://purl.imsglobal.org/spec/lti/claim/deployment_id":
      input.deploymentId,
    "https://purl.imsglobal.org/spec/lti/claim/message_type":
      LTI_MESSAGE_TYPE,
    "https://purl.imsglobal.org/spec/lti/claim/roles": [
      roleToLtiRole(input.role ?? "student")
    ],
    "https://purl.imsglobal.org/spec/lti/claim/target_link_uri":
      `${process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:4100"}/embed`
  };

  return [
    base64Url(JSON.stringify({ alg: "none", typ: "JWT" })),
    base64Url(JSON.stringify(payload)),
    "local-test-signature"
  ].join(".");
}

function buildAuthorizationUrl({
  loginHint,
  ltiMessageHint,
  stateRecord
}: {
  loginHint?: string | null;
  ltiMessageHint?: string | null;
  stateRecord: LtiLaunchState;
}) {
  const authUrl = process.env.LTI_PLATFORM_AUTH_URL;

  if (!authUrl) {
    return "";
  }

  const params = new URLSearchParams({
    client_id: stateRecord.clientId,
    login_hint: loginHint || "",
    nonce: stateRecord.nonce,
    prompt: "none",
    redirect_uri: stateRecord.returnUrl,
    response_mode: "form_post",
    response_type: "id_token",
    scope: "openid",
    state: stateRecord.state
  });

  if (ltiMessageHint) {
    params.set("lti_message_hint", ltiMessageHint);
  }

  return `${authUrl}?${params.toString()}`;
}

function decodeJwtPayload(idToken?: string | null) {
  const payload = idToken?.split(".")[1];

  if (!payload) {
    return {};
  }

  try {
    return JSON.parse(Buffer.from(toBase64(payload), "base64").toString("utf8")) as Record<
      string,
      unknown
    >;
  } catch {
    return {};
  }
}

function mapClaimsToContext(claims: Record<string, unknown>) {
  const context = claims[
    "https://purl.imsglobal.org/spec/lti/claim/context"
  ] as { id?: string; label?: string; title?: string } | undefined;
  const roles =
    (claims["https://purl.imsglobal.org/spec/lti/claim/roles"] as string[]) ??
    [];

  return normalizeMoodleLaunchContext({
    courseId: context?.id || context?.label || "FYEC100",
    courseShortName: context?.label || "FYEC100",
    launchSource: "lti",
    role: ltiRolesToLocalRole(roles)
  });
}

function check(
  passed: boolean,
  label: string,
  message: string
): LtiValidationResult["checks"][number] {
  return {
    label,
    message,
    status: passed ? "pass" : "fail"
  };
}

function checkMatch(
  actual: unknown,
  expected: unknown,
  label: string
): LtiValidationResult["checks"][number] {
  const expectedText = String(expected ?? "");
  const actualText = String(actual ?? "");

  return {
    label,
    message: expectedText
      ? `Expected ${expectedText}; received ${actualText || "empty"}.`
      : "Expected value is not configured.",
    status: expectedText && actualText === expectedText ? "pass" : "fail"
  };
}

function checkAudience(actual: unknown, expected: unknown) {
  const expectedText = String(expected ?? "");
  const values = Array.isArray(actual) ? actual.map(String) : [String(actual ?? "")];

  return {
    label: "Audience / client ID",
    message: expectedText
      ? `Expected ${expectedText}; received ${values.join(", ") || "empty"}.`
      : "Expected client ID is not configured.",
    status: expectedText && values.includes(expectedText) ? "pass" : "fail"
  } satisfies LtiValidationResult["checks"][number];
}

function ltiRolesToLocalRole(roles: string[]): MoodleRole {
  const text = roles.join(" ").toLowerCase();

  if (/instructor|teacher|lecturer/.test(text)) {
    return "lecturer";
  }

  if (/administrator|manager|support/.test(text)) {
    return "lms-admin";
  }

  return "student";
}

function roleToLtiRole(role: MoodleRole) {
  if (role === "lecturer") {
    return "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor";
  }

  if (role === "lms-admin") {
    return "http://purl.imsglobal.org/vocab/lis/v2/membership#Administrator";
  }

  return "http://purl.imsglobal.org/vocab/lis/v2/membership#Learner";
}

function base64Url(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function toBase64(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  return base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
}
