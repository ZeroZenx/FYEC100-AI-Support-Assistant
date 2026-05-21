import { getAdminAuthStatus } from "@/lib/adminAuth";
import { inspectAdminSessionToken } from "@/lib/adminSession";
import { getProviderStatus } from "@/lib/aiProvider";
import { buildAuditLayer } from "@/lib/auditEvents";
import { getDeploymentReadiness } from "@/lib/deploymentReadiness";
import { buildEvaluationAutomationLayer } from "@/lib/evaluationAutomation";
import {
  metric,
  recordCard,
  renderHtmlReport,
  table
} from "@/lib/htmlReport";
import { buildOperationsLayer } from "@/lib/institutionalLayers";
import { getKnowledgeBaseApplyChecklist } from "@/lib/knowledgeBaseApplyChecklist";
import { getKnowledgeBaseDraftUpdates } from "@/lib/knowledgeBaseDraftUpdates";
import { getKnowledgeBaseReleases } from "@/lib/knowledgeBaseReleases";
import { getLtiReadiness } from "@/lib/ltiReadiness";
import { buildPilotOutcomesLayer } from "@/lib/outcomesOperationsLayers";
import {
  buildKnowledgeBasePublishingLayer,
  buildServiceDeskLayer,
  buildStudentExperienceLayer
} from "@/lib/productionLayers";
import {
  buildIisReverseProxyPack,
  buildWindowsServicePack,
  buildWindowsVmReadiness
} from "@/lib/readinessLayers";
import { getStorageProviderStatus } from "@/lib/storageProvider";

export type PhaseRecord = {
  detail: string;
  label: string;
  owner: string;
  status: string;
};

export async function buildAdminSecurityLayer(sessionToken?: string | null) {
  const [audit, deployment] = await Promise.all([
    buildAuditLayer(),
    getDeploymentReadiness()
  ]);
  const auth = getAdminAuthStatus();
  const session = inspectAdminSessionToken(sessionToken);

  return {
    auditEvents: [
      item("Admin session events", "Technical Lead / Governance", "ready", "The session API records successful and failed local admin session attempts."),
      item("Denied route events", "Technical Lead", "planned", "Production middleware should record denied protected-route access attempts."),
      item("Sensitive report views", "Governance", "planned", "Production report views should be auditable when role-based access is active."),
      ...audit.auditViewer.slice(0, 3)
    ],
    generatedAt: new Date().toISOString(),
    metrics: {
      adminToken: auth.configured ? "Configured" : "Missing",
      session: session.active ? "Active" : "Inactive",
      auditEvents: audit.metrics.events,
      deploymentWarnings: deployment.summary.warn,
      protectedRouteClasses: 8,
      targetRoles: 7
    },
    navigation: [
      item("Sponsor", "Project Sponsor", "review", "Sponsor command center, decisions, benefits, risks, closeout, and sign-off."),
      item("LMS Administrator", "LMS Administrator", "review", "Moodle config, LTI diagnostics, iframe checks, course placement, and launch evidence."),
      item("Lecturer", "Lecturer", "review", "KB changes, student needs, integrity events, evaluation, and intervention brief."),
      item("IT/System Administrator", "System Administrator", "review", "Deployment, Windows VM, IIS proxy, storage, service, monitoring, and rollback."),
      item("Governance Reviewer", "Governance", "review", "Privacy, retention, audit events, provider policy, auth model, and evaluation evidence."),
      item("Developer", "Developer", "ready", "APIs, provider checks, smoke tests, logs, storage adapters, and technical diagnostics.")
    ],
    reviewDashboard: [
      item("Pilot admin token", "Technical Lead", auth.configured ? "ready" : "review", auth.configured ? "ADMIN_ACCESS_TOKEN is configured." : "Set ADMIN_ACCESS_TOKEN before hosted admin access."),
      item("Local admin session", "Technical Lead", session.active ? "ready" : "watch", session.reason),
      item("Protected routes", "Governance / Technical Lead", "review", "Admin and report routes remain pilot-token/session controlled until production SSO/LTI role access is approved."),
      item("Open auth risk", "Project Sponsor / IT", "review", "Production should not rely on shared pilot tokens as the long-term access model."),
      item("Environment readiness", "System Administrator", deployment.summary.fail ? "blocked" : "review", `${deployment.summary.warn} warning(s), ${deployment.summary.fail} failure(s).`)
    ],
    sessionAccess: [
      item("Session creation API", "Developer", "ready", "POST /api/admin/session with the pilot admin token to create a local signed admin session cookie."),
      item("Session inspection", "Developer", session.active ? "ready" : "watch", "GET /api/admin/session reports whether the current request has an active local admin session."),
      item("Session expiry", "Technical Lead", "ready", "Local admin sessions expire after 8 hours."),
      item("Production target", "IT / Governance", "review", "Replace local session/token access with approved SSO, reverse-proxy auth, or trusted Moodle/LTI admin roles.")
    ]
  };
}

