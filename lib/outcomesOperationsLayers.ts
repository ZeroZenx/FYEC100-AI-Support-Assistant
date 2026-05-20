import { getAdminAuthStatus } from "@/lib/adminAuth";
import { getProviderStatus } from "@/lib/aiProvider";
import { getAccessibilityUsabilityReview } from "@/lib/accessibilityUsabilityReview";
import { getDeploymentReadiness } from "@/lib/deploymentReadiness";
import {
  callout,
  list,
  metric,
  recordCard,
  renderHtmlReport,
  table
} from "@/lib/htmlReport";
import { getKnowledgeBaseApplyChecklist } from "@/lib/knowledgeBaseApplyChecklist";
import { getKnowledgeBaseChangeRequests } from "@/lib/knowledgeBaseChangeRequests";
import { getKnowledgeBaseDraftUpdates } from "@/lib/knowledgeBaseDraftUpdates";
import { getKnowledgeBaseMetadata } from "@/lib/knowledgeBase";
import { getKnowledgeBaseReleases } from "@/lib/knowledgeBaseReleases";
import { getKnowledgeBaseReviewStatus } from "@/lib/knowledgeBaseReview";
import { getLtiReadiness } from "@/lib/ltiReadiness";
import { buildPilotAnalytics } from "@/lib/pilotAnalytics";
import { buildPilotReport } from "@/lib/pilotReport";
import { buildSupportTriage } from "@/lib/supportTriage";

export type LayerRecord = {
  detail: string;
  label: string;
  owner: string;
  status: string;
};

export async function buildPilotOutcomesLayer() {
  const [analytics, report, changes] = await Promise.all([
    buildPilotAnalytics(),
    buildPilotReport(),
    getKnowledgeBaseChangeRequests()
  ]);
  const integrityEvents =
    analytics.feedback.escalationCounts["academic-integrity"] ?? 0;
  const missingTopics = changes.pending.map((request) => ({
    detail: request.recommendedChange || request.rationale,
    label: request.title,
    owner: request.owner,
    status: request.priority
  }));
  const readinessToScale =
    analytics.summary.totalLaunches > 0 &&
    analytics.summary.escalationCandidates === 0 &&
    changes.summary.highPriorityPending === 0;

  return {
    closeout: {
      decisionRecommendation: readinessToScale
        ? "Proceed to a larger controlled pilot after sponsor sign-off."
        : "Hold scale-up until queued support, content, and integrity items are reviewed.",
      needsImprovement: [
        "Resolve repeated unanswered questions and missing FYEC100 topics.",
        "Confirm Moodle launch behavior from the hosted URL.",
        "Review all academic integrity boundary events before wider rollout.",
        "Attach smoke test and deployment evidence to the pilot closeout record."
      ],
      nextPhaseRecommendation:
        "Use the pilot evidence to decide whether to move into enterprise Moodle/LTI validation and approved production storage.",
      risksFound: analytics.riskSignals.map(
        (signal) => `${signal.label}: ${signal.text}`
      ),
      tested: [
        "Student chat support for FYEC100 questions",
        "Moodle embedded and standalone launch paths",
        "Feedback intake and escalation routing",
        "Knowledge base coverage and support triage signals",
        "Academic integrity guardrails"
      ],
      worked: report.suggestedActions
        .slice(0, 5)
        .map((action) => `${action.owner}: ${action.text}`)
    },
    contentGaps: {
      feedbackTaggedMissing:
        analytics.feedback.counts["missing-course-information"] ?? 0,
      missingTopics:
        missingTopics.length > 0
          ? missingTopics
          : [
              {
                detail:
                  "No pending content gaps are recorded yet. Continue monitoring feedback for unanswered FYEC100 questions.",
                label: "No active gap queue",
                owner: "Lecturer / Content Owner",
                status: "ready"
              }
            ],
      proposedUpdates: changes.approved.map((request) => ({
        detail: request.recommendedChange || request.rationale,
        label: request.title,
        owner: request.owner,
        status: request.status
      })),
      repeatedUnansweredQuestions: report.knowledgeBaseCandidates
    },
    dashboard: [
      {
        detail: `${analytics.summary.helpfulRate}% helpful feedback rate from pilot records.`,
        label: "Student usefulness signals",
        owner: "Project Lead",
        status: analytics.summary.helpfulRate >= 70 ? "ready" : "review"
      },
      {
        detail: `${analytics.summary.escalationCandidates} feedback item(s) need review before scale.`,
        label: "Support demand",
        owner: "Pilot Review Team",
        status: analytics.summary.escalationCandidates > 0 ? "review" : "ready"
      },
      {
        detail: `${analytics.summary.totalLaunches} Moodle or app launch event(s) recorded.`,
        label: "Moodle launch activity",
        owner: "LMS Administrator",
        status: analytics.summary.totalLaunches > 0 ? "ready" : "watch"
      },
      {
        detail: `${changes.summary.pending} pending and ${changes.summary.highPriorityPending} high-priority content request(s).`,
        label: "Knowledge base gaps",
        owner: "Lecturer / Content Owner",
        status: changes.summary.highPriorityPending > 0 ? "review" : "ready"
      },
      {
        detail: `${integrityEvents} academic integrity boundary event(s) recorded.`,
        label: "Academic integrity boundary events",
        owner: "Lecturer / Project Sponsor",
        status: integrityEvents > 0 ? "review" : "ready"
      },
      {
        detail: readinessToScale
          ? "Evidence is trending toward controlled scale-up readiness."
          : "Scale-up should wait for queued review items and formal sign-off.",
        label: "Readiness to scale",
        owner: "Project Sponsor / Project Lead",
        status: readinessToScale ? "ready" : "review"
      }
    ],
    generatedAt: new Date().toISOString(),
    metrics: {
      escalationCandidates: analytics.summary.escalationCandidates,
      helpfulRate: `${analytics.summary.helpfulRate}%`,
      integrityEvents,
      knowledgeBaseGaps: changes.summary.pending,
      launches: analytics.summary.totalLaunches,
      totalFeedback: analytics.summary.totalFeedback
    },
    successInsights: [
      {
        detail:
          report.topReviewItems[0]?.studentQuestionExcerpt ??
          "Continue collecting pilot feedback to identify student needs.",
        label: "Common student needs",
        owner: "Project Lead / Lecturer",
        status: "review"
      },
      {
        detail:
          "Study support should emphasize understanding course expectations, planning, reflection, and responsible use of AI.",
        label: "Study support themes",
        owner: "Lecturer",
        status: "ready"
      },
      {
        detail:
          report.lmsAdministratorItems[0]?.studentQuestionExcerpt ??
          "No LMS navigation pain point is currently queued.",
        label: "LMS navigation pain points",
        owner: "LMS Administrator",
        status: report.lmsAdministratorItems.length > 0 ? "review" : "ready"
      },
      {
        detail:
          integrityEvents > 0
            ? "Reinforce assignment boundaries and acceptable AI use in Moodle."
            : "Current integrity guardrails can remain visible during pilot testing.",
        label: "Responsible AI guidance needs",
        owner: "Lecturer / Project Sponsor",
        status: integrityEvents > 0 ? "review" : "ready"
      },
      {
        detail:
          "Use the support categories to decide which questions become knowledge base updates and which remain human-led.",
        label: "Recommended interventions",
        owner: "Pilot Review Team",
        status: "review"
      }
    ]
  };
}

