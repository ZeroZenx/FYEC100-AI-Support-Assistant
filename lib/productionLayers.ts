import { buildAuditLayer } from "@/lib/auditEvents";
import {
  callout,
  metric,
  recordCard,
  renderHtmlReport,
  table
} from "@/lib/htmlReport";
import { getKnowledgeBaseApplyChecklist } from "@/lib/knowledgeBaseApplyChecklist";
import { getKnowledgeBaseDraftUpdates } from "@/lib/knowledgeBaseDraftUpdates";
import { readKnowledgeBase } from "@/lib/knowledgeBase";
import { getKnowledgeBaseReleases } from "@/lib/knowledgeBaseReleases";
import { createTestLtiIdToken, readLtiLaunchStates } from "@/lib/ltiLaunch";
import { readPilotFeedbackRecords, readPilotFeedbackSummary } from "@/lib/pilotFeedback";
import { buildSupportTriage } from "@/lib/supportTriage";

export type ProductionLayerRecord = {
  detail: string;
  label: string;
  owner: string;
  status: string;
};

export async function buildRealLtiTechnicalLayer() {
  const states = await readLtiLaunchStates();
  const latest = states[0];
  const sampleToken = latest
    ? createTestLtiIdToken({
        clientId: latest.clientId || process.env.LTI_CLIENT_ID || "local-client-id",
        deploymentId:
          latest.deploymentId || process.env.LTI_DEPLOYMENT_ID || "local-deployment-id",
        issuer: latest.issuer || process.env.LTI_PLATFORM_ISSUER || "local-issuer",
        nonce: latest.nonce
      })
    : "";

  return {
    generatedAt: new Date().toISOString(),
    metrics: {
      configuredAuthUrl: process.env.LTI_PLATFORM_AUTH_URL ? "Yes" : "No",
      latestState: latest ? "Available" : "None",
      stateRecords: states.length,
      validationMode: "Local JWT claim checks"
    },
    oidcLogin: [
      {
        detail:
          "The login endpoint now creates a local state and nonce record and redirects to Moodle when LTI_PLATFORM_AUTH_URL and client ID are configured.",
        label: "OIDC login endpoint",
        owner: "Developer / LMS Administrator",
        status: process.env.LTI_PLATFORM_AUTH_URL ? "ready" : "review"
      },
      {
        detail:
          "Missing platform configuration returns a structured 409 response with the generated launch state for local testing.",
        label: "Configuration fallback",
        owner: "Technical Lead",
        status: "ready"
      }
    ],
    sampleToken,
    stateStore: [
      {
        detail:
          "State, nonce, issuer, client ID, deployment ID, target link URI, return URL, timestamp, and expiration are stored in data/lti-launch-states.jsonl.",
        label: "Local launch state store",
        owner: "Developer",
        status: "ready"
      },
      {
        detail:
          latest?.state ?? "No launch state has been generated yet. Open /api/lti/login with Moodle launch parameters or use the test harness.",
        label: "Latest state",
        owner: "LMS Administrator",
        status: latest ? "ready" : "watch"
      }
    ],
    testHarness: [
      {
        detail:
          "Use /api/lti/login to generate state/nonce, then POST state and id_token to /api/lti/launch to see validation checks.",
        label: "Valid launch simulation",
        owner: "Developer / LMS Administrator",
        status: "ready"
      },
      {
        detail:
          "Change nonce, issuer, audience, deployment ID, expiration, or message type in the test token to confirm validation failures.",
        label: "Invalid launch simulation",
        owner: "Technical Lead",
        status: "ready"
      }
    ],
    trustedContext: [
      {
        detail:
          "Validated LTI context claims map to course ID, course short name, role, and launch source lti.",
        label: "Trusted Moodle context mapping",
        owner: "Developer",
        status: "ready"
      },
      {
        detail:
          "The assistant should trust LTI context only after validation passes; URL-based pilot context remains rehearsal-only.",
        label: "Trust boundary",
        owner: "Governance / Technical Lead",
        status: "review"
      }
    ],
    validation: [
      "State present and found in local store",
      "State not expired",
      "ID token payload decodes",
      "Issuer matches launch state or configured platform issuer",
      "Audience matches client ID",
      "Deployment ID matches launch state or configured deployment",
      "Nonce matches launch state",
      "Message type is LtiResourceLinkRequest",
      "Token expiration is in the future"
    ]
  };
}