export async function buildDeploymentAutomationLayer() {
  const [vm, iis, service] = await Promise.all([
    buildWindowsVmReadiness(),
    buildIisReverseProxyPack(),
    buildWindowsServicePack()
  ]);
  const scripts = vm.requiredWindowsScripts.map((script) =>
    item(script.path, "System Administrator / Developer", script.exists ? "ready" : "missing", script.exists ? `${script.sizeBytes} byte(s) present.` : "Required Windows deployment script is missing.")
  );

  return {
    commandCenter: [
      item("Expected app path", "System Administrator", "ready", vm.expectedAppPath),
      item("Expected port", "System Administrator", "ready", String(vm.expectedPort)),
      item("Build commands", "Developer / System Administrator", "ready", vm.buildCommands.join(" && ")),
      item("Start commands", "System Administrator", "ready", vm.startCommands.join(" && ")),
      item("Smoke command", "Developer / System Administrator", "ready", vm.smokeCommand),
      item("Deployment warnings", "Project Lead", vm.currentDeploymentWarnings.length ? "review" : "ready", `${vm.currentDeploymentWarnings.length} warning(s) require review.`)
    ],
    generatedAt: new Date().toISOString(),
    iisChecklist: [
      item("Proxy target", "System Administrator", "ready", iis.proxyTarget),
      item("HTTPS termination", "System Administrator", "review", "Terminate HTTPS at IIS or approved reverse proxy before Moodle testing."),
      item("Forwarded headers", "System Administrator", "review", iis.headers.join("; ")),
      item("Moodle iframe behavior", "LMS Administrator", "review", iis.moodleChecks.join(" ")),
      item("Rollback path", "Project Lead / System Administrator", "ready", iis.rollback.join(" "))
    ],
    metrics: {
      scriptsPresent: scripts.filter((script) => script.status === "ready").length,
      scriptsRequired: scripts.length,
      deploymentWarnings: vm.currentDeploymentWarnings.length,
      port: vm.expectedPort,
      proxyTarget: iis.proxyTarget,
      restartOptions: 2
    },
    restartRunbook: [
      item("NSSM restart", "System Administrator", "review", "Use scripts\\windows\\manage-fyec100-service.ps1 -Action restart after deployment."),
      item("PM2 restart", "System Administrator", "review", "Use PM2 only if approved, then restart the named FYEC100 assistant process."),
      item("Manual start", "Developer / System Administrator", "ready", service.manualCommands.join(" && ")),
      item("Log inspection", "System Administrator", "review", service.logPaths.join("; ")),
      item("Post-restart smoke", "Developer / System Administrator", "ready", "Run the hosted smoke test before restoring Moodle access.")
    ],
    scripts
  };
}

