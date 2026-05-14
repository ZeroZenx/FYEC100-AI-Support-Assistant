export type LtiReadinessCheck = {
  label: string;
  message: string;
  status: "pass" | "warn";
};

const requiredPlatformVariables = [
  "LTI_PLATFORM_ISSUER",
  "LTI_CLIENT_ID",
  "LTI_DEPLOYMENT_ID",
  "LTI_PLATFORM_AUTH_URL",
  "LTI_PLATFORM_TOKEN_URL",
  "LTI_PLATFORM_JWKS_URL"
];

export function getLtiReadiness() {
  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:4100";
  const toolEndpoints = {
    jwksUrl: `${appBaseUrl}/api/lti/jwks`,
    launchUrl: `${appBaseUrl}/api/lti/launch`,
    loginUrl: `${appBaseUrl}/api/lti/login`,
    redirectUris: [`${appBaseUrl}/api/lti/launch`],
    toolUrl: `${appBaseUrl}/api/lti/launch`
  };
  const platform = {
    authorizationUrl: process.env.LTI_PLATFORM_AUTH_URL ?? "",
    clientId: process.env.LTI_CLIENT_ID ?? "",
    deploymentId: process.env.LTI_DEPLOYMENT_ID ?? "",
    issuer: process.env.LTI_PLATFORM_ISSUER ?? "",
    jwksUrl: process.env.LTI_PLATFORM_JWKS_URL ?? "",
    tokenUrl: process.env.LTI_PLATFORM_TOKEN_URL ?? ""
  };
  const checks: LtiReadinessCheck[] = [
    checkHttps(appBaseUrl),
    ...requiredPlatformVariables.map(checkEnvironmentVariable),
    {
      label: "Launch validation",
      message:
        "OIDC login, state/nonce handling, ID token validation, and role mapping are not implemented yet.",
      status: "warn"
    },
    {
      label: "JWKS signing keys",
      message:
        "The scaffold exposes a JWKS endpoint, but production signing keys are not generated or rotated yet.",
      status: "warn"
    }
  ];

  const summary = {
    configured: checks.filter((check) => check.status === "pass").length,
    warnings: checks.filter((check) => check.status === "warn").length
  };

  return {
    checks,
    platform,
    requiredPlatformVariables,
    summary,
    toolEndpoints,
    trustBoundary:
      "This is an LTI 1.3 readiness scaffold only. It does not validate OIDC launches, JWT signatures, Moodle roles, or student identity.",
    workflow: [
      "Register the assistant as an external tool in a Moodle test environment.",
      "Capture Moodle platform values: issuer, client ID, deployment ID, authorization URL, token URL, and JWKS URL.",
      "Configure those values as environment variables in the assistant app.",
      "Implement OIDC login, state and nonce storage, ID token validation, and role mapping before trusting launch context.",
      "Run privacy, cybersecurity, and LMS administrator review before production use."
    ]
  };
}

function checkEnvironmentVariable(name: string): LtiReadinessCheck {
  const configured = Boolean(process.env[name]);

  return {
    label: name,
    message: configured
      ? `${name} is configured.`
      : `${name} is not configured yet.`,
    status: configured ? "pass" : "warn"
  };
}

function checkHttps(appBaseUrl: string): LtiReadinessCheck {
  const isHttps = appBaseUrl.startsWith("https://");

  return {
    label: "LTI HTTPS base URL",
    message: isHttps
      ? "The public app base URL uses HTTPS."
      : "LTI 1.3 testing should use an HTTPS hosted URL, not localhost.",
    status: isHttps ? "pass" : "warn"
  };
}
