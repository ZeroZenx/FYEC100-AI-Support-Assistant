import { stat } from "fs/promises";
import path from "path";
import { getAdminActionRegister } from "@/lib/adminActions";
import { getAdminAuthStatus } from "@/lib/adminAuth";
import { getProviderStatus } from "@/lib/aiProvider";
import { getDeploymentReadiness } from "@/lib/deploymentReadiness";
import { buildHostedDeploymentPack } from "@/lib/hostedDeploymentPack";
import { buildPilotDataCleanupPreview } from "@/lib/pilotDataCleanup";
import { getPilotSignoffStatus } from "@/lib/pilotSignoff";
import { getKnowledgeBaseReviewStatus } from "@/lib/knowledgeBaseReview";
import { getAccessibilityUsabilityReview } from "@/lib/accessibilityUsabilityReview";
import { buildSupportTriage } from "@/lib/supportTriage";
import { getLtiReadiness } from "@/lib/ltiReadiness";
import {
  callout,
  codeBlock,
  list,
  metric,
  recordCard,
  renderHtmlReport,
  table
} from "@/lib/htmlReport";

export type LayerStatus = "blocked" | "ready" | "review" | "watch";

export type LayerItem = {
  category?: string;
  detail: string;
  label: string;
  owner: string;
  status: LayerStatus;
};

const WINDOWS_SCRIPTS = [
  {
    absolutePath: path.join(
      process.cwd(),
      "scripts",
      "windows",
      "fyec100-env.example.ps1"
    ),
    path: "scripts/windows/fyec100-env.example.ps1"
  },
  {
    absolutePath: path.join(
      process.cwd(),
      "scripts",
      "windows",
      "install-fyec100-service.ps1"
    ),
    path: "scripts/windows/install-fyec100-service.ps1"
  },
  {
    absolutePath: path.join(
      process.cwd(),
      "scripts",
      "windows",
      "manage-fyec100-service.ps1"
    ),
    path: "scripts/windows/manage-fyec100-service.ps1"
  },
  {
    absolutePath: path.join(
      process.cwd(),
      "scripts",
      "windows",
      "test-fyec100-preflight.ps1"
    ),
    path: "scripts/windows/test-fyec100-preflight.ps1"
  }
];

export async function buildWindowsVmReadiness() {
  const [readiness, hostedPack, scripts] = await Promise.all([
    getDeploymentReadiness(),
    buildHostedDeploymentPack(),
    Promise.all(WINDOWS_SCRIPTS.map(getScriptStatus))
  ]);
  const requiredEnvDocumented = [
    "NEXT_PUBLIC_APP_BASE_URL",
    "MOODLE_ORIGIN",
    "ADMIN_ACCESS_TOKEN",
    "PILOT_MODE",
    "AI_PROVIDER"
  ];

  return {
    buildCommands: ["npm install", "npm run build"],
    currentDeploymentWarnings: readiness.checks.filter(
      (check) => check.status !== "pass"
    ),
    expectedAppPath: "C:\\Apps\\FYEC100-AI-Support-Assistant",
    expectedPort: 4100,
    generatedAt: new Date().toISOString(),
    hostedPack,
    nextActions: [
      "Confirm the Windows VM hostname and HTTPS public URL.",
      "Set NEXT_PUBLIC_APP_BASE_URL to the public HTTPS URL.",
      "Set MOODLE_ORIGIN to the approved Moodle HTTPS origin.",
      "Configure ADMIN_ACCESS_TOKEN before exposing admin pages.",
      "Run scripts/windows/test-fyec100-preflight.ps1 on the VM.",
      "Run PILOT_BASE_URL=<hosted-url> npm run smoke:pilot after deployment."
    ],
    readiness,
    requiredEnvDocumented,
    requiredWindowsScripts: scripts,
    smokeCommand:
      "PILOT_BASE_URL=https://fyec100-assistant.example.edu npm run smoke:pilot",
    startCommands: ["set PORT=4100", "npm run start:pilot"]
  };
}

