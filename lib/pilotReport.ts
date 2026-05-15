import {
  type EscalationCategory,
  type PilotFeedbackRecord,
  readPilotFeedbackSummary
} from "@/lib/pilotFeedback";

type ReportAction = {
  owner: string;
  priority: "high" | "medium" | "low";
  text: string;
};

export type PilotReport = {
  generatedAt: string;
  overview: {
    helpfulRate: number;
    totalFeedback: number;
    totalEscalations: number;
  };
  counts: Awaited<ReturnType<typeof readPilotFeedbackSummary>>["counts"];
  escalationCounts: Record<EscalationCategory, number>;
  recommendedOwnerCounts: Awaited<
    ReturnType<typeof readPilotFeedbackSummary>
  >["recommendedOwnerCounts"];
  topReviewItems: PilotFeedbackRecord[];
  knowledgeBaseCandidates: PilotFeedbackRecord[];
  technicalIssues: PilotFeedbackRecord[];
  lecturerFollowUps: PilotFeedbackRecord[];
  lmsAdministratorItems: PilotFeedbackRecord[];
  suggestedActions: ReportAction[];
  privacyNotice: string;
};

export async function buildPilotReport(): Promise<PilotReport> {
  const feedback = await readPilotFeedbackSummary();
  const reviewItems = feedback.reviewQueue;
  const helpfulRate =
    feedback.total > 0
      ? Math.round((feedback.counts.helpful / feedback.total) * 100)
      : 0;
  const totalEscalations =
    feedback.total - feedback.escalationCounts.none;

  return {
    generatedAt: new Date().toISOString(),
    overview: {
      helpfulRate,
      totalFeedback: feedback.total,
      totalEscalations
    },
    counts: feedback.counts,
    escalationCounts: feedback.escalationCounts,
    recommendedOwnerCounts: feedback.recommendedOwnerCounts,
    topReviewItems: reviewItems.slice(0, 5),
    knowledgeBaseCandidates: filterByCategory(
      reviewItems,
      "knowledge-base-update"
    ),
    technicalIssues: filterByCategory(reviewItems, "technical-provider-issue"),
    lecturerFollowUps: filterByCategory(reviewItems, "lecturer-follow-up"),
    lmsAdministratorItems: filterByCategory(reviewItems, "lms-administrator"),
    suggestedActions: buildSuggestedActions(feedback),
    privacyNotice:
      "Pilot reports use short excerpts only and must not be treated as student records, grading evidence, or a production analytics export."
  };
}

export function renderPilotReportMarkdown(report: PilotReport) {
  const lines = [
    "# FYEC100 AI Support Assistant Pilot Report",
    "",
    `Generated: ${new Date(report.generatedAt).toLocaleString()}`,
    "",
    "## Overview",
    "",
    `- Total feedback: ${report.overview.totalFeedback}`,
    `- Helpful rate: ${report.overview.helpfulRate}%`,
    `- Total escalation candidates: ${report.overview.totalEscalations}`,
    "",
    "## Feedback Counts",
    "",
    `- Helpful: ${report.counts.helpful}`,
    `- Not helpful: ${report.counts["not-helpful"]}`,
    `- LMS/navigation issue: ${report.counts["lms-navigation-issue"]}`,
    `- Missing course information: ${report.counts["missing-course-information"]}`,
    `- Academic integrity concern: ${report.counts["academic-integrity-concern"]}`,
    `- Technical issue: ${report.counts["technical-issue"]}`,
    `- Lecturer follow-up: ${report.counts["lecturer-follow-up"]}`,
    "",
    "## Escalation Counts",
    "",
    ...Object.entries(report.escalationCounts).map(
      ([category, value]) => `- ${category}: ${value}`
    ),
    "",
    "## Recommended Owner Counts",
    "",
    ...Object.entries(report.recommendedOwnerCounts).map(
      ([owner, value]) => `- ${owner}: ${value}`
    ),
    "",
    "## Suggested Actions",
    "",
    ...formatActions(report.suggestedActions),
    "",
    "## Top Review Items",
    "",
    ...formatItems(report.topReviewItems),
    "",
    "## Knowledge Base Update Candidates",
    "",
    ...formatItems(report.knowledgeBaseCandidates),
    "",
    "## Technical Issues",
    "",
    ...formatItems(report.technicalIssues),
    "",
    "## Privacy Notice",
    "",
    report.privacyNotice,
    ""
  ];

  return lines.join("\n");
}

function buildSuggestedActions(
  feedback: Awaited<ReturnType<typeof readPilotFeedbackSummary>>
): ReportAction[] {
  const actions: ReportAction[] = [];

  if (feedback.escalationCounts["lecturer-follow-up"] > 0) {
    actions.push({
      owner: "Lecturer / Project Lead",
      priority: "high",
      text: "Review lecturer follow-up items before expanding the Moodle pilot group."
    });
  }

  if (feedback.escalationCounts["lms-administrator"] > 0) {
    actions.push({
      owner: "LMS Administrator",
      priority: "high",
      text: "Check Moodle access, navigation, and course shell issues before the next pilot session."
    });
  }

  if (feedback.escalationCounts["knowledge-base-update"] > 0) {
    actions.push({
      owner: "Developer / Lecturer reviewer",
      priority: "medium",
      text: "Review repeated missing-answer or unclear-answer reports and update the FYEC100 knowledge base where approved."
    });
  }

  if (feedback.escalationCounts["technical-provider-issue"] > 0) {
    actions.push({
      owner: "Technical Lead / System Administrator",
      priority: "medium",
      text: "Review AI provider setup, server reliability, and local environment warnings."
    });
  }

  if (feedback.escalationCounts["academic-integrity"] > 0) {
    actions.push({
      owner: "Lecturer / Project Sponsor",
      priority: "high",
      text: "Review academic integrity feedback and reinforce student-facing responsible-use guidance."
    });
  }

  if (feedback.total === 0) {
    actions.push({
      owner: "Pilot review team",
      priority: "low",
      text: "Run a controlled Moodle pilot session and collect initial student feedback."
    });
  }

  if (actions.length === 0) {
    actions.push({
      owner: "Pilot review team",
      priority: "low",
      text: "Continue monitoring feedback after each pilot session."
    });
  }

  return actions;
}

function filterByCategory(
  records: PilotFeedbackRecord[],
  category: EscalationCategory
) {
  return records.filter((record) => record.escalationCategory === category);
}

function formatActions(actions: ReportAction[]) {
  if (actions.length === 0) {
    return ["No suggested actions at this time."];
  }

  return actions.map(
    (action) => `- [${action.priority}] ${action.owner}: ${action.text}`
  );
}

function formatItems(items: PilotFeedbackRecord[]) {
  if (items.length === 0) {
    return ["No items in this section."];
  }

  return items.flatMap((item, index) => [
    `${index + 1}. ${item.escalationCategory ?? "none"} - ${
      item.escalationOwner ?? "Pilot review team"
    }`,
    `   - Rating: ${item.rating}`,
    `   - Feedback category: ${item.feedbackCategory ?? item.rating}`,
    `   - Question: ${item.studentQuestionExcerpt}`,
    `   - Reason: ${item.escalationReason ?? "No reason recorded."}`,
    item.note ? `   - Note: ${item.note}` : ""
  ]).filter(Boolean);
}