export async function buildServiceDeskLayer() {
  const [triage, feedback] = await Promise.all([
    buildSupportTriage(),
    readPilotFeedbackRecords()
  ]);
  const cases = triage.queue.map((item, index) => ({
    detail: `${item.question} Recommended response: ${item.recommendedAction}`,
    label: `CASE-${String(index + 1).padStart(3, "0")} / ${item.category}`,
    owner: item.owner,
    status:
      item.priority === "high"
        ? "assigned"
        : item.priority === "medium"
          ? "new"
          : "monitor"
  }));

  return {
    caseLifecycle: [
      "new",
      "assigned",
      "in-progress",
      "waiting-on-lecturer",
      "waiting-on-lms-admin",
      "resolved",
      "closed"
    ],
    cases,
    generatedAt: new Date().toISOString(),
    metrics: {
      activeCases: cases.length,
      feedbackRecords: feedback.length,
      highPriority: triage.summary.highPriority,
      owners: triage.summary.owners,
      overdue: triage.summary.highPriority > 0 ? "Review needed" : "None"
    },
    resolutionNotes: [
      "Record whether the issue was resolved by Moodle support, lecturer clarification, KB update, technical fix, or human-led follow-up.",
      "Avoid storing student IDs, grades, or sensitive student records in local case notes.",
      "Escalate unresolved academic integrity concerns to the lecturer and project sponsor."
    ],
    slaRules: [
      {
        detail: "Academic integrity, LMS access, and technical outage cases should be reviewed before the next pilot window.",
        label: "High priority response",
        owner: "Project Lead",
        status: "review"
      },
      {
        detail: "Knowledge base gaps should be reviewed during the weekly content operations cycle.",
        label: "Medium priority response",
        owner: "Lecturer / Developer",
        status: "ready"
      },
      {
        detail: "Helpful or low-risk feedback can be summarized in post-pilot review.",
        label: "Low priority response",
        owner: "Pilot Review Team",
        status: "ready"
      }
    ]
  };
}

export async function buildKnowledgeBasePublishingLayer() {
  const [drafts, checklist, releases, liveKb] = await Promise.all([
    getKnowledgeBaseDraftUpdates(),
    getKnowledgeBaseApplyChecklist(),
    getKnowledgeBaseReleases(),
    readKnowledgeBase()
  ]);
  const futureContent = [
    liveKb.trim(),
    ...drafts.record.drafts
      .filter((draft) => draft.status === "approved")
      .map(
        (draft) =>
          `\n\n## Proposed Update: ${draft.title}\n\n${draft.draftWording}`
      )
  ].join("");

  return {
    diffViewer: drafts.record.drafts.map((draft) => ({
      detail: `${draft.knowledgeBaseSection}: ${draft.draftWording || draft.rationale}`,
      label: draft.title,
      owner: draft.owner,
      status: draft.status
    })),
    generatedAt: new Date().toISOString(),
    metrics: {
      approvedDrafts: drafts.summary.approved,
      liveCharacters: liveKb.length,
      publishReady: checklist.readyToApply ? "Yes" : "No",
      releaseNotes: releases.summary.total,
      rollbackSnapshot: "Planned"
    },
    preview: futureContent.slice(0, 2200),
    publishGate: [
      {
        detail: checklist.statusMessage,
        label: "Checklist gate",
        owner: checklist.record.applyOwner,
        status: checklist.readyToApply ? "ready" : "review"
      },
      {
        detail: "Reviewer, release note, guardrail check, fallback check, and smoke test evidence are required before live edits.",
        label: "Manual publish gate",
        owner: "Lecturer / Developer",
        status: "review"
      },
      {
        detail: "Save a restorable snapshot before replacing the live Markdown knowledge base.",
        label: "Rollback snapshot",
        owner: "Developer",
        status: "planned"
      }
    ],
    workflow: checklist.record.steps.map((step) => ({
      detail: step.evidence,
      label: step.label,
      owner: step.owner,
      status: step.status
    }))
  };
}