export async function buildIisReverseProxyPack() {
  const readiness = await getDeploymentReadiness();

  return {
    assumptions: [
      "IIS is used for HTTPS termination, or an approved reverse proxy sits in front of Node.js.",
      "Node.js listens only on localhost or a private VM interface.",
      "The public HTTPS URL forwards to http://127.0.0.1:4100.",
      "MOODLE_ORIGIN is configured and the app is rebuilt before Moodle iframe testing."
    ],
    generatedAt: new Date().toISOString(),
    headers: [
      "X-Forwarded-Proto: https",
      "X-Forwarded-Host: <public-host>",
      "Host: <public-host>",
      "Content-Security-Policy frame-ancestors should include Moodle when MOODLE_ORIGIN is set"
    ],
    moodleChecks: [
      "Open /embed directly from the public HTTPS URL.",
      "Open the iframe inside the controlled FYEC100 Moodle course shell.",
      "Confirm browser developer tools do not show frame blocking.",
      "Run smoke test with MOODLE_ORIGIN set.",
      "Confirm fallback link placement works if iframe is blocked."
    ],
    proxyTarget: "http://127.0.0.1:4100",
    readiness,
    rollback: [
      "Stop Moodle exposure by hiding the Moodle block/page/link.",
      "Stop or roll back the Windows service.",
      "Checkout the last approved Git commit.",
      "Run npm run build and restart the service.",
      "Run the hosted smoke test before restoring Moodle access."
    ],
    urlRewriteExample: [
      "<rule name=\"FYEC100 Assistant Reverse Proxy\" stopProcessing=\"true\">",
      "  <match url=\"(.*)\" />",
      "  <action type=\"Rewrite\" url=\"http://127.0.0.1:4100/{R:1}\" />",
      "</rule>"
    ].join("\n")
  };
}

export async function buildWindowsServicePack() {
  const readiness = await getDeploymentReadiness();

  return {
    generatedAt: new Date().toISOString(),
    logPaths: [
      "C:\\Logs\\FYEC100AIAssistant\\stdout.log",
      "C:\\Logs\\FYEC100AIAssistant\\stderr.log",
      "Windows Event Viewer for service wrapper events"
    ],
    manualCommands: [
      "npm run build",
      "set PORT=4100",
      "npm run start:pilot",
      "scripts\\windows\\manage-fyec100-service.ps1 -Action restart"
    ],
    nssm: [
      "Install NSSM from an approved internal/software source.",
      "Set application path to npm.cmd.",
      "Set arguments to run start:pilot.",
      "Set startup directory to the repository path.",
      "Configure stdout and stderr log files.",
      "Configure restart on failure according to IT policy."
    ],
    pm2: [
      "Install PM2 only if approved for the Windows VM.",
      "Use pm2 start npm --name FYEC100AIAssistant -- run start:pilot.",
      "Use pm2 save and approved startup integration.",
      "Confirm PM2 log retention and restart policy."
    ],
    readiness,
    restartPolicy: [
      "Restart on process failure after a short delay.",
      "Alert IT if repeated failures occur.",
      "Do not auto-restart during planned maintenance or rollback.",
      "Run smoke test after manual restart."
    ],
    serviceAccount:
      "Use a dedicated least-privilege Windows service account when available. The account needs read access to the app folder and write access only to approved log and pilot telemetry paths."
  };
}