export async function buildMonitoringAlertingLayer() {
  const [operations, evaluation, storage] = await Promise.all([
    buildOperationsLayer(),
    buildEvaluationAutomationLayer(),
    getStorageProviderStatus()
  ]);

  return {
    alertRules: [
      item("Repeated launch failures", "LMS Administrator / Developer", operations.metrics.ltiWarnings ? "review" : "ready", "Alert when LTI warnings or validation failures repeat during a pilot window."),
      item("Provider unavailable", "Technical Lead", "review", "Alert when provider tests fail or chat falls back repeatedly."),
      item("Audit write failure", "System Administrator", "review", "Alert if audit events cannot be written to the configured store."),
      item("High unresolved support cases", "Project Lead", operations.metrics.serviceCases ? "review" : "ready", "Alert when support cases remain unresolved before teaching sessions."),
      item("Evaluation regression", "Lecturer / Governance", evaluation.summary.failed ? "review" : "ready", "Alert when evaluation runs produce failed safety or quality checks.")
    ],
    commandDashboard: operations.healthDashboard,
    generatedAt: new Date().toISOString(),
    incidentTimeline: [
      ...operations.incidentCapture,
      item("Storage status", "System Administrator", "ready", `${storage.collections.length} storage collection(s) visible through the storage provider interface.`)
    ],
    metrics: {
      healthWarnings: operations.metrics.healthWarnings,
      serviceCases: operations.metrics.serviceCases,
      ltiWarnings: operations.metrics.ltiWarnings,
      auditEvents: operations.metrics.auditEvents,
      storageCollections: storage.collections.length,
      evaluationPassRate: `${evaluation.summary.passRate}%`
    },
    runbookLinks: [
      item("Restart service", "System Administrator", "ready", "/service-restart-runbook"),
      item("Check IIS proxy", "System Administrator", "ready", "/iis-proxy-verification"),
      item("Verify Moodle config", "LMS Administrator", "ready", "/moodle-platform-config"),
      item("Run evaluation", "Lecturer / Developer", "ready", "/evaluation-runner"),
      item("Export evidence", "Project Lead", "ready", "/reports")
    ]
  };
}

export async function buildRoleCommandCenterLayer() {
  const [operations, outcomes, serviceDesk, evaluation, deployment] = await Promise.all([
    buildOperationsLayer(),
    buildPilotOutcomesLayer(),
    buildServiceDeskLayer(),
    buildEvaluationAutomationLayer(),
    getDeploymentReadiness()
  ]);

  const roles = {
    developer: [
      item("Route and API checks", "Developer", "ready", "Use smoke tests, provider checks, evaluation runner, and diagnostics APIs."),
      item("Technical issues", "Developer", serviceDesk.metrics.activeCases ? "review" : "ready", `${serviceDesk.metrics.activeCases} support case(s) may need technical review.`)
    ],
    governance: [
      item("Privacy and retention", "Governance Reviewer", "review", "Review storage, audit, provider, and closeout evidence before scale."),
      item("Evaluation safety", "Governance Reviewer", evaluation.summary.failed ? "review" : "ready", `${evaluation.summary.failed} failed automated evaluation check(s).`)
    ],
    it: [
      item("System health", "System Administrator", operations.metrics.healthWarnings ? "review" : "ready", `${operations.metrics.healthWarnings} health warning(s).`),
      item("Deployment readiness", "System Administrator", deployment.summary.fail ? "blocked" : "review", `${deployment.summary.warn} warning(s), ${deployment.summary.fail} failure(s).`)
    ],
    lecturer: [
      item("Student needs", "Lecturer", "review", outcomes.successInsights[0]?.detail ?? "Review student themes as pilot records grow."),
      item("Academic integrity", "Lecturer", outcomes.metrics.integrityEvents ? "review" : "ready", `${outcomes.metrics.integrityEvents} integrity event(s).`)
    ],
    lmsAdmin: [
      item("Moodle/LTI readiness", "LMS Administrator", operations.metrics.ltiWarnings ? "review" : "ready", `${operations.metrics.ltiWarnings} LTI warning(s).`),
      item("Moodle placement", "LMS Administrator", "review", "Use the Moodle course experience and placement checklists.")
    ],
    projectLead: [
      item("Active blockers", "Project Lead", serviceDesk.metrics.activeCases ? "review" : "ready", `${serviceDesk.metrics.activeCases} active support case(s).`),
      item("Next actions", "Project Lead", "review", "Coordinate deployment, support, content, evaluation, and sponsor sign-off.")
    ],
    sponsor: [
      item("Pilot status", "Project Sponsor", "review", outcomes.closeout.decisionRecommendation),
      item("Scale decision", "Project Sponsor", "review", outcomes.closeout.nextPhaseRecommendation)
    ]
  };

  return {
    generatedAt: new Date().toISOString(),
    metrics: {
      roles: Object.keys(roles).length,
      activeCases: serviceDesk.metrics.activeCases,
      readinessWarnings: deployment.summary.warn,
      evaluationPassRate: `${evaluation.summary.passRate}%`,
      feedback: outcomes.metrics.totalFeedback,
      launches: outcomes.metrics.launches
    },
    roles
  };
}