export async function buildStudentExperienceLayer() {
  const [feedbackSummary, feedbackRecords] = await Promise.all([
    readPilotFeedbackSummary(),
    readPilotFeedbackRecords()
  ]);

  return {
    generatedAt: new Date().toISOString(),
    helpfulnessFollowUp: [
      {
        detail:
          "Ask one optional question after a response: Did this help you know what to do next?",
        label: "Follow-up prompt",
        owner: "Project Lead / Lecturer",
        status: "ready"
      },
      {
        detail:
          `${feedbackSummary.counts.helpful} helpful and ${feedbackSummary.counts["not-helpful"]} not-helpful feedback record(s) are currently available.`,
        label: "Current helpfulness signal",
        owner: "Pilot Review Team",
        status: feedbackSummary.total > 0 ? "ready" : "watch"
      }
    ],
    interventionRecommendations: [
      {
        detail: "Create a Moodle announcement when several students ask the same course expectation question.",
        label: "Moodle announcement",
        owner: "Lecturer / LMS Administrator",
        status: "review"
      },
      {
        detail: "Move repeated missing answers into the KB publishing pipeline after lecturer approval.",
        label: "Knowledge base update",
        owner: "Lecturer / Developer",
        status: "ready"
      },
      {
        detail: "Use LMS navigation pain points to create a short Moodle orientation guide.",
        label: "LMS navigation guide",
        owner: "LMS Administrator",
        status: "review"
      }
    ],
    metrics: {
      feedbackRecords: feedbackSummary.total,
      helpful: feedbackSummary.counts.helpful,
      integrityConcerns: feedbackSummary.counts["academic-integrity-concern"],
      lmsIssues: feedbackSummary.counts["lms-navigation-issue"],
      missingInfo: feedbackSummary.counts["missing-course-information"],
      notHelpful: feedbackSummary.counts["not-helpful"]
    },
    outcomeTags: [
      "answered",
      "needs lecturer",
      "needs LMS support",
      "content gap",
      "integrity boundary",
      "technical issue"
    ],
    promptStarters: [
      "Help me understand what FYEC100 expects from first-year students.",
      "Help me plan my week for FYEC100 without doing the assignment for me.",
      "Where should I look in Moodle for FYEC100 course materials?",
      "What questions should I ask my lecturer about this assignment?",
      "How can I use AI responsibly for brainstorming and studying?",
      "Can you explain this course concept in simpler language?"
    ],
    themes: [
      {
        detail:
          feedbackRecords[0]?.studentQuestionExcerpt ||
          "No student question theme has been recorded yet.",
        label: "Recent student need",
        owner: "Lecturer / Project Lead",
        status: feedbackRecords.length > 0 ? "review" : "watch"
      },
      {
        detail:
          "Track deadlines, assignment expectations, LMS navigation, study habits, and responsible AI use as recurring pilot themes.",
        label: "Learning support themes",
        owner: "Pilot Review Team",
        status: "ready"
      }
    ]
  };
}

