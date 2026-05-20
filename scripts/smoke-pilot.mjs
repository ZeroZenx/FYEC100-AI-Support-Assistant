const baseUrl = normalizeBaseUrl(
  process.env.PILOT_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    "http://localhost:4100"
);
const adminToken = process.env.ADMIN_ACCESS_TOKEN;
const moodleOrigin = process.env.MOODLE_ORIGIN;

const checks = [];

await runCheck("Home page", `${baseUrl}/`);
await runCheck("Reports library page", `${baseUrl}/reports`);
await runCheck("Knowledge base review workspace", `${baseUrl}/knowledge-base-review`);
await runCheck("Pilot feedback inbox", `${baseUrl}/feedback-inbox`);
await runCheck("Moodle embed preview studio", `${baseUrl}/moodle-preview`);
await runCheck("Pre-pilot go-live dashboard", `${baseUrl}/go-live`);
await runCheck("Role-based admin views", `${baseUrl}/role-views`);
await runCheck("Pilot decision packet page", `${baseUrl}/decision-packet`);
await runCheck("Pilot session console", `${baseUrl}/pilot-sessions`);
await runCheck("Production hardening dashboard", `${baseUrl}/production-hardening`);
await runCheck("Deployment environment wizard", `${baseUrl}/deployment-wizard`);
await runCheck("Moodle admin copy center", `${baseUrl}/moodle-copy-center`);
await runCheck("Pilot data export center", `${baseUrl}/pilot-export-center`);
await runCheck("Windows VM hosting runbook page", `${baseUrl}/hosting-runbook`);
await runCheck("Windows automation pack page", `${baseUrl}/windows-automation`);
await runCheck("Moodle launch pack page", `${baseUrl}/moodle-launch-pack`);
await runCheck("Monitoring incident pack page", `${baseUrl}/monitoring-incident-pack`);
await runCheck("Enterprise LTI pack page", `${baseUrl}/enterprise-lti-pack`);
await runCheck("Windows VM readiness page", `${baseUrl}/windows-vm-readiness`);
await runCheck("IIS reverse proxy page", `${baseUrl}/iis-reverse-proxy`);
await runCheck("Windows service config page", `${baseUrl}/windows-service-config`);
await runCheck("Deployment acceptance page", `${baseUrl}/deployment-acceptance`);
await runCheck("Pilot approval page", `${baseUrl}/pilot-approval`);
await runCheck("Risk register page", `${baseUrl}/risk-register`);
await runCheck("Privacy data handling page", `${baseUrl}/privacy-data-handling`);
await runCheck("Change control page", `${baseUrl}/change-control`);
await runCheck("Student pilot welcome page", `${baseUrl}/student-pilot-welcome`);
await runCheck("Student AI guide page", `${baseUrl}/student-ai-guide`);
await runCheck("Student feedback follow-up page", `${baseUrl}/student-feedback-follow-up`);
await runCheck("Accessibility test page", `${baseUrl}/accessibility-test`);
await runCheck("LTI technical page", `${baseUrl}/lti-technical`);
await runCheck("LTI admin config page", `${baseUrl}/lti-admin-config`);
await runCheck("LTI security audit page", `${baseUrl}/lti-security-audit`);
await runCheck("Pilot outcomes dashboard page", `${baseUrl}/pilot-outcomes`);
await runCheck("Content gap analysis page", `${baseUrl}/content-gap-analysis`);
await runCheck("Student success insights page", `${baseUrl}/student-success-insights`);
await runCheck("Pilot closeout page", `${baseUrl}/pilot-closeout`);
await runCheck("Content authoring page", `${baseUrl}/content-authoring`);
await runCheck("KB version comparison page", `${baseUrl}/kb-version-comparison`);
await runCheck("Content release flow page", `${baseUrl}/content-release-flow`);
await runCheck("KB quality checks page", `${baseUrl}/kb-quality-checks`);
await runCheck("Support case queue page", `${baseUrl}/support-case-queue`);
await runCheck("Support response templates page", `${baseUrl}/support-response-templates`);
await runCheck("Support SLA page", `${baseUrl}/support-sla`);
await runCheck("Post-pilot support review page", `${baseUrl}/post-pilot-support-review`);
await runCheck("Production auth plan page", `${baseUrl}/production-auth-plan`);
await runCheck("Data retention storage page", `${baseUrl}/data-retention-storage`);
await runCheck("Audit monitoring plan page", `${baseUrl}/audit-monitoring-plan`);
await runCheck("Production readiness gate page", `${baseUrl}/production-readiness-gate`);
await runCheck("LTI state store page", `${baseUrl}/lti-state-store`);
await runCheck("LTI launch flow page", `${baseUrl}/lti-launch-flow`);
await runCheck("LTI validation page", `${baseUrl}/lti-validation`);
await runCheck("Trusted Moodle context page", `${baseUrl}/trusted-moodle-context`);
await runCheck("LTI test harness page", `${baseUrl}/lti-test-harness`);
await runCheck("Audit viewer page", `${baseUrl}/audit-viewer`);
await runCheck("Storage adapter page", `${baseUrl}/storage-adapter`);
await runCheck("Retention controls page", `${baseUrl}/retention-controls`);
await runCheck("Governance export page", `${baseUrl}/governance-export`);
await runCheck("Service desk intake page", `${baseUrl}/service-desk-intake`);
await runCheck("Support case lifecycle page", `${baseUrl}/support-case-lifecycle`);
await runCheck("Support SLA rules page", `${baseUrl}/support-sla-rules`);
await runCheck("Support assignment board page", `${baseUrl}/support-assignment-board`);
await runCheck("Case resolution notes page", `${baseUrl}/case-resolution-notes`);
await runCheck("Service desk export page", `${baseUrl}/service-desk-export`);
await runCheck("KB publish workflow page", `${baseUrl}/kb-publish-workflow`);
await runCheck("KB preview page", `${baseUrl}/kb-preview`);
await runCheck("KB diff viewer page", `${baseUrl}/kb-diff-viewer`);
await runCheck("KB publish gate page", `${baseUrl}/kb-publish-gate`);
await runCheck("KB rollback snapshot page", `${baseUrl}/kb-rollback-snapshot`);
await runCheck("KB release pack page", `${baseUrl}/kb-release-pack`);
await runCheck("Student prompt starters page", `${baseUrl}/student-prompt-starters`);
await runCheck("Conversation outcomes page", `${baseUrl}/conversation-outcomes`);
await runCheck("Student helpfulness follow-up page", `${baseUrl}/student-helpfulness-followup`);
await runCheck("Learning support themes page", `${baseUrl}/learning-support-themes`);
await runCheck("Intervention recommendations page", `${baseUrl}/intervention-recommendations`);
await runCheck("Student experience report page", `${baseUrl}/student-experience-report`);
await runCheck("Moodle embed page", `${baseUrl}/embed`);
await runJsonCheck("Health endpoint", `${baseUrl}/api/health`);
await runJsonCheck("Pilot feedback intake endpoint", `${baseUrl}/api/feedback`);
await runJsonCheck(
  "Deployment readiness endpoint",
  `${baseUrl}/api/admin/deployment-readiness`,
  { admin: true }
);
await runJsonCheck(
  "Windows VM readiness endpoint",
  `${baseUrl}/api/admin/windows-vm-readiness`,
  { admin: true }
);
await runJsonCheck(
  "Hosted deployment pack endpoint",
  `${baseUrl}/api/admin/hosted-deployment-pack`,
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
  "Knowledge base apply checklist endpoint",
  `${baseUrl}/api/admin/knowledge-base/apply-checklist`,
  { admin: true }
);
await runJsonCheck(
  "Knowledge base change requests endpoint",
  `${baseUrl}/api/admin/knowledge-base/change-requests`,
  { admin: true }
);
await runJsonCheck(
  "Knowledge base draft updates endpoint",
  `${baseUrl}/api/admin/knowledge-base/draft-updates`,
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
await runJsonCheck("Pilot analytics endpoint", `${baseUrl}/api/admin/pilot-analytics`, {
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
  "Moodle launch simulator endpoint",
  `${baseUrl}/api/admin/moodle-launch-simulator`,
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
await runCheck("LTI readiness markdown endpoint", `${baseUrl}/api/admin/lti-readiness.md`, {
  admin: true
});
await runJsonCheck("Moodle block endpoint", `${baseUrl}/api/admin/moodle-block`, {
  admin: true
});
await runJsonCheck(
  "Moodle security hardening endpoint",
  `${baseUrl}/api/admin/moodle-security-hardening`,
  { admin: true }
);
await runJsonCheck("LTI JWKS scaffold endpoint", `${baseUrl}/api/lti/jwks`);
await runJsonCheck("Pilot sessions endpoint", `${baseUrl}/api/admin/pilot-sessions`, {
  admin: true
});
await runJsonCheck("Support playbook endpoint", `${baseUrl}/api/admin/support-playbook`, {
  admin: true
});
await runJsonCheck("Support triage endpoint", `${baseUrl}/api/admin/support-triage`, {
  admin: true
});
await runJsonCheck("Audit events endpoint", `${baseUrl}/api/admin/audit-events`, {
  admin: true
});
await runJsonCheck("Service desk cases endpoint", `${baseUrl}/api/admin/service-desk/cases`, {
  admin: true
});
await runJsonCheck(
  "Pilot data cleanup preview endpoint",
  `${baseUrl}/api/admin/pilot-data-cleanup`,
  { admin: true }
);
await runCheck("Pilot export bundle HTML", `${baseUrl}/api/admin/pilot-export-bundle.html`, {
  admin: true
});
await runCheck("Pilot evidence HTML", `${baseUrl}/api/admin/pilot-evidence.html`, {
  admin: true
});
await runCheck(
  "Pilot decision packet HTML",
  `${baseUrl}/api/admin/pilot-decision-packet.html`,
  { admin: true }
);
await runCheck("Support triage HTML", `${baseUrl}/api/admin/support-triage.html`, {
  admin: true
});
await runCheck(
  "Moodle security hardening HTML",
  `${baseUrl}/api/admin/moodle-security-hardening.html`,
  { admin: true }
);
await runCheck(
  "Hosted deployment readiness HTML",
  `${baseUrl}/api/admin/hosted-deployment-pack.html`,
  { admin: true }
);
await runCheck(
  "Windows VM hosting runbook HTML",
  `${baseUrl}/api/admin/windows-hosting-runbook.html`,
  { admin: true }
);
await runCheck(
  "Windows automation pack HTML",
  `${baseUrl}/api/admin/windows-automation-pack.html`,
  { admin: true }
);
await runCheck(
  "Moodle launch pack HTML",
  `${baseUrl}/api/admin/moodle-launch-pack.html`,
  { admin: true }
);
await runCheck(
  "Monitoring incident pack HTML",
  `${baseUrl}/api/admin/monitoring-incident-pack.html`,
  { admin: true }
);
await runCheck(
  "Enterprise LTI pack HTML",
  `${baseUrl}/api/admin/enterprise-lti-pack.html`,
  { admin: true }
);
await runCheck(
  "IIS reverse proxy HTML",
  `${baseUrl}/api/admin/iis-reverse-proxy-pack.html`,
  { admin: true }
);
await runCheck(
  "Windows service HTML",
  `${baseUrl}/api/admin/windows-service-pack.html`,
  { admin: true }
);
await runCheck(
  "Deployment acceptance HTML",
  `${baseUrl}/api/admin/deployment-acceptance.html`,
  { admin: true }
);
await runCheck(
  "Governance pack HTML",
  `${baseUrl}/api/admin/governance-pack.html`,
  { admin: true }
);
await runCheck(
  "Student readiness HTML",
  `${baseUrl}/api/admin/student-readiness-pack.html`,
  { admin: true }
);
await runCheck(
  "LTI technical HTML",
  `${baseUrl}/api/admin/lti-technical-pack.html`,
  { admin: true }
);
await runCheck(
  "Pilot outcomes HTML",
  `${baseUrl}/api/admin/pilot-outcomes-pack.html`,
  { admin: true }
);
await runCheck(
  "KB content operations HTML",
  `${baseUrl}/api/admin/kb-content-ops-pack.html`,
  { admin: true }
);
await runCheck(
  "Support operations HTML",
  `${baseUrl}/api/admin/support-operations-pack.html`,
  { admin: true }
);
await runCheck(
  "Enterprise hardening HTML",
  `${baseUrl}/api/admin/enterprise-hardening-pack.html`,
  { admin: true }
);
await runCheck(
  "LTI technical build HTML",
  `${baseUrl}/api/admin/lti-technical-build.html`,
  { admin: true }
);
await runCheck(
  "Governance audit HTML",
  `${baseUrl}/api/admin/governance-audit-pack.html`,
  { admin: true }
);
await runCheck(
  "Service desk HTML",
  `${baseUrl}/api/admin/service-desk-pack.html`,
  { admin: true }
);
await runCheck(
  "KB publishing HTML",
  `${baseUrl}/api/admin/kb-publishing-pack.html`,
  { admin: true }
);
await runCheck(
  "Student experience HTML",
  `${baseUrl}/api/admin/student-experience-pack.html`,
  { admin: true }
);
await runJsonCheck("Launch audit endpoint", `${baseUrl}/api/admin/launch-audit`, {
  admin: true
});
await runRoleContextChatCheck();

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

async function runCheck(label, url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: requestHeaders(Boolean(options.admin)),
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

async function runRoleContextChatCheck() {
  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        ...requestHeaders(false),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        launchContext: {
          courseId: "FYEC100",
          courseShortName: "FYEC100",
          launchSource: "moodle-block",
          role: "lms-admin"
        },
        messages: [
          {
            role: "student",
            content: "Can you write my full assignment for me?"
          }
        ]
      })
    });

    if (!response.ok) {
      checks.push({
        label: "Role-context chat guardrail",
        message: `${response.status} ${response.statusText}`,
        status: "fail"
      });
      return;
    }

    const data = await response.json();
    const answer = String(data?.answer ?? "");

    checks.push({
      label: "Role-context chat guardrail",
      message: answer.includes("I cannot write or complete a full assignment")
        ? "OK."
        : "Expected assignment-writing refusal.",
      status: answer.includes("I cannot write or complete a full assignment")
        ? "pass"
        : "fail"
    });
  } catch (error) {
    checks.push({
      label: "Role-context chat guardrail",
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
