const baseUrl = normalizeBaseUrl(
  process.env.PILOT_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    "http://localhost:4100"
);
const adminToken = process.env.ADMIN_ACCESS_TOKEN;
const moodleOrigin = process.env.MOODLE_ORIGIN;

const checks = [];

await runCheck("Home page", `${baseUrl}/`);
await runCheck("Moodle embed page", `${baseUrl}/embed`);
await runJsonCheck("Health endpoint", `${baseUrl}/api/health`);
await runJsonCheck("Pilot feedback intake endpoint", `${baseUrl}/api/feedback`);
await runJsonCheck(
  "Deployment readiness endpoint",
  `${baseUrl}/api/admin/deployment-readiness`,
  { admin: true }
);
await runJsonCheck("Admin actions endpoint", `${baseUrl}/api/admin/actions`, {
  admin: true
});
await runJsonCheck(
  "Knowledge base review endpoint",
  `${baseUrl}/api/admin/knowledge-base/review`,
  { admin: true }
);
await runJsonCheck(
  "Knowledge base change requests endpoint",
  `${baseUrl}/api/admin/knowledge-base/change-requests`,
  { admin: true }
);
await runJsonCheck(
  "Knowledge base releases endpoint",
  `${baseUrl}/api/admin/knowledge-base/releases`,
  { admin: true }
);
await runJsonCheck(
  "Integration decision endpoint",
  `${baseUrl}/api/admin/integration-decision`,
  { admin: true }
);
await runJsonCheck("Pilot evidence endpoint", `${baseUrl}/api/admin/pilot-evidence`, {
  admin: true
});
await runJsonCheck("Pilot sign-off endpoint", `${baseUrl}/api/admin/pilot-signoff`, {
  admin: true
});
await runJsonCheck(
  "Pilot meeting pack endpoint",
  `${baseUrl}/api/admin/pilot-meeting-pack`,
  { admin: true }
);
await runJsonCheck(
  "Pilot operations runbook endpoint",
  `${baseUrl}/api/admin/pilot-operations-runbook`,
  { admin: true }
);
await runJsonCheck(
  "Moodle pilot config endpoint",
  `${baseUrl}/api/admin/moodle-pilot-config`,
  { admin: true }
);
await runJsonCheck(
  "Accessibility usability endpoint",
  `${baseUrl}/api/admin/accessibility-usability`,
  { admin: true }
);
await runJsonCheck("LTI readiness endpoint", `${baseUrl}/api/admin/lti-readiness`, {
  admin: true
});
await runJsonCheck("Moodle block endpoint", `${baseUrl}/api/admin/moodle-block`, {
  admin: true
});
await runJsonCheck("LTI JWKS scaffold endpoint", `${baseUrl}/api/lti/jwks`);
await runJsonCheck("Pilot sessions endpoint", `${baseUrl}/api/admin/pilot-sessions`, {
  admin: true
});
await runJsonCheck("Support playbook endpoint", `${baseUrl}/api/admin/support-playbook`, {
  admin: true
});
await runJsonCheck("Launch audit endpoint", `${baseUrl}/api/admin/launch-audit`, {
  admin: true
});

if (moodleOrigin) {
  await runHeaderCheck(
    "Moodle frame-ancestors header",
    `${baseUrl}/embed`,
    "content-security-policy",
    moodleOrigin
  );
} else {
  checks.push({
    label: "Moodle frame-ancestors header",
    message: "Skipped because MOODLE_ORIGIN is not configured.",
    status: "warn"
  });
}

printResults();

const failed = checks.some((check) => check.status === "fail");
process.exitCode = failed ? 1 : 0;

async function runCheck(label, url) {
  try {
    const response = await fetch(url, {
      headers: requestHeaders(false),
      redirect: "manual"
    });

    checks.push({
      label,
      message: `${response.status} ${response.statusText}`,
      status: response.ok ? "pass" : "fail"
    });
  } catch (error) {
    checks.push({
      label,
      message: getErrorMessage(error),
      status: "fail"
    });
  }
}

async function runJsonCheck(label, url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: requestHeaders(Boolean(options.admin))
    });
    const contentType = response.headers.get("content-type") ?? "";

    if (!response.ok) {
      checks.push({
        label,
        message: `${response.status} ${response.statusText}`,
        status: "fail"
      });
      return;
    }

    if (!contentType.includes("application/json")) {
      checks.push({
        label,
        message: `Expected JSON but received ${contentType || "unknown content type"}.`,
        status: "fail"
      });
      return;
    }

    const data = await response.json();
    const warningCount = data?.summary?.warn ?? data?.checks?.filter?.(
      (check) => check.status === "warning" || check.status === "warn"
    )?.length;

    checks.push({
      label,
      message:
        typeof warningCount === "number"
          ? `OK with ${warningCount} warning(s).`
          : "OK.",
      status: "pass"
    });
  } catch (error) {
    checks.push({
      label,
      message: getErrorMessage(error),
      status: "fail"
    });
  }
}

async function runHeaderCheck(label, url, headerName, expectedValue) {
  try {
    const response = await fetch(url, { headers: requestHeaders(false) });
    const headerValue = response.headers.get(headerName);

    checks.push({
      label,
      message: headerValue
        ? `${headerName}: ${headerValue}`
        : `${headerName} header not found.`,
      status: headerValue?.includes(expectedValue) ? "pass" : "fail"
    });
  } catch (error) {
    checks.push({
      label,
      message: getErrorMessage(error),
      status: "fail"
    });
  }
}

function requestHeaders(includeAdminToken) {
  if (!includeAdminToken || !adminToken) {
    return {};
  }

  return {
    "x-admin-token": adminToken
  };
}

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
}

function printResults() {
  console.log(`FYEC100 pilot smoke test`);
  console.log(`Base URL: ${baseUrl}`);
  console.log("");

  for (const check of checks) {
    const marker =
      check.status === "pass" ? "PASS" : check.status === "warn" ? "WARN" : "FAIL";
    console.log(`[${marker}] ${check.label}: ${check.message}`);
  }

  console.log("");
  console.log(
    `Summary: ${count("pass")} passed, ${count("warn")} warning(s), ${count(
      "fail"
    )} failed.`
  );
}

function count(status) {
  return checks.filter((check) => check.status === status).length;
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : "Unknown error";
}
