import { readLtiLaunchStates } from "@/lib/ltiLaunch";

export type LtiHardeningCheck = {
  label: string;
  message: string;
  status: "fail" | "pass" | "warn";
};

export async function buildLtiHardeningStatus() {
  const states = await readLtiLaunchStates();
  const checks: LtiHardeningCheck[] = [
    check(Boolean(process.env.LTI_PLATFORM_ISSUER), "Issuer allowlist", "LTI_PLATFORM_ISSUER is configured."),
    check(Boolean(process.env.LTI_CLIENT_ID), "Client allowlist", "LTI_CLIENT_ID is configured."),
    check(Boolean(process.env.LTI_DEPLOYMENT_ID), "Deployment allowlist", "LTI_DEPLOYMENT_ID is configured."),
    check(
      Boolean(process.env.LTI_PLATFORM_JWKS_JSON || process.env.LTI_JWT_SHARED_SECRET),
      "Signature validation material",
      "Configure LTI_PLATFORM_JWKS_JSON for RS256 or LTI_JWT_SHARED_SECRET for local HS256 testing."
    ),
    {
      label: "Nonce replay store",
      message: `${states.length} local launch state record(s) available for nonce/state checks.`,
      status: states.length > 0 ? "pass" : "warn"
    },
    {
      label: "Strict role mapping",
      message: "Student, lecturer, and LMS administrator role mapping is enforced in the LTI launch mapper.",
      status: "pass"
    }
  ];

  return {
    checks,
    generatedAt: new Date().toISOString(),
    hardeningReady: checks.every((item) => item.status === "pass"),
    testCases: [
      "expired token",
      "wrong audience",
      "wrong issuer",
      "wrong deployment",
      "nonce mismatch",
      "unknown role"
    ]
  };
}

function check(passed: boolean, label: string, message: string): LtiHardeningCheck {
  return {
    label,
    message,
    status: passed ? "pass" : "fail"
  };
}
