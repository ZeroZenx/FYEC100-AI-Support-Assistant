import { getDeploymentReadiness } from "@/lib/deploymentReadiness";
import { getLtiReadiness } from "@/lib/ltiReadiness";
import { buildMoodleLaunchSimulator } from "@/lib/moodleLaunchSimulator";
import { buildMoodlePilotConfigPack } from "@/lib/moodlePilotConfig";
import { getPilotOperationsRunbook } from "@/lib/pilotOperationsRunbook";
import { readPilotSessionSummary } from "@/lib/pilotSessions";
import { readLaunchAuditSummary } from "@/lib/launchAudit";
import { buildSupportTriage } from "@/lib/supportTriage";
import {
  callout,
  codeBlock,
  list,
  metric,
  recordCard,
  renderHtmlReport,
  table
} from "@/lib/htmlReport";

export type PhasePackItem = {
  detail: string;
  label: string;
  owner: string;
  status: "blocked" | "ready" | "watch";
};

export type LaunchCommunication = {
  audience: string;
  body: string;
  subject: string;
};

export async function buildWindowsAutomationPack() {
  const readiness = await getDeploymentReadiness();

  return {
    generatedAt: new Date().toISOString(),
    installAssets: [
      {
        label: "Environment template",
        path: "scripts/windows/fyec100-env.example.ps1",
        purpose:
          "Safe placeholder values for the Windows VM service environment."
      },
      {
        label: "Install service script",
        path: "scripts/windows/install-fyec100-service.ps1",
        purpose:
          "Builds the app, writes environment variables for the machine, and creates service-wrapper guidance."
      },
      {
        label: "Service control script",
        path: "scripts/windows/manage-fyec100-service.ps1",
        purpose:
          "Start, stop, restart, and inspect the Windows-hosted assistant service."
      },
      {
        label: "Preflight script",
        path: "scripts/windows/test-fyec100-preflight.ps1",
        purpose:
          "Checks Node, Git, environment variables, port 4100, and app health."
      }
    ],
    readiness,
    servicePlan: [
      "Use a dedicated Windows service account where possible.",
      "Run Node.js on localhost:4100 behind IIS ARR, Nginx for Windows, or an approved reverse proxy.",
      "Keep API keys in Windows environment variables or service manager configuration.",
      "Run npm run build after setting MOODLE_ORIGIN.",
      "Use npm run start:pilot as the service command.",
      "Run the smoke test against the public HTTPS URL before adding the link to Moodle."
    ],
    windowsChecks: [
      {
        detail: "Node.js LTS must be installed and available in the service account path.",
        label: "Node.js runtime",
        owner: "System Administrator",
        status: "watch" as const
      },
      {
        detail: "Git must be installed for clone, pull, rollback, and commit hash checks.",
        label: "Git availability",
        owner: "System Administrator",
        status: "watch" as const
      },
      {
        detail: readiness.appBaseUrl,
        label: "Public HTTPS URL",
        owner: "System Administrator",
        status: readiness.appBaseUrl.startsWith("https://") ? "ready" as const : "watch" as const
      },
      {
        detail: readiness.moodleOrigin ?? "MOODLE_ORIGIN is not configured.",
        label: "Moodle origin",
        owner: "LMS Administrator / System Administrator",
        status: readiness.moodleOrigin ? "ready" as const : "watch" as const
      },
      {
        detail: `${readiness.summary.fail} failed check(s), ${readiness.summary.warn} warning(s).`,
        label: "Deployment readiness",
        owner: "Technical Lead",
        status: readiness.summary.fail > 0 ? "blocked" as const : "ready" as const
      }
    ]
  };
}

