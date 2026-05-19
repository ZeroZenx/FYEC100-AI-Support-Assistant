import { getEnterpriseStatus } from "@/lib/enterpriseStatus";
import {
  callout,
  list,
  metric,
  recordCard,
  renderHtmlReport,
  table
} from "@/lib/htmlReport";

export async function buildPilotDecisionPacket() {
  const status = await getEnterpriseStatus();
  const decision =
    status.pilotEvidence.goNoGo.status === "go"
      ? "Proceed with controlled pilot"
      : "Hold for review";
  const blockers = [
    ...status.adminActions.highPriorityOpen.map(
      (action) => `${action.id}: ${action.title} (${action.owner})`
    ),
    ...status.deploymentReadiness.checks
      .filter((check) => check.status === "fail")
      .map((check) => `${check.label}: ${check.message}`)
  ];

  return {
    blockers,
    decision,
    generatedAt: new Date().toISOString(),
    status,
    summary: {
      actionItems: status.adminActions.openActions.length,
      feedbackRecords: status.feedback.total,
      goNoGo: status.pilotEvidence.goNoGo.label,
      launchRecords: status.launchAudit.total,
      readinessWarnings: status.deploymentReadiness.summary.warn,
      supportQueue: status.supportTriage.summary.activeQueue
    }
  };
}

export async function renderPilotDecisionPacketHtml() {
  const packet = await buildPilotDecisionPacket();
  const { status } = packet;

  return renderHtmlReport({
    generatedAt: packet.generatedAt,
    lede:
      "A sponsor-ready decision packet that brings together readiness, risks, sign-off status, support readiness, and recommended next actions for the FYEC100 controlled pilot.",
    title: "FYEC100 Pilot Decision Packet",
    sections: [
      {
        id: "decision",
        title: "Decision Summary",
        body: [
          callout(packet.decision, status.pilotEvidence.goNoGo.message, status.pilotEvidence.goNoGo.status),
          `<div class="metric-grid">
            ${metric("Go / No-Go", status.pilotEvidence.goNoGo.status.toUpperCase(), status.pilotEvidence.goNoGo.label)}
            ${metric("Feedback", packet.summary.feedbackRecords, "records")}
            ${metric("Launches", packet.summary.launchRecords, "audit records")}
            ${metric("Support Queue", packet.summary.supportQueue, "items")}
            ${metric("Open Actions", packet.summary.actionItems, "items")}
            ${metric("Readiness Warnings", packet.summary.readinessWarnings, "checks")}
          </div>`
        ].join("")
      },
      {
        id: "evidence",
        title: "Evidence Signals",
        body: `<div class="record-grid">${status.pilotEvidence.signals
          .map((signal) =>
            recordCard({
              label: signal.label,
              meta: signal.owner,
              status: signal.status,
              text: signal.message
            })
          )
          .join("")}</div>`
      },
      {
        id: "risks",
        title: "Risks And Blockers",
        body:
          packet.blockers.length > 0
            ? list(packet.blockers)
            : callout("No blocking items recorded", "Continue reviewing warnings before wider pilot use.", "ready")
      },
      {
        id: "signoff",
        title: "Sign-Off And Ownership",
        body: table(
          ["Area", "Status", "Owner", "Evidence"],
          [
            [
              "Project sign-off",
              status.pilotSignoff.record.decisionStatus,
              "Project Sponsor / Project Team",
              status.pilotSignoff.statusMessage
            ],
            [
              "Knowledge base",
              status.knowledgeBase.review.record.approvalStatus,
              status.knowledgeBase.review.record.contentOwner,
              status.knowledgeBase.review.statusMessage
            ],
            [
              "Accessibility",
              status.accessibilityUsabilityReview.record.reviewStatus,
              status.accessibilityUsabilityReview.record.reviewer || "Developer / LMS Administrator",
              status.accessibilityUsabilityReview.statusMessage
            ],
            [
              "Hosted deployment",
              status.hostedDeploymentPack.summary.readinessFailures > 0
                ? "blocked"
                : "review",
              "Technical Lead / System Administrator",
              status.hostedDeploymentPack.statusMessage
            ]
          ]
        )
      },
      {
        id: "actions",
        title: "Recommended Actions",
        body: `<div class="record-grid">${status.pilotEvidence.recommendedActions
          .map((action) =>
            recordCard({
              label: action.owner,
              meta: "Recommended owner",
              status: "watch",
              text: action.text
            })
          )
          .join("")}</div>`
      }
    ]
  });
}
