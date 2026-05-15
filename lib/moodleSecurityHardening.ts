type HardeningStatus = "pass" | "watch" | "fail";

type SecurityCheck = {
  label: string;
  message: string;
  owner: string;
  status: HardeningStatus;
};

type ConfigExample = {
  label: string;
  text: string;
};

export function buildMoodleSecurityHardening() {
  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:4100";
  const moodleOrigin = process.env.MOODLE_ORIGIN ?? "";
  const originAssessment = assessMoodleOrigin(moodleOrigin);
  const appUrlAssessment = assessAppBaseUrl(appBaseUrl);
  const expectedFrameAncestors = moodleOrigin
    ? `frame-ancestors 'self' ${moodleOrigin};`
    : "frame-ancestors header is not generated until MOODLE_ORIGIN is configured.";
  const checks: SecurityCheck[] = [
    {
      label: "Moodle origin configured",
      message: originAssessment.message,
      owner: "LMS Administrator / System Administrator",
      status: originAssessment.status
    },
    {
      label: "Assistant hosted URL",
      message: appUrlAssessment.message,
      owner: "System Administrator",
      status: appUrlAssessment.status
    },
    {
      label: "Frame ancestors header",
      message: moodleOrigin
        ? `Expected Content-Security-Policy value: ${expectedFrameAncestors}`
        : "Configure MOODLE_ORIGIN, rebuild, and redeploy before expecting frame-ancestors headers.",
      owner: "Technical Lead",
      status: moodleOrigin ? "pass" : "watch"
    },
    {
      label: "Rebuild requirement",
      message:
        "Next.js applies headers from next.config.mjs at build time. Rebuild and redeploy after changing MOODLE_ORIGIN.",
      owner: "Developer / System Administrator",
      status: "watch"
    },
    {
      label: "Admin route exposure",
      message:
        "Keep /admin and /api/admin/* behind ADMIN_ACCESS_TOKEN and platform controls during hosted pilots.",
      owner: "Technical Lead / System Administrator",
      status: process.env.ADMIN_ACCESS_TOKEN ? "pass" : "watch"
    },
    {
      label: "Pilot context trust",
      message:
        "Query-string course and role context is pilot-only. Do not treat it as authenticated Moodle identity.",
      owner: "Technical Lead / LMS Administrator",
      status: "watch"
    }
  ];
  const summary = {
    fail: checks.filter((check) => check.status === "fail").length,
    pass: checks.filter((check) => check.status === "pass").length,
    watch: checks.filter((check) => check.status === "watch").length
  };

  return {
    appBaseUrl,
    checks,
    configExamples: buildConfigExamples(appBaseUrl),
    exportPath: "/api/admin/moodle-security-hardening.md",
    generatedAt: new Date().toISOString(),
    headerBehavior: {
      appliedRoutes: ["/embed", "/api/:path*"],
      expectedFrameAncestors,
      note:
        "next.config.mjs adds X-Content-Type-Options and Referrer-Policy for embed and API routes. Content-Security-Policy is added only when MOODLE_ORIGIN is set."
    },
    moodleOrigin: moodleOrigin || null,
    originAssessment,
    statusMessage:
      summary.fail > 0
        ? "Moodle security hardening has blocking issues to resolve."
        : summary.watch > 0
          ? "Moodle security hardening is drafted with watch items before hosted pilot use."
          : "Moodle security hardening checks are passing.",
    summary,
    verificationSteps: [
      "Set MOODLE_ORIGIN to the approved Moodle HTTPS origin, not a full course URL.",
      "Set NEXT_PUBLIC_APP_BASE_URL to the hosted assistant HTTPS URL.",
      "Run npm run build after changing MOODLE_ORIGIN.",
      "Deploy or restart the hosted app.",
      "Run PILOT_BASE_URL=<hosted-url> MOODLE_ORIGIN=<moodle-origin> npm run smoke:pilot.",
      "Confirm /embed response headers include Content-Security-Policy with frame-ancestors.",
      "Test the iframe inside the controlled FYEC100 Moodle pilot course."
    ]
  };
}

