import { getAdminAuthStatus } from "@/lib/adminAuth";
import { buildAuditLayer } from "@/lib/auditEvents";
import {
  buildEvaluationAutomationLayer,
  runEvaluationDataset
} from "@/lib/evaluationAutomation";
import {
  metric,
  recordCard,
  renderHtmlReport,
  table
} from "@/lib/htmlReport";
import { readLtiLaunchStates } from "@/lib/ltiLaunch";
import { getLtiReadiness } from "@/lib/ltiReadiness";
import { getPilotModeStatus } from "@/lib/pilotMode";
import {
  getStorageProviderStatus,
  productionAdapterScaffold,
  storageProviderContract
} from "@/lib/storageProvider";

export type LayerRecord = {
  detail: string;
  label: string;
  owner: string;
  status: string;
};

export async function buildMoodleTestConnectionLayer() {
  const [states, audit] = await Promise.all([readLtiLaunchStates(), buildAuditLayer()]);
  const lti = getLtiReadiness();
  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:4100";
  const latest = states[0];
  const platform = lti.platform;
  const platformItems = [
    ["Issuer", platform.issuer],
    ["Client ID", platform.clientId],
    ["Deployment ID", platform.deploymentId],
    ["Auth URL", platform.authorizationUrl],
    ["Token URL", platform.tokenUrl],
    ["JWKS URL", platform.jwksUrl],
    ["Redirect URI", lti.toolEndpoints.launchUrl],
    ["Tool URL", lti.toolEndpoints.toolUrl]
  ];

  return {
    diagnostics: [
      item("Missing state", "Developer / LMS Administrator", "ready", "Moodle did not return state, or the launch did not start at /api/lti/login."),
      item("Expired state", "Developer", "ready", "Local LTI state expires after 10 minutes and must be regenerated."),
      item("Issuer mismatch", "LMS Administrator", "review", "Moodle issuer must match LTI_PLATFORM_ISSUER or the generated launch state."),
      item("Audience mismatch", "LMS Administrator", "review", "Moodle client ID must match LTI_CLIENT_ID."),
      item("Nonce mismatch", "Developer", "review", "Returned nonce must match the stored launch nonce."),
      item("Deployment mismatch", "LMS Administrator", "review", "Moodle deployment ID must match LTI_DEPLOYMENT_ID."),
      item("Expired token", "LMS Administrator", "review", "Moodle ID token exp claim must be in the future."),
      item("Unsupported role", "Lecturer / LMS Administrator", "watch", "Roles should map to student, lecturer, or LMS administrator.")
    ],
    evidence: [
      item("Launch attempts", "Technical Lead", states.length > 0 ? "ready" : "watch", `${states.length} local launch state record(s).`),
      item("Validation failures", "Technical Lead", audit.metrics.ltiFailures > 0 ? "review" : "ready", `${audit.metrics.ltiFailures} LTI validation failure event(s).`),
      item("Next action", "LMS Administrator", "review", "Configure a Moodle test external tool and run a real launch.")
    ],
    generatedAt: new Date().toISOString(),
    metrics: {
      configuredValues: platformItems.filter(([, value]) => Boolean(value)).length,
      missingValues: platformItems.filter(([, value]) => !value).length,
      launchStates: states.length,
      ltiWarnings: lti.summary.warnings
    },
    platformConfig: platformItems.map(([label, value]) =>
      item(label, "LMS Administrator / Technical Lead", value ? "ready" : "missing", value || `${label} is not configured.`)
    ),
    registrationChecklist: [
      item("External tool", "LMS Administrator", "review", "Create FYEC100 Assistant as a Moodle external tool in a test environment."),
      item("Login initiation URL", "LMS Administrator", "ready", `${appBaseUrl}/api/lti/login`),
      item("Launch URL", "LMS Administrator", "ready", `${appBaseUrl}/api/lti/launch`),
      item("Redirect URI", "LMS Administrator", "ready", `${appBaseUrl}/api/lti/launch`),
      item("JWKS URL", "LMS Administrator", "ready", `${appBaseUrl}/api/lti/jwks`),
      item("Custom parameters", "Lecturer / LMS Administrator", "review", "Course context and placement values should be tested before live use."),
      item("Role settings", "LMS Administrator", "review", "Confirm learner, instructor, and admin roles map as expected."),
      item("Course placement", "Lecturer / LMS Administrator", "review", "Place first in FYEC100 test shell, not a live course.")
    ],
    trustedPreview: [
      item("Course ID", "LMS Administrator", latest ? "ready" : "watch", latest?.targetLinkUri.includes("FYEC100") ? "FYEC100" : "Pending validated launch."),
      item("Moodle role", "LMS Administrator", "watch", "Role appears after a valid LTI launch POST maps trusted claims."),
      item("Launch source", "Developer", latest ? "ready" : "watch", latest ? "lti" : "Pending launch."),
      item("Deployment ID", "LMS Administrator", latest?.deploymentId ? "ready" : "missing", latest?.deploymentId || "Not configured."),
      item("Validation status", "Technical Lead", audit.metrics.ltiFailures > 0 ? "review" : "watch", audit.metrics.ltiLaunches > 0 ? "Launch activity recorded." : "No successful validation event yet.")
    ]
  };
}