export async function buildKnowledgeBaseContentOperationsLayer() {
  const [metadata, review, changes, drafts, checklist, releases] =
    await Promise.all([
      getKnowledgeBaseMetadata(),
      getKnowledgeBaseReviewStatus(),
      getKnowledgeBaseChangeRequests(),
      getKnowledgeBaseDraftUpdates(),
      getKnowledgeBaseApplyChecklist(),
      getKnowledgeBaseReleases()
    ]);

  return {
    authoringQueue: [
      ...drafts.openDrafts.map((draft) => ({
        detail: draft.draftWording || draft.rationale,
        label: `${draft.id}: ${draft.title}`,
        owner: draft.owner,
        status: draft.status
      })),
      ...changes.pending.map((request) => ({
        detail: request.recommendedChange || request.rationale,
        label: `${request.id}: ${request.title}`,
        owner: request.owner,
        status: request.priority
      }))
    ],
    generatedAt: new Date().toISOString(),
    metrics: {
      approvedChanges: changes.summary.approved,
      currentSections: metadata.headings.length,
      openDrafts: drafts.openDrafts.length,
      pendingChanges: changes.summary.pending,
      releaseDrafts: releases.summary.draft,
      requiredPending: checklist.summary.requiredPending
    },
    qualityChecks: [
      {
        detail: review.statusMessage,
        label: "Content owner review",
        owner: review.record.contentOwner,
        status: review.readyForPilot ? "ready" : "review"
      },
      {
        detail: `${changes.summary.pending} pending change request(s) require decision.`,
        label: "Outdated or missing content",
        owner: "Lecturer / Content Owner",
        status: changes.summary.pending > 0 ? "review" : "ready"
      },
      {
        detail:
          "Course policy, academic integrity, LMS navigation, and assignment boundaries should remain present in the live knowledge base.",
        label: "Required policy language",
        owner: "Lecturer / Governance Reviewer",
        status: "review"
      },
      {
        detail:
          "Draft wording should avoid unsupported claims and refer students to the lecturer when official interpretation is needed.",
        label: "Unsupported claims",
        owner: "Developer / Lecturer",
        status: "review"
      },
      {
        detail:
          "Fallback coverage should direct students to lecturer, LMS administrator, or support owner when content is not approved.",
        label: "Ask lecturer fallback coverage",
        owner: "Pilot Review Team",
        status: "ready"
      }
    ],
    releaseFlow: checklist.record.steps.map((step) => ({
      detail: step.evidence,
      label: step.label,
      owner: step.owner,
      status: step.status
    })),
    versionComparison: [
      {
        detail: `${metadata.headings.length} current heading(s), ${metadata.wordCount} word(s), last updated ${new Date(
          metadata.lastUpdated
        ).toLocaleString()}.`,
        label: "Current live knowledge base",
        owner: "Developer",
        status: "ready"
      },
      {
        detail: `${drafts.summary.total} draft update(s), ${drafts.summary.approved} approved, ${drafts.summary.applied} applied.`,
        label: "Proposed changes",
        owner: "Lecturer / Developer",
        status: drafts.openDrafts.length > 0 ? "review" : "ready"
      },
      {
        detail:
          releases.latestRelease?.summary ??
          "No release note has been recorded yet.",
        label: "Latest release note",
        owner: releases.latestRelease?.reviewer || "Project Lead",
        status: releases.latestRelease?.releaseStatus ?? "review"
      }
    ]
  };
}