export function renderMoodleSecurityHardeningMarkdown() {
  const pack = buildMoodleSecurityHardening();

  return [
    "# FYEC100 Moodle Security Hardening Pack",
    "",
    `Generated: ${new Date(pack.generatedAt).toLocaleString()}`,
    "",
    "## Summary",
    "",
    `- Pass: ${pack.summary.pass}`,
    `- Watch: ${pack.summary.watch}`,
    `- Fail: ${pack.summary.fail}`,
    `- App base URL: ${pack.appBaseUrl}`,
    `- Moodle origin: ${pack.moodleOrigin ?? "Not configured"}`,
    "",
    "## Header Behavior",
    "",
    `- Applied routes: ${pack.headerBehavior.appliedRoutes.join(", ")}`,
    `- Expected frame ancestors: ${pack.headerBehavior.expectedFrameAncestors}`,
    `- Note: ${pack.headerBehavior.note}`,
    "",
    "## Security Checks",
    "",
    ...pack.checks.map(
      (check) =>
        `- [${check.status}] ${check.label} (${check.owner}): ${check.message}`
    ),
    "",
    "## Configuration Examples",
    "",
    ...pack.configExamples.flatMap((example) => [
      `### ${example.label}`,
      "",
      "```bash",
      example.text,
      "```",
      ""
    ]),
    "## Verification Steps",
    "",
    ...pack.verificationSteps.map((step, index) => `${index + 1}. ${step}`),
    "",
    "## Trust Boundary",
    "",
    "This hardening pack supports a controlled Phase 2 Moodle iframe pilot. Production should use approved authentication, Moodle-side validation, or LTI 1.3 for trusted role and course context.",
    ""
  ].join("\n");
}

function assessMoodleOrigin(value: string) {
  if (!value) {
    return {
      message:
        "MOODLE_ORIGIN is not configured. The app will not emit a frame-ancestors Moodle allowlist header.",
      status: "watch" as const
    };
  }

  if (!value.startsWith("https://")) {
    return {
      message:
        "MOODLE_ORIGIN should use the approved HTTPS Moodle origin before hosted pilot use.",
      status: "watch" as const
    };
  }

  if (hasPath(value)) {
    return {
      message:
        "MOODLE_ORIGIN appears to include a path. Use only the origin, for example https://moodle.costaatt.edu.tt.",
      status: "fail" as const
    };
  }

  return {
    message: `MOODLE_ORIGIN is configured as ${value}.`,
    status: "pass" as const
  };
}

function assessAppBaseUrl(value: string) {
  if (/(localhost|127\.0\.0\.1|0\.0\.0\.0)/i.test(value)) {
    return {
      message:
        "NEXT_PUBLIC_APP_BASE_URL is still local. Use the hosted assistant HTTPS URL before Moodle pilot embedding.",
      status: "watch" as const
    };
  }

  if (!value.startsWith("https://")) {
    return {
      message: "Hosted assistant URL should use HTTPS.",
      status: "watch" as const
    };
  }

  return {
    message: `Assistant base URL is configured as ${value}.`,
    status: "pass" as const
  };
}

function buildConfigExamples(appBaseUrl: string): ConfigExample[] {
  return [
    {
      label: "Local development",
      text: [
        "NEXT_PUBLIC_APP_BASE_URL=http://localhost:4100",
        "MOODLE_ORIGIN=",
        "# Leave MOODLE_ORIGIN blank locally unless you are testing hosted-style headers."
      ].join("\n")
    },
    {
      label: "Hosted Moodle pilot",
      text: [
        "NEXT_PUBLIC_APP_BASE_URL=https://fyec100-assistant.example.edu",
        "MOODLE_ORIGIN=https://moodle.costaatt.edu.tt",
        "ADMIN_ACCESS_TOKEN=replace_with_secure_random_value"
      ].join("\n")
    },
    {
      label: "Header verification",
      text: [
        `curl -I ${appBaseUrl}/embed`,
        "# Look for: Content-Security-Policy: frame-ancestors 'self' <MOODLE_ORIGIN>;"
      ].join("\n")
    }
  ];
}

function hasPath(value: string) {
  try {
    const url = new URL(value);

    return url.pathname !== "/";
  } catch {
    return false;
  }
}