export async function buildContentReleaseControlLayer() {
  const [publishing, drafts, checklist, releases] = await Promise.all([
    buildKnowledgeBasePublishingLayer(),
    getKnowledgeBaseDraftUpdates(),
    getKnowledgeBaseApplyChecklist(),
    getKnowledgeBaseReleases()
  ]);

  return {
    approvalGate: publishing.publishGate,
    diffViewer: publishing.diffViewer,
    draftWorkspace: drafts.record.drafts.map((draft) =>
      item(draft.title, draft.owner, draft.status, `${draft.knowledgeBaseSection}: ${draft.draftWording || draft.rationale}`)
    ),
    generatedAt: new Date().toISOString(),
    metrics: {
      drafts: drafts.record.drafts.length,
      approvedDrafts: publishing.metrics.approvedDrafts,
      publishReady: publishing.metrics.publishReady,
      releaseNotes: releases.summary.total,
      checklistSteps: checklist.record.steps.length,
      rollbackSnapshot: publishing.metrics.rollbackSnapshot
    },
    preview: [
      item("Future KB preview", "Lecturer / Developer", "review", publishing.preview),
      item("Live replacement rule", "Developer", "review", "Replace the live Markdown only after reviewer, release note, guardrail, fallback, and smoke evidence are present.")
    ],
    rollback: [
      item("Snapshot before publish", "Developer", "planned", "Save a restorable copy of data/fyec100-knowledge-base.md before applying approved changes."),
      item("Rollback evidence", "Technical Lead", "planned", "Record commit hash, reviewer, release note, and smoke result with the snapshot."),
      item("Release notes", "Lecturer / Project Lead", releases.summary.total ? "ready" : "watch", `${releases.summary.total} release note record(s).`)
    ]
  };
}

export async function buildStudentSuccessInterventionLayer() {
  const [student, outcomes, serviceDesk] = await Promise.all([
    buildStudentExperienceLayer(),
    buildPilotOutcomesLayer(),
    buildServiceDeskLayer()
  ]);

  return {
    actionBrief: [
      ...outcomes.successInsights,
      item("Suggested lecturer announcement", "Lecturer", "review", "Clarify common FYEC100 expectations, Moodle navigation, responsible AI boundaries, and where students should ask for human help.")
    ],
    generatedAt: new Date().toISOString(),
    interventions: student.interventionRecommendations,
    metrics: {
      feedbackRecords: student.metrics.feedbackRecords,
      helpful: student.metrics.helpful,
      missingInfo: student.metrics.missingInfo,
      lmsIssues: student.metrics.lmsIssues,
      supportCases: serviceDesk.metrics.activeCases,
      contentGaps: outcomes.metrics.knowledgeBaseGaps
    },
    needs: outcomes.dashboard,
    supportContentLoop: [
      item("Repeated support case", "Project Lead", serviceDesk.metrics.activeCases ? "review" : "ready", "Repeated cases should be reviewed for Moodle announcements or KB updates."),
      item("Content gap to draft", "Lecturer / Developer", outcomes.metrics.knowledgeBaseGaps ? "review" : "ready", "Confirmed FYEC100 gaps should move into the KB draft workspace."),
      item("Human-led only", "Lecturer / LMS Administrator", "review", "Keep grades, policy decisions, personal student issues, and unclear assignment interpretation with human staff.")
    ]
  };
}