export async function buildDeploymentAcceptanceChecklist() {
  const [
    readiness,
    provider,
    adminAuth,
    signoff,
    kbReview,
    accessibility,
    cleanup
  ] = await Promise.all([
    getDeploymentReadiness(),
    Promise.resolve(getProviderStatus()),
    Promise.resolve(getAdminAuthStatus()),
    getPilotSignoffStatus(),
    getKnowledgeBaseReviewStatus(),
    getAccessibilityUsabilityReview(),
    buildPilotDataCleanupPreview()
  ]);
  const items: LayerItem[] = [
    {
      detail: "Health endpoint responds through the hosted URL.",
      label: "App health check passes",
      owner: "System Administrator",
      status: readiness.summary.fail === 0 ? "ready" : "blocked"
    },
    {
      detail: readiness.appBaseUrl,
      label: "HTTPS URL confirmed",
      owner: "System Administrator",
      status: readiness.appBaseUrl.startsWith("https://") ? "ready" : "review"
    },
    {
      detail: readiness.moodleOrigin ?? "MOODLE_ORIGIN is not configured.",
      label: "Moodle origin configured",
      owner: "LMS Administrator",
      status: readiness.moodleOrigin ? "ready" : "review"
    },
    {
      detail: "Iframe must be confirmed inside the controlled FYEC100 Moodle shell.",
      label: "Iframe loads in Moodle",
      owner: "LMS Administrator",
      status: "review"
    },
    {
      detail: adminAuth.configured
        ? "ADMIN_ACCESS_TOKEN is configured."
        : "ADMIN_ACCESS_TOKEN is not configured.",
      label: "Admin token configured",
      owner: "Technical Lead",
      status: adminAuth.configured ? "ready" : "review"
    },
    {
      detail: `${provider.provider} / ${provider.model}`,
      label: "Provider test passes",
      owner: "Technical Lead",
      status: provider.configured ? "ready" : "review"
    },
    {
      detail: "Run the hosted smoke command and attach the result to the pilot record.",
      label: "Smoke test passes",
      owner: "Developer / System Administrator",
      status: "review"
    },
    {
      detail: "Rollback steps are documented in the Windows VM hosting runbook.",
      label: "Rollback tested",
      owner: "System Administrator",
      status: "review"
    },
    {
      detail: `${cleanup.summary.totalRecords} current pilot telemetry record(s) are exportable before cleanup.`,
      label: "Pilot artifacts exportable",
      owner: "Project Lead",
      status: "ready"
    },
    {
      detail: signoff.statusMessage,
      label: "Project sign-off recorded",
      owner: "Project Sponsor",
      status: signoff.approvedForControlledPilot ? "ready" : "review"
    },
    {
      detail: kbReview.statusMessage,
      label: "Knowledge base approved",
      owner: "Lecturer / Content Owner",
      status: kbReview.readyForPilot ? "ready" : "review"
    },
    {
      detail: accessibility.statusMessage,
      label: "Accessibility review approved",
      owner: "Developer / LMS Administrator",
      status: accessibility.readyForPilot ? "ready" : "review"
    }
  ];

  return {
    generatedAt: new Date().toISOString(),
    items,
    summary: countLayerStatuses(items)
  };
}

export async function buildPilotGovernanceLayer() {
  const [signoff, actions, kbReview, accessibility, support] = await Promise.all([
    getPilotSignoffStatus(),
    getAdminActionRegister(),
    getKnowledgeBaseReviewStatus(),
    getAccessibilityUsabilityReview(),
    buildSupportTriage()
  ]);
  const approvals: LayerItem[] = [
    {
      detail: signoff.statusMessage,
      label: "Project Sponsor",
      owner: "Kevin Ramsoobhag",
      status: signoff.approvedForControlledPilot ? "ready" : "review"
    },
    {
      detail: `${actions.openActions.length} open project action(s).`,
      label: "Project Lead",
      owner: "Darren Headley",
      status: actions.summary.blocked > 0 ? "blocked" : "review"
    },
    {
      detail: kbReview.statusMessage,
      label: "Lecturer / Content Owner",
      owner: kbReview.record.contentOwner,
      status: kbReview.readyForPilot ? "ready" : "review"
    },
    {
      detail: "Moodle placement, launch audit, and iframe behavior require LMS confirmation.",
      label: "LMS Administrator",
      owner: "Kester David",
      status: "review"
    },
    {
      detail: "Windows VM hosting, service, HTTPS, backups, and rollback require IT confirmation.",
      label: "System Administrator",
      owner: "Kevin Reece",
      status: "review"
    },
    {
      detail: "Application build, provider, smoke tests, and knowledge base workflow are maintained by the developer.",
      label: "Developer",
      owner: "Deborah Romero",
      status: "review"
    },
    {
      detail: accessibility.statusMessage,
      label: "Governance / Privacy Reviewer",
      owner: "Project Sponsor / Governance",
      status: accessibility.readyForPilot ? "ready" : "review"
    }
  ];
  const risks: LayerItem[] = [
    {
      category: "Technical",
      detail:
        "Hosted URL, admin token, Moodle origin, and service operation must be confirmed on the Windows VM before student testing.",
      label: "Hosted deployment not fully confirmed",
      owner: "System Administrator / Technical Lead",
      status: "review"
    },
    {
      category: "Moodle",
      detail:
        "Iframe/block pilot context is not authenticated identity. Production trust requires Moodle validation or LTI.",
      label: "Pilot context trust boundary",
      owner: "Technical Lead / LMS Administrator",
      status: "watch"
    },
    {
      category: "Academic Integrity",
      detail:
        "Students may try to use the assistant for full assignment writing. Guardrails and lecturer guidance must remain visible.",
      label: "Improper AI use",
      owner: "Lecturer / Project Sponsor",
      status: "watch"
    },
    {
      category: "Support",
      detail: `${support.summary.activeQueue} active support queue item(s), ${support.summary.highPriority} high priority.`,
      label: "Support queue follow-up",
      owner: "Pilot Review Team",
      status: support.summary.highPriority > 0 ? "blocked" : "ready"
    }
  ];

  return {
    approvals,
    changeLog: [
      "Knowledge base changes are tracked through change requests, draft updates, apply checklist, and release notes.",
      "Application changes are committed to GitHub and summarized in README/roadmap updates.",
      "Moodle placement changes should be recorded by LMS administrator before student launch.",
      "Environment changes should be recorded before rebuild and deployment.",
      "Release notes should reference the related approval or pilot decision artifact."
    ],
    generatedAt: new Date().toISOString(),
    privacyNotes: [
      "Captured: privacy-light feedback excerpts, feedback categories, launch source, role context, timestamps, and pilot telemetry.",
      "Not captured by design: grades, student IDs, medical details, full student records, or official academic decisions.",
      "Storage: Phase 2 uses local JSONL and JSON files in the app data folder.",
      "Access: limit pilot records to the approved project team.",
      "Retention: export needed artifacts before cleanup and define institutional retention before production.",
      "Cleanup: use the pilot data cleanup tool only after exports are complete."
    ],
    risks,
    summary: countLayerStatuses([...approvals, ...risks])
  };
}