export function buildAuthAuthorizationLayer() {
  const auth = getAdminAuthStatus();
  const pilotMode = getPilotModeStatus();

  return {
    accessUpgrade: [
      item("Pilot token", "Technical Lead", auth.configured ? "ready" : "review", "Current ADMIN_ACCESS_TOKEN remains acceptable for controlled local/admin pilot use only."),
      item("Trusted Moodle/LTI roles", "LMS Administrator / Developer", "review", "Use validated LTI roles for Moodle-origin requests after test-site validation."),
      item("Institutional SSO", "IT / Governance", "planned", "Evaluate SSO or reverse-proxy authentication for production admin pages."),
      item("Key/session rotation", "System Administrator", "review", "Define token rotation, session timeout, and service account rules.")
    ],
    generatedAt: new Date().toISOString(),
    metrics: {
      adminToken: auth.configured ? "Configured" : "Missing",
      pilotMode: pilotMode.mode,
      roles: 8,
      routeClasses: 8
    },
    navigation: [
      item("Sponsor", "Project Sponsor", "review", "Sponsor dashboard, decision log, benefits, risks, milestone timeline."),
      item("LMS admin", "LMS Administrator", "review", "Moodle config, LTI diagnostics, course placement, iframe and launch tools."),
      item("Lecturer", "Lecturer", "review", "Content review, AI quality, student experience, integrity guidance."),
      item("IT/System admin", "System Administrator", "review", "Operations, storage, Windows VM, alerts, deployment, rollback."),
      item("Governance", "Governance Reviewer", "review", "Privacy, retention, audit, provider policy, evaluation evidence.")
    ],
    requestInspector: [
      item("Source", "Technical Lead", "ready", "Inspects admin token, pilot mode, environment, and future trusted LTI role."),
      item("Access decision", "Technical Lead", "review", "Explains whether a request is allowed, blocked, or pilot-only."),
      item("Current mode", "Project Lead", pilotMode.isPilot ? "ready" : "watch", pilotMode.summary)
    ],
    roleMatrix: [
      item("Student", "Lecturer / LMS Administrator", "student-facing", "Chat/embed, student guide, feedback follow-up."),
      item("Lecturer", "Project Lead", "staff", "Content, integrity, student themes, evaluation review."),
      item("LMS admin", "Project Lead", "staff", "Moodle placement, LTI config, launch diagnostics."),
      item("Project lead", "Project Sponsor", "admin", "Reports, approvals, support queue, decisions, milestones."),
      item("Developer", "Technical Lead", "technical", "Diagnostics, build checks, evaluation, route review."),
      item("System administrator", "Technical Lead", "technical", "Windows VM, service, proxy, storage, operations."),
      item("Governance reviewer", "Project Sponsor", "governance", "Audit, privacy, retention, provider policy."),
      item("Sponsor", "Project Sponsor", "sponsor", "Executive dashboard, sign-off, benefits, risks.")
    ],
    routePolicy: [
      item("Public", "Project Lead", "ready", "/",),
      item("Student-facing", "Lecturer", "ready", "/chat, /student-ai-guide, /student-pilot-welcome"),
      item("Moodle embedded", "LMS Administrator", "ready", "/embed"),
      item("Admin-only", "Technical Lead", "review", "/admin, /api/admin/*"),
      item("Governance-only", "Governance Reviewer", "review", "Privacy, retention, audit, provider governance."),
      item("Sponsor-only", "Project Sponsor", "review", "Sponsor dashboard, decision log, sign-off."),
      item("Technical-only", "Technical Lead", "review", "LTI diagnostics, storage, operations, provider tests."),
      item("Pilot-only", "Project Lead", "review", "Local JSONL tools until production auth/storage are approved.")
    ]
  };
}