export async function buildStudentSupportOperationsLayer() {
  const triage = await buildSupportTriage();

  return {
    caseQueue: triage.queue.map((item) => ({
      detail: `${item.question} Recommended response: ${item.recommendedAction}`,
      label: `${item.category} / ${item.ageLabel}`,
      owner: item.owner,
      status: item.priority
    })),
    generatedAt: new Date().toISOString(),
    metrics: {
      activeQueue: triage.summary.activeQueue,
      highPriority: triage.summary.highPriority,
      mediumPriority: triage.summary.mediumPriority,
      owners: triage.summary.owners,
      totalFeedback: triage.summary.totalFeedback
    },
    postPilotReview: [
      "Summarize the top student questions and recurring FYEC100 support needs.",
      "Move approved repeat answers into the knowledge base update queue.",
      "Keep grading, assignment interpretation, and academic misconduct questions human-led.",
      "Review Moodle access and navigation issues with the LMS administrator.",
      "Decide which response templates should be used in the next pilot stage."
    ],
    responseTemplates: triage.playbook.map((item) => ({
      detail: item.firstResponse,
      label: item.category,
      owner: item.owner,
      status: item.priority
    })),
    sla: [
      {
        detail: `${triage.summary.highPriority} high-priority item(s) should be reviewed before the next student-facing pilot window.`,
        label: "High-priority queue",
        owner: "Pilot Review Team",
        status: triage.summary.highPriority > 0 ? "review" : "ready"
      },
      {
        detail: `${triage.summary.owners} owner group(s) currently have queued support work.`,
        label: "Owner load",
        owner: "Project Lead",
        status: triage.summary.owners > 2 ? "review" : "ready"
      },
      {
        detail:
          "Escalate old high-priority items to the project lead and record action before pilot expansion.",
        label: "Unresolved age",
        owner: "Project Lead",
        status: "review"
      },
      {
        detail: triage.statusMessage,
        label: "Support readiness",
        owner: "Project Lead / LMS Administrator",
        status: triage.status
      }
    ]
  };
}