export function buildStudentReadinessLayer() {
  return {
    accessibilityChecks: [
      "Can I reach the assistant with keyboard navigation?",
      "Can I read all text without zooming excessively?",
      "Do buttons and feedback controls have clear labels?",
      "Does the iframe fit on laptop and mobile screen widths?",
      "Can I find lecturer, LMS, or IT support guidance?",
      "Can I understand what the assistant cannot do?"
    ],
    feedbackFollowUp: [
      "Helpful/not-helpful feedback is reviewed by the pilot review team.",
      "LMS navigation issues are routed to the LMS administrator.",
      "Missing FYEC100 content is routed to the lecturer and knowledge base reviewer.",
      "Technical/provider issues are routed to the technical lead or system administrator.",
      "Academic integrity concerns are routed to lecturer/project sponsor review."
    ],
    generatedAt: new Date().toISOString(),
    responsibleAi: [
      "Use the assistant to understand instructions, plan study time, and find where to get help.",
      "Do not submit AI-generated text as your own assignment work.",
      "Do not ask the assistant to write a full assignment, reflection, discussion post, or assessment response.",
      "Ask for explanations, examples, checklists, and study strategies instead.",
      "Check official course guidance in Moodle and ask your lecturer when something affects marks or deadlines."
    ],
    welcome: {
      canHelp:
        "FYEC100 expectations, study tips, Moodle navigation, assignment understanding, and academic integrity guidance.",
      cannotHelp:
        "The assistant cannot write full assignments, grade work, replace your lecturer, or access student records.",
      humanHelp:
        "Contact your lecturer for course decisions, the LMS administrator for Moodle access/navigation issues, and IT for technical access problems.",
      privacy:
        "This is a privacy-light pilot. Do not enter student IDs, grades, passwords, medical details, or private personal information."
    }
  };
}

