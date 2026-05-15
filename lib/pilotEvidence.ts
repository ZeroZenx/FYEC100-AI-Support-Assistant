import { getAccessibilityUsabilityReview } from "@/lib/accessibilityUsabilityReview";
import { getDeploymentReadiness } from "@/lib/deploymentReadiness";
import { getKnowledgeBaseReviewStatus } from "@/lib/knowledgeBaseReview";
import { readLaunchAuditSummary } from "@/lib/launchAudit";
import { getLtiReadiness } from "@/lib/ltiReadiness";
import { getMoodleBlockPluginStatus } from "@/lib/moodleBlockPlugin";
import { getMoodleIntegrationDecision } from "@/lib/moodleIntegrationDecision";
import { buildPilotReport } from "@/lib/pilotReport";
import { readPilotFeedbackSummary } from "@/lib/pilotFeedback";

export type PilotEvidenceStatus = "ready" | "watch" | "blocked";
export type PilotGoNoGoStatus = "go" | "hold";

export type PilotEvidenceSignal = {
  label: string;
  message: string;
  owner: string;
  status: PilotEvidenceStatus;
};

type PilotEvidenceAction = {
  owner: string;
  text: string;
};

export type PilotEvidenceDashboard = {
  generatedAt: string;
  goNoGo: {
    label: string;
    message: string;
    status: PilotGoNoGoStatus;
  };
  metrics: {
    feedbackTotal: number;
    helpfulRate: number;
    launchAuditTotal: number;
    ltiWarnings: number;
    readinessFailures: number;
    readinessWarnings: number;
    reviewQueueItems: number;
  };
  privacyNotice: string;
  recommendedActions: PilotEvidenceAction[];
  signals: PilotEvidenceSignal[];
  summary: Record<PilotEvidenceStatus, number>;
};

export async function buildPilotEvidenceDashboard(): Promise<PilotEvidenceDashboard> {
  const [
    deploymentReadiness,
    knowledgeBaseReview,
    pilotReport,
    feedback,
    launchAudit,
    integrationDecision,
    moodleBlockPlugin,
    ltiReadiness,
    accessibilityUsabilityReview
  ] = await Promise.all([
    getDeploymentReadiness(),
    getKnowledgeBaseReviewStatus(),
    buildPilotReport(),
    readPilotFeedbackSummary(),
    readLaunchAuditSummary(),
    Promise.resolve(getMoodleIntegrationDecision()),
    getMoodleBlockPluginStatus(),
    Promise.resolve(getLtiReadiness()),
    getAccessibilityUsabilityReview()
  ]);

  const signals: PilotEvidenceSignal[] = [
    {
      label: "Deployment readiness",
      message:
        deploymentReadiness.summary.fail === 0
          ? `${deploymentReadiness.summary.warn} warning(s) remain before hosted Moodle use.`
          : `${deploymentReadiness.summary.fail} blocking deployment check(s) must be resolved.`,
      owner: "Technical Lead / System Administrator",
      status: deploymentReadiness.summary.fail === 0 ? "watch" : "blocked"
    },
    {
      label: "Knowledge base approval",
      message: knowledgeBaseReview.statusMessage,
      owner: "Lecturer / Content Owner",
      status: knowledgeBaseReview.readyForPilot ? "ready" : "watch"
    },
    {
      label: "Student feedback evidence",
      message:
        feedback.total > 0
          ? `${feedback.total} feedback record(s) captured for pilot review.`
          : "Run a controlled pilot session and collect initial student feedback.",
      owner: "Pilot Review Team",
      status: feedback.total > 0 ? "ready" : "watch"
    },
    {
      label: "Moodle launch evidence",
      message:
        launchAudit.total > 0
          ? `${launchAudit.total} Moodle launch audit record(s) captured.`
          : "Open the assistant from the Moodle pilot shell to capture launch evidence.",
      owner: "LMS Administrator",
      status: launchAudit.total > 0 ? "ready" : "watch"
    },
    {
      label: "Moodle integration path",
      message: integrationDecision.summary,
      owner: "Project Sponsor / Project Lead",
      status:
        integrationDecision.recommendedOption.id === "iframe"
          ? "ready"
          : "watch"
    },
    {
      label: "Moodle block scaffold",
      message: moodleBlockPlugin.readyForLmsReview
        ? "Moodle block scaffold is ready for LMS administrator review."
        : `${moodleBlockPlugin.missingFiles.length} Moodle block file(s) are missing.`,
      owner: "LMS Administrator / Developer",
      status: moodleBlockPlugin.readyForLmsReview ? "ready" : "watch"
    },
    {
      label: "Accessibility and Moodle usability review",
      message: accessibilityUsabilityReview.statusMessage,
      owner: "Developer / LMS Administrator",
      status: accessibilityUsabilityReview.readyForPilot ? "ready" : "watch"
    },
    {
      label: "LTI 1.3 readiness",
      message:
        ltiReadiness.summary.warnings === 0
          ? "LTI scaffold checks are configured."
          : `${ltiReadiness.summary.warnings} LTI planning warning(s) remain for enterprise launch.`,
      owner: "Technical Lead / System Administrator",
      status: ltiReadiness.summary.warnings === 0 ? "ready" : "watch"
    }
  ];

  const summary = countSignals(signals);
  const goNoGoStatus: PilotGoNoGoStatus =
    summary.blocked === 0 &&
    knowledgeBaseReview.readyForPilot &&
    feedback.total > 0 &&
    launchAudit.total > 0
      ? "go"
      : "hold";

  return {
    generatedAt: new Date().toISOString(),
    goNoGo: {
      label: goNoGoStatus === "go" ? "Ready for controlled pilot" : "Hold for review",
      message:
        goNoGoStatus === "go"
          ? "Core evidence is available for a controlled Moodle pilot decision."
          : "Resolve review items and capture pilot evidence before expanding use.",
      status: goNoGoStatus
    },
    metrics: {
      feedbackTotal: feedback.total,
      helpfulRate: pilotReport.overview.helpfulRate,
      launchAuditTotal: launchAudit.total,
      ltiWarnings: ltiReadiness.summary.warnings,
      readinessFailures: deploymentReadiness.summary.fail,
      readinessWarnings: deploymentReadiness.summary.warn,
      reviewQueueItems: feedback.reviewQueue.length
    },
    privacyNotice:
      "Pilot evidence is an internal governance snapshot. It should not include names, grades, student identifiers, or production analytics claims.",
    recommendedActions: buildRecommendedActions({
      feedbackTotal: feedback.total,
      knowledgeBaseReady: knowledgeBaseReview.readyForPilot,
      launchAuditTotal: launchAudit.total,
      readinessFailures: deploymentReadiness.summary.fail,
      readinessWarnings: deploymentReadiness.summary.warn
    }),
    signals,
    summary
  };
}