export async function buildMoodleLaunchPack() {
  const [config, simulator, sessions] = await Promise.all([
    buildMoodlePilotConfigPack(),
    buildMoodleLaunchSimulator(),
    readPilotSessionSummary()
  ]);

  return {
    communications: buildLaunchCommunications(),
    config,
    generatedAt: new Date().toISOString(),
    placementGuide: [
      {
        detail:
          "Best first pilot location. Students see the assistant without leaving the FYEC100 shell.",
        label: "Course home block",
        owner: "LMS Administrator",
        status: "ready" as const
      },
      {
        detail:
          "Place a visible link or embedded page in the student support/orientation area.",
        label: "Student Support section",
        owner: "LMS Administrator / Lecturer",
        status: "ready" as const
      },
      {
        detail:
          "Use only for assignment-understanding help. Keep guardrail language clear that the assistant will not write submissions.",
        label: "Assignment support pages",
        owner: "Lecturer",
        status: "watch" as const
      },
      {
        detail:
          "Keep a fallback link available if iframe loading is blocked by browser, Moodle, or network settings.",
        label: "Fallback link",
        owner: "LMS Administrator",
        status: "ready" as const
      }
    ],
    sessions,
    simulator,
    studentChecklist: [
      "Assistant opens inside Moodle.",
      "Responsible AI and academic integrity notice is visible.",
      "Student starter prompts are visible and course-specific.",
      "A study-tip question receives grounded FYEC100 guidance.",
      "An LMS navigation question gives Moodle-friendly support.",
      "A full-assignment writing request is refused.",
      "Feedback controls are visible and usable."
    ],
    testingScripts: [
      {
        detail:
          "Ask one expectations question, one assignment-understanding question, and one academic integrity boundary question.",
        label: "Lecturer review script",
        owner: "Lecturer",
        status: "ready" as const
      },
      {
        detail:
          "Test iframe, Moodle block preview, fallback link, role context URLs, and browser behavior.",
        label: "LMS admin embed script",
        owner: "LMS Administrator",
        status: "ready" as const
      },
      {
        detail:
          "Submit feedback in missing-course-info, LMS navigation, technical issue, and academic integrity categories.",
        label: "Support escalation script",
        owner: "Pilot Review Team",
        status: "ready" as const
      },
      {
        detail:
          "Ask about content not in the knowledge base and confirm fallback guidance points students to official sources.",
        label: "Knowledge base gap script",
        owner: "Developer / Lecturer Reviewer",
        status: "ready" as const
      }
    ]
  };
}

export async function buildMonitoringIncidentPack() {
  const [runbook, launchAudit, supportTriage, readiness] = await Promise.all([
    getPilotOperationsRunbook(),
    readLaunchAuditSummary(),
    buildSupportTriage(),
    getDeploymentReadiness()
  ]);

  return {
    generatedAt: new Date().toISOString(),
    incidentLevels: [
      {
        detail:
          "Minor display, wording, or feedback issue. Log it and review during the next pilot meeting.",
        label: "Level 1: Monitor",
        owner: "Pilot Review Team",
        status: "ready" as const
      },
      {
        detail:
          "Repeated answer quality, Moodle access, provider reliability, or knowledge base concern. Assign owner within the same business day.",
        label: "Level 2: Review",
        owner: "Project Lead",
        status: "watch" as const
      },
      {
        detail:
          "Privacy, harmful advice, academic integrity failure, unavailable assistant during session, or security concern. Pause pilot access.",
        label: "Level 3: Stop Pilot",
        owner: "Project Sponsor / Technical Lead",
        status: "blocked" as const
      }
    ],
    launchAudit,
    monitoringChecks: [
      {
        detail: `${launchAudit.total} Moodle launch audit record(s) captured.`,
        label: "Launch audit volume",
        owner: "LMS Administrator",
        status: launchAudit.total > 0 ? "ready" as const : "watch" as const
      },
      {
        detail: `${supportTriage.summary.activeQueue} support item(s), ${supportTriage.summary.highPriority} high priority.`,
        label: "Support queue",
        owner: "Pilot Review Team",
        status: supportTriage.summary.highPriority > 0 ? "blocked" as const : "ready" as const
      },
      {
        detail: `${readiness.summary.fail} failed readiness check(s), ${readiness.summary.warn} warning(s).`,
        label: "Deployment health",
        owner: "Technical Lead",
        status: readiness.summary.fail > 0 ? "blocked" as const : "watch" as const
      },
      {
        detail: runbook.statusMessage,
        label: "Operations runbook",
        owner: runbook.record.reviewOwner,
        status: runbook.readyForPilot ? "ready" as const : "watch" as const
      }
    ],
    responseWorkflow: [
      "Record the issue without collecting student IDs, grades, or sensitive records.",
      "Classify the issue as support, LMS, technical, knowledge base, academic integrity, privacy, or security.",
      "Assign the owner and response level.",
      "If stop-pilot criteria are met, remove or hide the Moodle entry point and notify the project sponsor.",
      "Export support triage, launch audit, evidence dashboard, and decision packet before cleanup.",
      "Document the resolution and decide whether the pilot can resume."
    ],
    runbook,
    supportTriage
  };
}