export async function buildProductionStorageLayer() {
  const storage = await getStorageProviderStatus();

  return {
    contract: storageProviderContract,
    generatedAt: new Date().toISOString(),
    localAdapter: storage.collections.map((entry) =>
      item(entry.collection, "Developer", entry.present ? "ready" : "watch", `${entry.path} / ${entry.sizeBytes} byte(s).`)
    ),
    metrics: {
      adapter: storage.adapter,
      collections: storage.collections.length,
      present: storage.collections.filter((entry) => entry.present).length,
      productionTargets: storage.collections.filter((entry) => entry.target === "production-approved-store").length
    },
    migrationReadiness: storage.collections.map((entry) =>
      item(entry.collection, "IT / Governance", entry.target === "production-approved-store" ? "review" : "ready", `${entry.target}: ${entry.path}`)
    ),
    productionAdapter: productionAdapterScaffold.map((step) =>
      item("Production adapter scaffold", "Technical Lead / IT", "planned", step)
    ),
    retentionPlan: [
      item("Retention windows", "Governance Reviewer", "review", "Define retention by feedback, audit, launch, service desk, and evaluation records."),
      item("Export before delete", "Project Lead", "ready", "Export evidence packs before cleanup or migration."),
      item("Cleanup approvals", "Governance / Project Sponsor", "review", "Require approval before deleting pilot records."),
      item("Anonymization", "Governance Reviewer", "review", "Avoid student IDs and sensitive records in stored pilot data."),
      item("Deletion audit events", "Technical Lead", "planned", "Record deletion actions in the audit store.")
    ]
  };
}

export async function buildEvaluationLayer() {
  return buildEvaluationAutomationLayer();
}

export async function renderMoodleTestEvidenceHtml() {
  const layer = await buildMoodleTestConnectionLayer();
  return html("FYEC100 Moodle Test Environment Evidence Pack", "Moodle platform values, registration checklist, launch diagnostics, trusted context preview, and next actions for LMS/IT review.", layer.generatedAt, [
    ["Moodle Platform Config Workspace", metrics(layer.metrics) + cards(layer.platformConfig)],
    ["LTI Registration Checklist", cards(layer.registrationChecklist)],
    ["Launch Diagnostics Viewer", cards(layer.diagnostics)],
    ["Trusted Launch Session Preview", cards(layer.trustedPreview)],
    ["Moodle Test Evidence", cards(layer.evidence)]
  ]);
}

export async function renderAuthGovernanceHtml() {
  const layer = buildAuthAuthorizationLayer();
  return html("FYEC100 Authentication and Authorization Governance Pack", "Role authorization, route policy, request context, admin access upgrade, and role-based navigation guidance.", layer.generatedAt, [
    ["Role Authorization Matrix", metrics(layer.metrics) + cards(layer.roleMatrix)],
    ["Route Protection Policy", cards(layer.routePolicy)],
    ["Request Context Inspector", cards(layer.requestInspector)],
    ["Admin Access Upgrade Plan", cards(layer.accessUpgrade)],
    ["Role-Based Navigation", cards(layer.navigation)]
  ]);
}

export async function renderStorageOperationsHtml() {
  const layer = await buildProductionStorageLayer();
  return html("FYEC100 Production Storage Operations Pack", "Storage provider interface, local adapter, production scaffold, migration readiness, and retention enforcement planning.", layer.generatedAt, [
    ["Storage Provider Interface", metrics(layer.metrics) + listTable(layer.contract)],
    ["Local File Adapter", cards(layer.localAdapter)],
    ["Production Adapter Scaffold", cards(layer.productionAdapter)],
    ["Storage Migration Readiness", cards(layer.migrationReadiness)],
    ["Retention Policy Enforcement", cards(layer.retentionPlan)]
  ]);
}

export async function renderEvaluationEvidenceHtml() {
  const layer = await buildEvaluationLayer();
  return html("FYEC100 Evaluation Automation Evidence Pack", "Evaluation dataset, automated guardrail checks, result storage, dashboard summary, and evidence for academic review.", layer.generatedAt, [
    ["Evaluation Dataset", metrics(layer.metrics) + table(["ID", "Category", "Risk", "Expected Behavior"], layer.dataset.prompts.map((prompt) => [prompt.id, prompt.category, prompt.riskLevel, prompt.expectedBehavior]))],
    ["Automated Guardrail Checks", listTable(layer.automatedChecks)],
    ["Evaluation Results Dashboard", table(["Metric", "Value"], Object.entries(layer.summary))],
    ["Recommended Remediation", listTable(layer.recommendations)]
  ]);
}

export { runEvaluationDataset };

function item(label: string, owner: string, status: string, detail: string): LayerRecord {
  return { detail, label, owner, status };
}

function cards(items: LayerRecord[]) {
  return `<div class="record-grid">${items
    .map((record) =>
      recordCard({
        label: record.label,
        meta: record.owner,
        status: record.status,
        text: record.detail
      })
    )
    .join("")}</div>`;
}

function metrics(values: Record<string, number | string>) {
  return `<div class="metric-grid">${Object.entries(values)
    .map(([label, value]) => metric(label, value, "current"))
    .join("")}</div>`;
}

function listTable(items: string[]) {
  return table(["Item"], items.map((entry) => [entry]));
}

function html(title: string, lede: string, generatedAt: string, sections: Array<[string, string]>) {
  return renderHtmlReport({
    generatedAt,
    lede,
    title,
    sections: sections.map(([sectionTitle, body], index) => ({
      body,
      id: `section-${index + 1}`,
      title: sectionTitle
    }))
  });
}