export async function buildEnterpriseHardeningLayer() {
  const [deployment, accessibility, kbReview] = await Promise.all([
    getDeploymentReadiness(),
    getAccessibilityUsabilityReview(),
    getKnowledgeBaseReviewStatus()
  ]);
  const provider = getProviderStatus();
  const admin = getAdminAuthStatus();
  const lti = getLtiReadiness();

  return {
    auditMonitoring: [
      {
        detail: "Record admin actions for export, launch review, configuration changes, and support routing decisions.",
        label: "Admin actions",
        owner: "Technical Lead",
        status: "review"
      },
      {
        detail: "Continue capturing launch source, role, and mode without storing student grades or sensitive student records.",
        label: "Launch events",
        owner: "LMS Administrator / Governance",
        status: "ready"
      },
      {
        detail: "Track provider test failures, chat errors, rate-limit events, and fallback usage during pilot windows.",
        label: "Provider errors",
        owner: "Developer / System Administrator",
        status: provider.configured ? "ready" : "review"
      },
      {
        detail: "Alert the project lead when security, privacy, or academic integrity boundary events appear.",
        label: "Security events",
        owner: "Project Lead / Governance",
        status: "review"
      }
    ],
    dataRetention: [
      {
        detail: "Pilot configuration, reports, and knowledge base content can remain file-based for controlled testing.",
        label: "File-based records",
        owner: "Technical Lead",
        status: "ready"
      },
      {
        detail: "Move launch analytics, support cases, and approval records to approved institutional storage before production scale.",
        label: "Database or approved storage",
        owner: "Project Sponsor / IT",
        status: "review"
      },
      {
        detail: "Set a pilot retention period, export procedure, deletion procedure, and access model before live student expansion.",
        label: "Retention and cleanup",
        owner: "Governance / Project Lead",
        status: "review"
      },
      {
        detail: "Admin pages must remain internal or protected by platform authentication beyond the pilot token.",
        label: "Access controls",
        owner: "Technical Lead / System Administrator",
        status: admin.configured ? "review" : "blocked"
      }
    ],
    generatedAt: new Date().toISOString(),
    metrics: {
      adminToken: admin.configured ? "Configured" : "Missing",
      deploymentWarnings: deployment.summary.warn,
      ltiWarnings: lti.summary.warnings,
      provider: provider.configured ? "Configured" : "Needs config",
      storageDecision: "Pending",
      totalGates: 7
    },
    productionAuth: [
      {
        detail: lti.trustBoundary,
        label: "Moodle/LTI trusted launch path",
        owner: "Technical Lead / LMS Administrator",
        status: lti.summary.warnings === 0 ? "ready" : "review"
      },
      {
        detail: admin.configured
          ? "Pilot token is configured; replace with institutional admin authentication before production."
          : "Pilot admin token is not configured.",
        label: "Admin authentication",
        owner: "Technical Lead",
        status: admin.configured ? "review" : "blocked"
      },
      {
        detail: "Map Moodle roles from validated LTI launch claims before trusting user context.",
        label: "Role authorization",
        owner: "Developer",
        status: "review"
      },
      {
        detail: "Define service account ownership, key rotation, session timeout, and secret rotation before production.",
        label: "Session and key rotation",
        owner: "System Administrator",
        status: "review"
      }
    ],
    readinessGate: [
      {
        detail: "LTI launch validation and role mapping must be implemented against a Moodle test site.",
        label: "Authentication approved",
        owner: "Technical Lead / LMS Administrator",
        status: "review"
      },
      {
        detail: "Approved storage and retention decisions are needed before production records are collected.",
        label: "Storage approved",
        owner: "Project Sponsor / Governance",
        status: "review"
      },
      {
        detail: "Pilot privacy notes exist; production privacy review remains required.",
        label: "Privacy approved",
        owner: "Governance Reviewer",
        status: "review"
      },
      {
        detail: "Provider and operational monitoring should be connected to IT support channels.",
        label: "Monitoring approved",
        owner: "System Administrator",
        status: provider.configured ? "review" : "blocked"
      },
      {
        detail: "Support triage owners, response templates, and escalation paths are now documented.",
        label: "Support model approved",
        owner: "Project Lead",
        status: "review"
      },
      {
        detail: "Hosted rollback guidance exists and should be rehearsed in the Windows VM environment.",
        label: "Rollback approved",
        owner: "System Administrator",
        status: "review"
      },
      {
        detail: `${deployment.summary.fail} deployment failure(s), accessibility ready: ${accessibility.readyForPilot}, KB ready: ${kbReview.readyForPilot}.`,
        label: "Moodle/LTI validation approved",
        owner: "Technical Lead / LMS Administrator",
        status:
          deployment.summary.fail === 0 &&
          accessibility.readyForPilot &&
          kbReview.readyForPilot
            ? "ready"
            : "review"
      }
    ]
  };
}