export async function buildEnterpriseLtiPack() {
  const readiness = getLtiReadiness();

  return {
    generatedAt: new Date().toISOString(),
    implementationStages: [
      {
        detail:
          "Collect Moodle issuer, client ID, deployment ID, auth URL, token URL, JWKS URL, and redirect URI requirements.",
        label: "Stage 1: Moodle registration",
        owner: "LMS Administrator / Technical Lead",
        status: readiness.summary.warnings > 0 ? "watch" as const : "ready" as const
      },
      {
        detail:
          "Implement OIDC login initiation, state and nonce storage, and secure launch redirect handling.",
        label: "Stage 2: OIDC login",
        owner: "Developer",
        status: "watch" as const
      },
      {
        detail:
          "Validate ID token signature, issuer, audience/client ID, deployment ID, nonce, message type, roles, and target link URI.",
        label: "Stage 3: Launch validation",
        owner: "Developer / Technical Lead",
        status: "watch" as const
      },
      {
        detail:
          "Map validated Moodle roles to assistant role guidance and audit trust-boundary decisions.",
        label: "Stage 4: Role mapping",
        owner: "LMS Administrator / Developer",
        status: "watch" as const
      },
      {
        detail:
          "Run cybersecurity, privacy, LMS administrator, accessibility, and support readiness review before production launch.",
        label: "Stage 5: Enterprise approval",
        owner: "Project Sponsor / Governance",
        status: "watch" as const
      }
    ],
    readiness,
    validationChecklist: [
      "Issuer matches LTI_PLATFORM_ISSUER.",
      "Audience includes LTI_CLIENT_ID.",
      "Deployment ID matches LTI_DEPLOYMENT_ID.",
      "JWT signature validates against Moodle JWKS.",
      "Nonce and state are single-use and expire.",
      "Message type and target link URI are expected.",
      "Moodle roles are mapped to supported assistant roles.",
      "No student grades or sensitive records are stored in pilot telemetry."
    ]
  };
}

export async function renderWindowsAutomationPackHtml() {
  const pack = await buildWindowsAutomationPack();

  return renderHtmlReport({
    generatedAt: pack.generatedAt,
    lede:
      "Windows VM deployment automation assets for installing, configuring, controlling, and preflighting the FYEC100 assistant service.",
    title: "FYEC100 Windows VM Deployment Automation Pack",
    sections: [
      {
        id: "assets",
        title: "Automation Assets",
        body: table(
          ["Asset", "Path", "Purpose"],
          pack.installAssets.map((asset) => [
            asset.label,
            asset.path,
            asset.purpose
          ])
        )
      },
      {
        id: "service",
        title: "Service Plan",
        body: list(pack.servicePlan)
      },
      {
        id: "preflight",
        title: "Windows VM Preflight",
        body: `<div class="record-grid">${pack.windowsChecks
          .map((item) => renderItem(item))
          .join("")}</div>`
      },
      {
        id: "readiness",
        title: "Deployment Readiness",
        body: `<div class="metric-grid">
          ${metric("Pass", pack.readiness.summary.pass, "checks")}
          ${metric("Warnings", pack.readiness.summary.warn, "checks")}
          ${metric("Failures", pack.readiness.summary.fail, "checks")}
        </div>`
      }
    ]
  });
}

export async function renderMoodleLaunchPackHtml() {
  const pack = await buildMoodleLaunchPack();

  return renderHtmlReport({
    generatedAt: pack.generatedAt,
    lede:
      "Moodle course placement, student experience checks, testing scripts, and launch communications for the FYEC100 pilot.",
    title: "FYEC100 Moodle Pilot Launch Pack",
    sections: [
      {
        id: "placement",
        title: "Course Placement Guide",
        body: `<div class="record-grid">${pack.placementGuide
          .map((item) => renderItem(item))
          .join("")}</div>`
      },
      {
        id: "student",
        title: "Student Experience Checklist",
        body: list(pack.studentChecklist)
      },
      {
        id: "testing",
        title: "Lecturer And LMS Admin Testing Scripts",
        body: `<div class="record-grid">${pack.testingScripts
          .map((item) => renderItem(item))
          .join("")}</div>`
      },
      {
        id: "communications",
        title: "Launch Communications",
        body: pack.communications
          .map(
            (item) =>
              `<h3>${item.audience}: ${item.subject}</h3>${codeBlock(item.body)}`
          )
          .join("")
      }
    ]
  });
}

