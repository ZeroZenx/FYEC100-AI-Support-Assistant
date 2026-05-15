import { readLaunchAuditSummary } from "@/lib/launchAudit";
import {
  type EscalationCategory,
  readPilotFeedbackRecords,
  readPilotFeedbackSummary
} from "@/lib/pilotFeedback";
import { readPilotSessionSummary } from "@/lib/pilotSessions";

type AnalyticsSignal = {
  label: string;
  owner: string;
  status: "ready" | "watch" | "review";
  text: string;
};

type AnalyticsSummary = {
  embeddedFeedback: number;
  escalationCandidates: number;
  helpfulRate: number;
  standaloneFeedback: number;
  totalFeedback: number;
  totalLaunches: number;
  totalSessions: number;
};

export async function buildPilotAnalytics() {
  const [feedbackSummary, feedbackRecords, launchAudit, pilotSessions] =
    await Promise.all([
      readPilotFeedbackSummary(),
      readPilotFeedbackRecords(),
      readLaunchAuditSummary(),
      readPilotSessionSummary()
    ]);
  const embeddedFeedback = feedbackRecords.filter(
    (record) => record.mode === "embedded"
  ).length;
  const standaloneFeedback = feedbackRecords.filter(
    (record) => record.mode === "standalone"
  ).length;
  const escalationCandidates =
    feedbackSummary.total - feedbackSummary.escalationCounts.none;
  const helpfulRate =
    feedbackSummary.total > 0
      ? Math.round((feedbackSummary.counts.helpful / feedbackSummary.total) * 100)
      : 0;
  const summary: AnalyticsSummary = {
    embeddedFeedback,
    escalationCandidates,
    helpfulRate,
    standaloneFeedback,
    totalFeedback: feedbackSummary.total,
    totalLaunches: launchAudit.total,
    totalSessions: pilotSessions.total
  };

  return {
    exportPath: "/api/admin/pilot-analytics.md",
    feedback: {
      counts: feedbackSummary.counts,
      escalationCounts: feedbackSummary.escalationCounts,
      latest: feedbackSummary.latest,
      modeCounts: {
        embedded: embeddedFeedback,
        standalone: standaloneFeedback
      },
      recommendedOwnerCounts: feedbackSummary.recommendedOwnerCounts,
      reviewQueue: feedbackSummary.reviewQueue
    },
    generatedAt: new Date().toISOString(),
    launchAudit: {
      countsByRole: launchAudit.countsByRole,
      countsBySource: launchAudit.countsBySource,
      latest: launchAudit.latest,
      total: launchAudit.total
    },
    pilotSessions: {
      nextSession: pilotSessions.nextSession,
      statusCounts: pilotSessions.statusCounts,
      total: pilotSessions.total
    },
    privacyNotice:
      "Pilot analytics use aggregate counts and short feedback excerpts only. They should not be treated as production analytics, student records, grades, or identity data.",
    riskSignals: buildRiskSignals({
      escalationCandidates,
      escalationCounts: feedbackSummary.escalationCounts,
      launchTotal: launchAudit.total,
      nextSessionMissing: !pilotSessions.nextSession,
      totalFeedback: feedbackSummary.total
    }),
    statusMessage:
      launchAudit.total > 0 || feedbackSummary.total > 0
        ? "Pilot analytics are available from local feedback, launch audit, and session files."
        : "Pilot analytics are ready, but no launch or feedback activity has been recorded yet.",
    summary
  };
}