export async function buildLtiTechnicalLayer() {
  const readiness = getLtiReadiness();

  return {
    adminConfiguration: [
      ["Login URL", readiness.toolEndpoints.loginUrl],
      ["Launch URL", readiness.toolEndpoints.launchUrl],
      ["JWKS URL", readiness.toolEndpoints.jwksUrl],
      ["Redirect URI", readiness.toolEndpoints.redirectUris.join(", ")],
      ["Tool URL", readiness.toolEndpoints.toolUrl]
    ],
    auditNotes: [
      "Record successful and failed LTI launches without storing grades or sensitive student records.",
      "Capture validation failure reason, timestamp, issuer, and deployment ID only when approved.",
      "Use single-use state and nonce values to reduce replay risk.",
      "Plan signing key generation and rotation before production.",
      "Do not trust query-string pilot context for validated LTI launches."
    ],
    generatedAt: new Date().toISOString(),
    implementation: [
      "OIDC login creates state and nonce and redirects to Moodle authorization URL.",
      "Launch endpoint validates JWT signature using Moodle JWKS.",
      "Launch validation checks issuer, audience/client ID, deployment ID, nonce, message type, and target link URI.",
      "Validated Moodle roles are mapped to student, lecturer, LMS administrator, or general assistant context.",
      "Trusted context is passed to the chat assistant only after validation succeeds."
    ],
    readiness,
    validation: [
      "Validate JWT signature.",
      "Verify issuer.",
      "Verify audience/client ID.",
      "Verify deployment ID.",
      "Verify nonce and state.",
      "Verify message type.",
      "Verify target link URI.",
      "Map Moodle roles to assistant roles.",
      "Reject launches that fail validation."
    ]
  };
}

export async function renderIisReverseProxyPackHtml() {
  const pack = await buildIisReverseProxyPack();

  return renderHtmlReport({
    generatedAt: pack.generatedAt,
    lede:
      "IIS ARR and URL Rewrite planning pack for hosting the FYEC100 assistant behind HTTPS on a Windows VM.",
    title: "FYEC100 IIS Reverse Proxy Pack",
    sections: [
      {
        id: "overview",
        title: "Reverse Proxy Overview",
        body: [
          callout("Proxy target", pack.proxyTarget, "watch"),
          list(pack.assumptions)
        ].join("")
      },
      { id: "rewrite", title: "URL Rewrite Example", body: codeBlock(pack.urlRewriteExample) },
      { id: "headers", title: "Required Headers", body: list(pack.headers) },
      { id: "moodle", title: "Moodle Iframe Checks", body: list(pack.moodleChecks) },
      { id: "rollback", title: "Rollback Behavior", body: list(pack.rollback) }
    ]
  });
}

export async function renderWindowsServicePackHtml() {
  const pack = await buildWindowsServicePack();

  return renderHtmlReport({
    generatedAt: pack.generatedAt,
    lede:
      "Windows service configuration options for running the FYEC100 assistant reliably on a Windows VM.",
    title: "FYEC100 Windows Service Configuration Pack",
    sections: [
      { id: "account", title: "Service Account Guidance", body: callout("Least privilege", pack.serviceAccount, "watch") },
      { id: "nssm", title: "NSSM Option", body: list(pack.nssm) },
      { id: "pm2", title: "PM2 Option", body: list(pack.pm2) },
      { id: "logs", title: "Log Paths", body: list(pack.logPaths) },
      { id: "restart", title: "Restart Policy", body: list(pack.restartPolicy) },
      { id: "commands", title: "Manual Commands", body: codeBlock(pack.manualCommands.join("\n")) }
    ]
  });
}

export async function renderDeploymentAcceptanceHtml() {
  const checklist = await buildDeploymentAcceptanceChecklist();

  return renderHtmlReport({
    generatedAt: checklist.generatedAt,
    lede:
      "Deployment acceptance checklist for COSTAATT IT and LMS review before controlled FYEC100 pilot launch.",
    title: "FYEC100 Deployment Acceptance Checklist",
    sections: [
      {
        id: "summary",
        title: "Acceptance Summary",
        body: `<div class="metric-grid">
          ${metric("Ready", checklist.summary.ready, "items")}
          ${metric("Review", checklist.summary.review, "items")}
          ${metric("Blocked", checklist.summary.blocked, "items")}
          ${metric("Watch", checklist.summary.watch, "items")}
        </div>`
      },
      {
        id: "items",
        title: "Sign-Off Items",
        body: `<div class="record-grid">${checklist.items
          .map(renderLayerItem)
          .join("")}</div>`
      }
    ]
  });
}