export async function renderMonitoringIncidentPackHtml() {
  const pack = await buildMonitoringIncidentPack();

  return renderHtmlReport({
    generatedAt: pack.generatedAt,
    lede:
      "Monitoring and incident response guide for controlled FYEC100 Moodle pilot operations.",
    title: "FYEC100 Pilot Monitoring And Incident Response Pack",
    sections: [
      {
        id: "signals",
        title: "Monitoring Signals",
        body: `<div class="record-grid">${pack.monitoringChecks
          .map((item) => renderItem(item))
          .join("")}</div>`
      },
      {
        id: "levels",
        title: "Incident Levels",
        body: `<div class="record-grid">${pack.incidentLevels
          .map((item) => renderItem(item))
          .join("")}</div>`
      },
      {
        id: "workflow",
        title: "Response Workflow",
        body: list(pack.responseWorkflow)
      },
      {
        id: "stop",
        title: "Stop-Pilot Triggers",
        body: list(pack.runbook.record.stopPilotTriggers)
      }
    ]
  });
}

export async function renderEnterpriseLtiPackHtml() {
  const pack = await buildEnterpriseLtiPack();

  return renderHtmlReport({
    generatedAt: pack.generatedAt,
    lede:
      "Enterprise LTI 1.3 implementation planning pack for turning the current scaffold into trusted Moodle launch validation.",
    title: "FYEC100 Enterprise LTI 1.3 Implementation Pack",
    sections: [
      {
        id: "summary",
        title: "LTI Readiness Summary",
        body: [
          callout("Trust boundary", pack.readiness.trustBoundary, "watch"),
          `<div class="metric-grid">
            ${metric("Configured", pack.readiness.summary.configured, "checks")}
            ${metric("Warnings", pack.readiness.summary.warnings, "checks")}
          </div>`
        ].join("")
      },
      {
        id: "stages",
        title: "Implementation Stages",
        body: `<div class="record-grid">${pack.implementationStages
          .map((item) => renderItem(item))
          .join("")}</div>`
      },
      {
        id: "platform",
        title: "Moodle Platform Values",
        body: table(
          ["Value", "Current"],
          [
            ["Issuer", pack.readiness.platform.issuer || "Not configured"],
            ["Client ID", pack.readiness.platform.clientId || "Not configured"],
            [
              "Deployment ID",
              pack.readiness.platform.deploymentId || "Not configured"
            ],
            [
              "Authorization URL",
              pack.readiness.platform.authorizationUrl || "Not configured"
            ],
            ["Token URL", pack.readiness.platform.tokenUrl || "Not configured"],
            ["JWKS URL", pack.readiness.platform.jwksUrl || "Not configured"]
          ]
        )
      },
      {
        id: "validation",
        title: "Launch Validation Checklist",
        body: list(pack.validationChecklist)
      }
    ]
  });
}

function renderItem(item: PhasePackItem) {
  return recordCard({
    label: item.label,
    meta: item.owner,
    status: item.status,
    text: item.detail
  });
}

function buildLaunchCommunications(): LaunchCommunication[] {
  return [
    {
      audience: "Students",
      subject: "FYEC100 AI Support Assistant pilot",
      body:
        "A pilot FYEC100 AI Support Assistant is available inside Moodle to help you understand course expectations, study strategies, LMS navigation, and responsible AI use. It will not write assignments, grade work, or replace your lecturer."
    },
    {
      audience: "Lecturer",
      subject: "FYEC100 assistant pilot lecturer briefing",
      body:
        "Please review the assistant in Moodle before student use. Test expectations, assignment-understanding guidance, academic integrity boundaries, and any course content gaps that should be added to the knowledge base."
    },
    {
      audience: "LMS Administrator",
      subject: "FYEC100 assistant Moodle placement check",
      body:
        "Please confirm the assistant opens inside the FYEC100 Moodle shell, the fallback link is visible, role/context preview URLs work, and launch audit records appear for pilot review."
    },
    {
      audience: "Support Team",
      subject: "FYEC100 assistant support routing",
      body:
        "During the pilot, route feedback to lecturer, LMS administrator, technical lead, knowledge base reviewer, or academic integrity owner using the support triage and feedback inbox pages."
    }
  ];
}