export async function renderPilotOutcomesPackHtml() {
  const outcomes = await buildPilotOutcomesLayer();

  return renderHtmlReport({
    generatedAt: outcomes.generatedAt,
    lede:
      "Evidence views for evaluating whether the FYEC100 pilot is helping students, where content gaps exist, and what must improve before scale.",
    title: "FYEC100 Pilot Analytics and Outcomes Pack",
    sections: [
      {
        id: "dashboard",
        title: "Pilot Outcomes Dashboard",
        body: [
          `<div class="metric-grid">
            ${metric("Feedback", outcomes.metrics.totalFeedback, "records")}
            ${metric("Helpful Rate", outcomes.metrics.helpfulRate, "student signal")}
            ${metric("Launches", outcomes.metrics.launches, "events")}
            ${metric("KB Gaps", outcomes.metrics.knowledgeBaseGaps, "pending")}
            ${metric("Integrity Events", outcomes.metrics.integrityEvents, "boundary")}
          </div>`,
          cards(outcomes.dashboard)
        ].join("")
      },
      {
        id: "content-gaps",
        title: "Content Gap Analysis Workspace",
        body: cards(outcomes.contentGaps.missingTopics)
      },
      {
        id: "student-success",
        title: "Student Success Insights",
        body: cards(outcomes.successInsights)
      },
      {
        id: "closeout",
        title: "Pilot Closeout Report",
        body: [
          callout(
            "Decision recommendation",
            outcomes.closeout.decisionRecommendation,
            "review"
          ),
          table(
            ["Closeout Area", "Evidence"],
            [
              ["What was tested", outcomes.closeout.tested.join("; ")],
              ["What worked", outcomes.closeout.worked.join("; ")],
              ["Needs improvement", outcomes.closeout.needsImprovement.join("; ")],
              ["Risks found", outcomes.closeout.risksFound.join("; ")],
              [
                "Next-phase recommendation",
                outcomes.closeout.nextPhaseRecommendation
              ]
            ]
          )
        ].join("")
      }
    ]
  });
}

export async function renderKnowledgeBaseContentOpsHtml() {
  const layer = await buildKnowledgeBaseContentOperationsLayer();

  return renderHtmlReport({
    generatedAt: layer.generatedAt,
    lede:
      "A staff-friendly knowledge base operations pack for authoring, comparing, approving, and quality-checking FYEC100 content updates.",
    title: "FYEC100 Knowledge Base Content Operations Pack",
    sections: [
      {
        id: "authoring",
        title: "Content Authoring Workspace",
        body: [metrics(layer.metrics), cards(layer.authoringQueue)].join("")
      },
      {
        id: "comparison",
        title: "Knowledge Base Version Comparison",
        body: cards(layer.versionComparison)
      },
      {
        id: "release",
        title: "Content Approval Release Flow",
        body: cards(layer.releaseFlow)
      },
      {
        id: "quality",
        title: "Knowledge Base Quality Checks",
        body: cards(layer.qualityChecks)
      }
    ]
  });
}

export async function renderStudentSupportOperationsHtml() {
  const layer = await buildStudentSupportOperationsLayer();

  return renderHtmlReport({
    generatedAt: layer.generatedAt,
    lede:
      "Support operations views for routing student feedback, using response templates, monitoring support load, and reviewing post-pilot needs.",
    title: "FYEC100 Student Support Operations Pack",
    sections: [
      {
        id: "queue",
        title: "Support Case Queue",
        body: [metrics(layer.metrics), cards(layer.caseQueue)].join("")
      },
      {
        id: "templates",
        title: "Support Response Templates",
        body: cards(layer.responseTemplates)
      },
      {
        id: "sla",
        title: "Support SLA Dashboard",
        body: cards(layer.sla)
      },
      {
        id: "review",
        title: "Post-Pilot Support Review",
        body: list(layer.postPilotReview)
      }
    ]
  });
}

export async function renderEnterpriseHardeningHtml() {
  const layer = await buildEnterpriseHardeningLayer();

  return renderHtmlReport({
    generatedAt: layer.generatedAt,
    lede:
      "Production hardening views for authentication, storage, audit logging, monitoring, and enterprise readiness gates.",
    title: "FYEC100 Enterprise Integration Hardening Pack",
    sections: [
      {
        id: "auth",
        title: "Production Authentication Plan",
        body: [metrics(layer.metrics), cards(layer.productionAuth)].join("")
      },
      {
        id: "retention",
        title: "Data Retention and Storage Decision Pack",
        body: cards(layer.dataRetention)
      },
      {
        id: "audit",
        title: "Audit Logging and Monitoring Plan",
        body: cards(layer.auditMonitoring)
      },
      {
        id: "gate",
        title: "Production Readiness Gate",
        body: cards(layer.readinessGate)
      }
    ]
  });
}

function cards(items: LayerRecord[]) {
  if (items.length === 0) {
    return `<p class="muted">No active items are currently recorded.</p>`;
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
