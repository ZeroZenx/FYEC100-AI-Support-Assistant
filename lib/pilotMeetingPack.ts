import { getDeploymentReadiness } from "@/lib/deploymentReadiness";
import { getKnowledgeBaseReviewStatus } from "@/lib/knowledgeBaseReview";
import { readLaunchAuditSummary } from "@/lib/launchAudit";
import { getMoodleIntegrationDecision } from "@/lib/moodleIntegrationDecision";
import { buildPilotEvidenceDashboard } from "@/lib/pilotEvidence";
import { buildPilotReport } from "@/lib/pilotReport";
import { getPilotSignoffStatus } from "@/lib/pilotSignoff";

type MeetingPackAction = {
  owner: string;
  text: string;
};

export async function buildPilotMeetingPack() {
  const [
    evidence,
    signoff,
    deploymentReadiness,
    pilotReport,
    launchAudit,
    knowledgeBaseReview,
    integrationDecision
  ] = await Promise.all([
    buildPilotEvidenceDashboard(),
    getPilotSignoffStatus(),
    getDeploymentReadiness(),
    buildPilotReport(),
    readLaunchAuditSummary(),
    getKnowledgeBaseReviewStatus(),
    Promise.resolve(getMoodleIntegrationDecision())
  ]);

  const blockers = [
    deploymentReadiness.summary.fail > 0
      ? `${deploymentReadiness.summary.fail} failed deployment readiness check(s)`
      : "",
    !knowledgeBaseReview.readyForPilot
      ? "Knowledge base approval is not complete"
      : "",
    !signoff.approvedForControlledPilot
      ? "Project-team sign-off is not complete"
      : ""
  ].filter(Boolean);

  const decisions = [
    "Confirm whether the next FYEC100 pilot remains iframe-based or moves to Moodle block testing.",
    "Confirm which readiness warnings are acceptable for a controlled Moodle pilot.",
    "Confirm whether knowledge base review and sign-off are complete enough to expand the pilot group."
  ];

  return {
    blockers,
    decisions,
    deploymentReadiness,
    evidence,
    generatedAt: new Date().toISOString(),
    integrationDecision,
    knowledgeBaseReview,
    launchAudit,
    meetingPurpose:
      "Project-team briefing for the FYEC100 AI Support Assistant controlled Moodle pilot.",
    pilotReport,
    privacyNotice:
      "This meeting pack is an internal planning artifact. It must not be treated as a student record, grade report, or production analytics export.",
    recommendedActions: buildRecommendedActions({
      evidenceActions: evidence.recommendedActions,
      hasBlockers: blockers.length > 0,
      signoffPending: !signoff.approvedForControlledPilot
    }),
    signoff,
    summary: {
      evidenceStatus: evidence.goNoGo.label,
      feedbackTotal: pilotReport.overview.totalFeedback,
      helpfulRate: pilotReport.overview.helpfulRate,
      launchAuditTotal: launchAudit.total,
      readinessFailures: deploymentReadiness.summary.fail,
      readinessWarnings: deploymentReadiness.summary.warn,
      signoffStatus: signoff.record.decisionStatus
    }
  };
}

export async function renderPilotMeetingPackMarkdown() {
  const pack = await buildPilotMeetingPack();

  return [
    "# FYEC100 Pilot Meeting Pack",
    "",
    `Generated: ${new Date(pack.generatedAt).toLocaleString()}`,
    "",
    "## Purpose",
    "",
    pack.meetingPurpose,
    "",
    "## Executive Snapshot",
    "",
    `- Evidence status: ${pack.summary.evidenceStatus}`,
    `- Sign-off status: ${pack.summary.signoffStatus}`,
    `- Deployment readiness failures: ${pack.summary.readinessFailures}`,
    `- Deployment readiness warnings: ${pack.summary.readinessWarnings}`,
    `- Feedback records: ${pack.summary.feedbackTotal}`,
    `- Helpful rate: ${pack.summary.helpfulRate}%`,
    `- Moodle launch audit records: ${pack.summary.launchAuditTotal}`,
    "",
    "## Blockers",
    "",
    ...formatList(pack.blockers, "No blockers recorded in this pack."),
    "",
    "## Decisions Needed",
    "",
    ...pack.decisions.map((decision) => `- ${decision}`),
    "",
    "## Recommended Actions",
    "",
    ...pack.recommendedActions.map(
      (action) => `- ${action.owner}: ${action.text}`
    ),
    "",
    "## Pilot Evidence Signals",
    "",
    ...pack.evidence.signals.map(
      (signal) => `- [${signal.status}] ${signal.label}: ${signal.message}`
    ),
    "",
    "## Sign-off Summary",
    "",
    `- Approved: ${pack.signoff.counts.approved}`,
    `- Pending: ${pack.signoff.counts.pending}`,
    `- Changes requested: ${pack.signoff.counts.changesRequested}`,
    "",
    "## Knowledge Base Review",
    "",
    `- Status: ${pack.knowledgeBaseReview.record.approvalStatus}`,
    `- Ready for pilot: ${pack.knowledgeBaseReview.readyForPilot ? "Yes" : "No"}`,
    `- Reviewer: ${
      pack.knowledgeBaseReview.record.reviewerName || "Not recorded"
    }`,
    "",
    "## Moodle Integration Recommendation",
    "",
    `- Recommended option: ${pack.integrationDecision.recommendedOption.label}`,
    `- Summary: ${pack.integrationDecision.summary}`,
    "",
    "## Launch Audit",
    "",
    `- Total records: ${pack.launchAudit.total}`,
    `- Source counts: ${JSON.stringify(pack.launchAudit.countsBySource)}`,
    `- Role counts: ${JSON.stringify(pack.launchAudit.countsByRole)}`,
    "",
    "## Privacy Notice",
    "",
    pack.privacyNotice,
    ""
  ].join("\n");
}

function buildRecommendedActions(input: {
  evidenceActions: MeetingPackAction[];
  hasBlockers: boolean;
  signoffPending: boolean;
}) {
  const actions = [...input.evidenceActions];

  if (input.hasBlockers) {
    actions.unshift({
      owner: "Project Lead",
      text: "Resolve or explicitly accept blockers before expanding the pilot."
    });
  }

  if (input.signoffPending) {
    actions.push({
      owner: "Project Sponsor / Project Team",
      text: "Complete the pilot sign-off pack after reviewing the evidence snapshot."
    });
  }

  return actions;
}

function formatList(items: string[], emptyMessage: string) {
  return items.length > 0 ? items.map((item) => `- ${item}`) : [emptyMessage];
}