export function renderPilotEvidenceMarkdown(report: PilotEvidenceDashboard) {
  return [
    "# FYEC100 Pilot Evidence Dashboard",
    "",
    `Generated: ${new Date(report.generatedAt).toLocaleString()}`,
    "",
    "## Go / No-Go",
    "",
    `- Status: ${report.goNoGo.status}`,
    `- Label: ${report.goNoGo.label}`,
    `- Message: ${report.goNoGo.message}`,
    "",
    "## Summary",
    "",
    `- Ready: ${report.summary.ready}`,
    `- Watch: ${report.summary.watch}`,
    `- Blocked: ${report.summary.blocked}`,
    `- Feedback records: ${report.metrics.feedbackTotal}`,
    `- Helpful rate: ${report.metrics.helpfulRate}%`,
    `- Moodle launches: ${report.metrics.launchAuditTotal}`,
    `- Review queue items: ${report.metrics.reviewQueueItems}`,
    "",
    "## Evidence Signals",
    "",
    ...report.signals.flatMap((signal) => [
      `### ${signal.label}`,
      "",
      `- Status: ${signal.status}`,
      `- Owner: ${signal.owner}`,
      `- Evidence: ${signal.message}`,
      ""
    ]),
    "## Recommended Actions",
    "",
    ...report.recommendedActions.map(
      (action) => `- ${action.owner}: ${action.text}`
    ),
    "",
    "## Privacy Notice",
    "",
    report.privacyNotice,
    ""
  ].join("\n");
}

function countSignals(signals: PilotEvidenceSignal[]) {
  return {
    blocked: signals.filter((signal) => signal.status === "blocked").length,
    ready: signals.filter((signal) => signal.status === "ready").length,
    watch: signals.filter((signal) => signal.status === "watch").length
  };
}

function buildRecommendedActions(input: {
  feedbackTotal: number;
  knowledgeBaseReady: boolean;
  launchAuditTotal: number;
  readinessFailures: number;
  readinessWarnings: number;
}): PilotEvidenceAction[] {
  const actions: PilotEvidenceAction[] = [];

  if (input.readinessFailures > 0) {
    actions.push({
      owner: "Technical Lead / System Administrator",
      text: "Resolve failed deployment readiness checks before any hosted pilot."
    });
  }

  if (!input.knowledgeBaseReady) {
    actions.push({
      owner: "Lecturer / Content Owner",
      text: "Complete and record knowledge base review approval before wider student use."
    });
  }

  if (input.launchAuditTotal === 0) {
    actions.push({
      owner: "LMS Administrator",
      text: "Launch the assistant from the Moodle pilot shell to capture launch audit evidence."
    });
  }

  if (input.feedbackTotal === 0) {
    actions.push({
      owner: "Pilot Review Team",
      text: "Collect student feedback from a controlled pilot session."
    });
  }

  if (input.readinessWarnings > 0) {
    actions.push({
      owner: "Project Lead",
      text: "Review remaining readiness warnings and decide which are acceptable for a controlled pilot."
    });
  }

  if (actions.length === 0) {
    actions.push({
      owner: "Project Sponsor / Project Lead",
      text: "Review the evidence snapshot and approve the next controlled pilot step."
    });
  }

  return actions;
}