export async function buildPilotCloseoutScaleLayer() {
  const [outcomes, deployment, evaluation, provider, lti] = await Promise.all([
    buildPilotOutcomesLayer(),
    getDeploymentReadiness(),
    buildEvaluationAutomationLayer(),
    Promise.resolve(getProviderStatus()),
    Promise.resolve(getLtiReadiness())
  ]);
  const blockers = [
    deployment.summary.fail > 0 ? "Deployment readiness has blocking failures." : "",
    evaluation.summary.failed > 0 ? "Evaluation automation has failed checks." : "",
    lti.summary.warnings > 0 ? "LTI configuration still has warnings." : "",
    !provider.configured ? "AI provider configuration needs review." : ""
  ].filter(Boolean);
  const recommendation = blockers.length
    ? "Revise before scale"
    : "Proceed to a larger controlled pilot after formal sign-off";

  return {
    closeout: [
      item("What was tested", "Project Lead", "ready", outcomes.closeout.tested.join(" ")),
      item("What worked", "Project Lead / Lecturer", "review", outcomes.closeout.worked.join(" ")),
      item("Needs improvement", "Pilot Review Team", "review", outcomes.closeout.needsImprovement.join(" ")),
      item("Risks found", "Governance / Technical Lead", outcomes.closeout.risksFound.length ? "review" : "ready", outcomes.closeout.risksFound.join(" ") || "No active risk records beyond normal pilot review.")
    ],
    generatedAt: new Date().toISOString(),
    metrics: {
      feedback: outcomes.metrics.totalFeedback,
      launches: outcomes.metrics.launches,
      helpfulRate: outcomes.metrics.helpfulRate,
      deploymentWarnings: deployment.summary.warn,
      evaluationPassRate: `${evaluation.summary.passRate}%`,
      blockers: blockers.length
    },
    scaleDecision: [
      item("Decision recommendation", "Project Sponsor", blockers.length ? "review" : "ready", recommendation),
      item("Blockers", "Project Lead", blockers.length ? "review" : "ready", blockers.join(" ") || "No blocking items detected by the current automated checks."),
      item("Next phase", "Project Sponsor / IT", "review", "Confirm Moodle test launch, production auth, storage approval, monitoring, and support ownership before scale.")
    ]
  };
}

export async function verifyWindowsScripts() {
  const vm = await buildWindowsVmReadiness();
  return vm.requiredWindowsScripts.map((script) =>
    item(script.path, "System Administrator / Developer", script.exists ? "ready" : "missing", script.exists ? `${script.sizeBytes} byte(s) present.` : "Required Windows deployment script is missing.")
  );
}

export async function renderAdminSecurityHtml() {
  const layer = await buildAdminSecurityLayer();
  return html("FYEC100 Production Admin Security Pack", "Admin session access, role-aware navigation, admin access audit events, security review status, and production auth risks.", layer.generatedAt, [
    ["Admin Session Access", metrics(layer.metrics) + cards(layer.sessionAccess)],
    ["Role-Aware Admin Navigation", cards(layer.navigation)],
    ["Admin Access Audit Events", cards(layer.auditEvents)],
    ["Security Review Dashboard", cards(layer.reviewDashboard)]
  ]);
}

export async function renderDeploymentEvidenceHtml() {
  const layer = await buildDeploymentAutomationLayer();
  return html("FYEC100 Production Deployment Automation Pack", "Windows VM deployment command center, script verification, IIS proxy checks, restart runbook, smoke commands, and evidence for IT.", layer.generatedAt, [
    ["Deployment Command Center", metrics(layer.metrics) + cards(layer.commandCenter)],
    ["Windows Script Verification", cards(layer.scripts)],
    ["IIS Proxy Verification Checklist", cards(layer.iisChecklist)],
    ["Service Restart Runbook", cards(layer.restartRunbook)]
  ]);
}