export async function renderLtiTechnicalBuildHtml() {
  const layer = await buildRealLtiTechnicalLayer();

  return renderHtmlReport({
    generatedAt: layer.generatedAt,
    lede:
      "A testable LTI technical build pack covering OIDC state, launch validation, trusted Moodle context mapping, and local test harness guidance.",
    title: "FYEC100 Real Moodle/LTI Technical Build Pack",
    sections: [
      { id: "state", title: "LTI Launch State Store", body: cards(layer.stateStore) },
      { id: "login", title: "OIDC Login Endpoint", body: cards(layer.oidcLogin) },
      {
        id: "validation",
        title: "LTI Launch Validation",
        body: table(["Check"], layer.validation.map((item) => [item]))
      },
      { id: "context", title: "Trusted Moodle Context", body: cards(layer.trustedContext) },
      { id: "harness", title: "LTI Test Harness", body: cards(layer.testHarness) }
    ]
  });
}

export async function renderServiceDeskHtml() {
  const layer = await buildServiceDeskLayer();

  return renderHtmlReport({
    generatedAt: layer.generatedAt,
    lede:
      "A production support and service desk pack for case intake, lifecycle tracking, SLA rules, assignments, and weekly support review.",
    title: "FYEC100 Production Support and Service Desk Pack",
    sections: [
      { id: "cases", title: "Support Case Queue", body: [metrics(layer.metrics), cards(layer.cases)].join("") },
      { id: "lifecycle", title: "Support Case Lifecycle", body: table(["Status"], layer.caseLifecycle.map((item) => [item])) },
      { id: "sla", title: "SLA Rules", body: cards(layer.slaRules) },
      { id: "resolution", title: "Case Resolution Notes", body: table(["Note"], layer.resolutionNotes.map((item) => [item])) }
    ]
  });
}

export async function renderKnowledgeBasePublishingHtml() {
  const layer = await buildKnowledgeBasePublishingLayer();

  return renderHtmlReport({
    generatedAt: layer.generatedAt,
    lede:
      "A knowledge base publishing pipeline pack for draft-to-publish workflow, preview, diff review, publish gates, rollback, and release reporting.",
    title: "FYEC100 Knowledge Base Publishing Pipeline Pack",
    sections: [
      { id: "workflow", title: "Draft-to-Publish Workflow", body: [metrics(layer.metrics), cards(layer.workflow)].join("") },
      { id: "preview", title: "Knowledge Base Preview", body: callout("Preview excerpt", layer.preview, "info") },
      { id: "diff", title: "Diff Viewer", body: cards(layer.diffViewer) },
      { id: "gate", title: "Publish Gate and Rollback", body: cards(layer.publishGate) }
    ]
  });
}

export async function renderStudentExperienceHtml() {
  const layer = await buildStudentExperienceLayer();

  return renderHtmlReport({
    generatedAt: layer.generatedAt,
    lede:
      "A student experience and learning effectiveness pack for prompt starters, outcome tags, helpfulness follow-up, support themes, and intervention recommendations.",
    title: "FYEC100 Student Experience and Learning Effectiveness Pack",
    sections: [
      { id: "starters", title: "Student Prompt Starters", body: table(["Prompt"], layer.promptStarters.map((item) => [item])) },
      { id: "outcomes", title: "Conversation Outcome Tags", body: table(["Tag"], layer.outcomeTags.map((item) => [item])) },
      { id: "helpfulness", title: "Helpfulness Follow-Up", body: [metrics(layer.metrics), cards(layer.helpfulnessFollowUp)].join("") },
      { id: "themes", title: "Learning Support Themes", body: cards(layer.themes) },
      { id: "interventions", title: "Intervention Recommendations", body: cards(layer.interventionRecommendations) }
    ]
  });
}

function cards(items: ProductionLayerRecord[]) {
  if (items.length === 0) {
    return `<p class="muted">No active records are currently available.</p>`;
  }

  return `<div class="record-grid">${items
    .map((item) =>
      recordCard({
        label: item.label,
        meta: item.owner,
        status: item.status,
        text: item.detail
      })
    )
    .join("")}</div>`;
}

function metrics(values: Record<string, number | string>) {
  return `<div class="metric-grid">${Object.entries(values)
    .map(([label, value]) => metric(label, value, "current"))
    .join("")}</div>`;
}