export async function renderGovernancePackHtml() {
  const governance = await buildPilotGovernanceLayer();

  return renderHtmlReport({
    generatedAt: governance.generatedAt,
    lede:
      "Governance and approval layer for institutional FYEC100 pilot review.",
    title: "FYEC100 Pilot Governance and Approval Pack",
    sections: [
      {
        id: "approvals",
        title: "Approval Workflow",
        body: `<div class="record-grid">${governance.approvals
          .map(renderLayerItem)
          .join("")}</div>`
      },
      {
        id: "risks",
        title: "Risk Register",
        body: `<div class="record-grid">${governance.risks
          .map(renderLayerItem)
          .join("")}</div>`
      },
      { id: "privacy", title: "Privacy and Data Handling", body: list(governance.privacyNotes) },
      { id: "change", title: "Pilot Change Control", body: list(governance.changeLog) }
    ]
  });
}

export async function renderStudentReadinessHtml() {
  const layer = buildStudentReadinessLayer();

  return renderHtmlReport({
    generatedAt: layer.generatedAt,
    lede:
      "Student-facing pilot readiness guidance for responsible use, feedback follow-up, and accessibility checks.",
    title: "FYEC100 Student-Facing Pilot Readiness Pack",
    sections: [
      {
        id: "welcome",
        title: "Student Pilot Welcome",
        body: `<div class="record-grid">
          ${recordCard({ label: "Can help with", meta: "Student guidance", status: "ready", text: layer.welcome.canHelp })}
          ${recordCard({ label: "Cannot help with", meta: "Academic boundary", status: "watch", text: layer.welcome.cannotHelp })}
          ${recordCard({ label: "Human help", meta: "Support pathway", status: "ready", text: layer.welcome.humanHelp })}
          ${recordCard({ label: "Privacy-light notice", meta: "Pilot notice", status: "watch", text: layer.welcome.privacy })}
        </div>`
      },
      { id: "ai", title: "Responsible AI Guide", body: list(layer.responsibleAi) },
      { id: "feedback", title: "Feedback Follow-Up", body: list(layer.feedbackFollowUp) },
      { id: "accessibility", title: "Accessibility and Usability Test", body: list(layer.accessibilityChecks) }
    ]
  });
}

export async function renderLtiTechnicalPackHtml() {
  const layer = await buildLtiTechnicalLayer();

  return renderHtmlReport({
    generatedAt: layer.generatedAt,
    lede:
      "Technical LTI implementation layer for moving from pilot embed context to trusted Moodle launch validation.",
    title: "FYEC100 LTI Technical Implementation Layer",
    sections: [
      {
        id: "readiness",
        title: "LTI Readiness",
        body: [
          callout("Current trust boundary", layer.readiness.trustBoundary, "watch"),
          `<div class="metric-grid">${metric("Configured", layer.readiness.summary.configured, "checks")}${metric("Warnings", layer.readiness.summary.warnings, "checks")}</div>`
        ].join("")
      },
      { id: "oidc", title: "OIDC and Launch Flow", body: list(layer.implementation) },
      { id: "validation", title: "Launch Validation", body: list(layer.validation) },
      { id: "admin", title: "LTI Admin Configuration", body: table(["Setting", "Value"], layer.adminConfiguration) },
      { id: "audit", title: "LTI Security and Audit", body: list(layer.auditNotes) }
    ]
  });
}

function renderLayerItem(item: LayerItem) {
  return recordCard({
    label: item.category ? `${item.label} (${item.category})` : item.label,
    meta: item.owner,
    status: item.status,
    text: item.detail
  });
}

function countLayerStatuses(items: LayerItem[]) {
  return {
    blocked: items.filter((item) => item.status === "blocked").length,
    ready: items.filter((item) => item.status === "ready").length,
    review: items.filter((item) => item.status === "review").length,
    watch: items.filter((item) => item.status === "watch").length
  };
}

async function getScriptStatus(script: (typeof WINDOWS_SCRIPTS)[number]) {
  try {
    const metadata = await stat(script.absolutePath);

    return {
      exists: true,
      path: script.path,
      sizeBytes: metadata.size
    };
  } catch {
    return {
      exists: false,
      path: script.path,
      sizeBytes: 0
    };
  }
}