export async function renderPilotAnalyticsMarkdown() {
  const analytics = await buildPilotAnalytics();

  return [
    "# FYEC100 Pilot Analytics Summary",
    "",
    `Generated: ${new Date(analytics.generatedAt).toLocaleString()}`,
    "",
    "## Overview",
    "",
    `- Total launches: ${analytics.summary.totalLaunches}`,
    `- Total feedback records: ${analytics.summary.totalFeedback}`,
    `- Embedded feedback: ${analytics.summary.embeddedFeedback}`,
    `- Standalone feedback: ${analytics.summary.standaloneFeedback}`,
    `- Helpful rate: ${analytics.summary.helpfulRate}%`,
    `- Escalation candidates: ${analytics.summary.escalationCandidates}`,
    `- Pilot sessions: ${analytics.summary.totalSessions}`,
    "",
    "## Launches By Role",
    "",
    ...formatCounts(analytics.launchAudit.countsByRole),
    "",
    "## Launches By Source",
    "",
    ...formatCounts(analytics.launchAudit.countsBySource),
    "",
    "## Feedback By Category",
    "",
    ...formatCounts(analytics.feedback.counts),
    "",
    "## Escalation Candidates",
    "",
    ...formatCounts(analytics.feedback.escalationCounts),
    "",
    "## Recommended Owner Counts",
    "",
    ...formatCounts(analytics.feedback.recommendedOwnerCounts),
    "",
    "## Risk Signals",
    "",
    ...analytics.riskSignals.map(
      (signal) =>
        `- [${signal.status}] ${signal.label} (${signal.owner}): ${signal.text}`
    ),
    "",
    "## Recent Launches",
    "",
    ...formatLaunches(analytics.launchAudit.latest),
    "",
    "## Review Queue",
    "",
    ...formatReviewItems(analytics.feedback.reviewQueue),
    "",
    "## Privacy Notice",
    "",
    analytics.privacyNotice,
    ""
  ].join("\n");
}

function buildRiskSignals({
  escalationCandidates,
  escalationCounts,
  launchTotal,
  nextSessionMissing,
  totalFeedback
}: {
  escalationCandidates: number;
  escalationCounts: Record<EscalationCategory, number>;
  launchTotal: number;
  nextSessionMissing: boolean;
  totalFeedback: number;
}): AnalyticsSignal[] {
  const signals: AnalyticsSignal[] = [];

  signals.push({
    label: "Pilot activity",
    owner: "Project Lead",
    status: launchTotal > 0 || totalFeedback > 0 ? "ready" : "watch",
    text:
      launchTotal > 0 || totalFeedback > 0
        ? "Launch or feedback activity is available for review."
        : "No launch or feedback activity has been captured yet."
  });

  signals.push({
    label: "Feedback escalation load",
    owner: "Pilot review team",
    status: escalationCandidates > 0 ? "review" : "ready",
    text:
      escalationCandidates > 0
        ? `${escalationCandidates} feedback item(s) should be reviewed before expanding the pilot.`
        : "No feedback escalation candidates are currently queued."
  });

  if (escalationCounts["academic-integrity"] > 0) {
    signals.push({
      label: "Academic integrity",
      owner: "Lecturer / Project Sponsor",
      status: "review",
      text: "Academic integrity feedback is present and should be reviewed by the lecturer or sponsor."
    });
  }

  if (escalationCounts["lms-administrator"] > 0) {
    signals.push({
      label: "Moodle support",
      owner: "LMS Administrator",
      status: "review",
      text: "Moodle navigation or access feedback is present."
    });
  }

  signals.push({
    label: "Next session",
    owner: "Project Lead / LMS Administrator",
    status: nextSessionMissing ? "watch" : "ready",
    text: nextSessionMissing
      ? "No upcoming pilot session is listed."
      : "A non-complete pilot session is available for planning."
  });

  return signals;
}

function formatCounts(counts: Record<string, number>) {
  const entries = Object.entries(counts);

  if (entries.length === 0) {
    return ["No counts recorded."];
  }

  return entries.map(([label, value]) => `- ${label}: ${value}`);
}

function formatLaunches(
  launches: Awaited<ReturnType<typeof readLaunchAuditSummary>>["latest"]
) {
  if (launches.length === 0) {
    return ["No recent launches recorded."];
  }

  return launches.slice(0, 5).map((launch) => {
    const date = new Date(launch.timestamp).toLocaleString();

    return `- ${date}: ${launch.context.courseShortName} / ${launch.context.role} / ${launch.context.launchSource}`;
  });
}

function formatReviewItems(
  items: Awaited<ReturnType<typeof readPilotFeedbackSummary>>["reviewQueue"]
) {
  if (items.length === 0) {
    return ["No review queue items recorded."];
  }

  return items.slice(0, 5).flatMap((item, index) => [
    `${index + 1}. ${item.escalationCategory ?? "none"} - ${
      item.escalationOwner ?? "Pilot review team"
    }`,
    `   - Rating: ${item.rating}`,
    `   - Question: ${item.studentQuestionExcerpt}`,
    `   - Reason: ${item.escalationReason ?? "No reason recorded."}`
  ]);
}