export async function renderOperationsPackHtml() {
  const layer = await buildMonitoringAlertingLayer();
  return html("FYEC100 Operational Monitoring and Alerting Pack", "Operations dashboard, incident timeline, alert rules, runbook action links, and weekly IT review evidence.", layer.generatedAt, [
    ["Operations Command Dashboard", metrics(layer.metrics) + cards(layer.commandDashboard)],
    ["Incident Timeline", cards(layer.incidentTimeline)],
    ["Alert Rules Workspace", cards(layer.alertRules)],
    ["Runbook Action Links", cards(layer.runbookLinks)]
  ]);
}

export async function renderRoleCommandCenterHtml() {
  const layer = await buildRoleCommandCenterLayer();
  return html("FYEC100 Role-Based Command Center Pack", "Focused command-center views for sponsor, project lead, LMS admin, lecturer, IT, governance, and developer roles.", layer.generatedAt, [
    ["Role Command Center Summary", metrics(layer.metrics)],
    ["Sponsor View", cards(layer.roles.sponsor)],
    ["Project Lead View", cards(layer.roles.projectLead)],
    ["LMS Admin View", cards(layer.roles.lmsAdmin)],
    ["Lecturer View", cards(layer.roles.lecturer)],
    ["IT/System Admin View", cards(layer.roles.it)],
    ["Governance View", cards(layer.roles.governance)],
    ["Developer View", cards(layer.roles.developer)]
  ]);
}

export async function renderKbReleaseControlHtml() {
  const layer = await buildContentReleaseControlLayer();
  return html("FYEC100 Content Publishing and Release Control Pack", "Knowledge base drafts, section diff review, approval gate, publish preview, rollback snapshot, and release note evidence.", layer.generatedAt, [
    ["Knowledge Base Draft Workspace", metrics(layer.metrics) + cards(layer.draftWorkspace)],
    ["Section-Level Diff Viewer", cards(layer.diffViewer)],
    ["Review and Approval Gate", cards(layer.approvalGate)],
    ["Publish Preview", cards(layer.preview)],
    ["Rollback Snapshot", cards(layer.rollback)]
  ]);
}

export async function renderStudentSuccessPackHtml() {
  const layer = await buildStudentSuccessInterventionLayer();
  return html("FYEC100 Student Success and Intervention Pack", "Student needs dashboard, intervention recommendations, lecturer action brief, support-to-content loop, and sponsor evidence.", layer.generatedAt, [
    ["Student Needs Dashboard", metrics(layer.metrics) + cards(layer.needs)],
    ["Intervention Recommendation Workspace", cards(layer.interventions)],
    ["Lecturer Action Brief", cards(layer.actionBrief)],
    ["Support-to-Content Loop", cards(layer.supportContentLoop)]
  ]);
}

export async function renderPilotCloseoutScaleHtml() {
  const layer = await buildPilotCloseoutScaleLayer();
  return html("FYEC100 Pilot Closeout and Scale Decision Pack", "Pilot closeout, improvement items, risks, automated readiness signals, blockers, and recommendation for scale decisions.", layer.generatedAt, [
    ["Scale Decision Dashboard", metrics(layer.metrics) + cards(layer.scaleDecision)],
    ["Pilot Closeout Evidence", cards(layer.closeout)]
  ]);
}

function item(label: string, owner: string, status: string, detail: string): PhaseRecord {
  return { detail, label, owner, status };
}

function cards(items: PhaseRecord[]) {
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

export function tableRecords(items: PhaseRecord[]) {
  return table(["Status", "Item", "Owner", "Detail"], items.map((entry) => [entry.status, entry.label, entry.owner, entry.detail]));
}
