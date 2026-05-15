import { readFile, stat } from "fs/promises";
import path from "path";

const REVIEW_PATH = path.join(
  process.cwd(),
  "data",
  "accessibility-usability-review.json"
);

export type AccessibilityReviewStatus =
  | "fail"
  | "pass"
  | "pending"
  | "watch";

export type AccessibilityReviewCheck = {
  category: string;
  evidence: string;
  id: string;
  label: string;
  owner: string;
  recommendedAction: string;
  status: AccessibilityReviewStatus;
};

export type AccessibilityUsabilityReviewRecord = {
  checks: AccessibilityReviewCheck[];
  governanceNotes: string[];
  lastReviewedAt: string;
  reviewer: string;
  reviewStatus: "approved" | "changes-requested" | "pending-review";
  targetExperience: string;
  version: string;
};

export async function getAccessibilityUsabilityReview() {
  const [record, stats] = await Promise.all([
    readAccessibilityReviewRecord(),
    stat(REVIEW_PATH)
  ]);
  const summary = countStatuses(record.checks);
  const categories = countCategories(record.checks);
  const readyForPilot =
    record.reviewStatus === "approved" &&
    summary.fail === 0 &&
    summary.pending === 0;

  return {
    categories,
    exportPath: "/api/admin/accessibility-usability.md",
    readyForPilot,
    record,
    reviewFile: {
      lastUpdated: stats.mtime.toISOString(),
      path: "data/accessibility-usability-review.json",
      sizeBytes: stats.size
    },
    statusMessage: readyForPilot
      ? "Accessibility and Moodle usability review is approved for controlled pilot use."
      : "Accessibility and Moodle usability review is not complete. Resolve pending checks before wider pilot use.",
    summary
  };
}

export async function renderAccessibilityUsabilityMarkdown() {
  const review = await getAccessibilityUsabilityReview();

  return [
    "# FYEC100 Accessibility and Moodle Usability Review",
    "",
    `- Version: ${review.record.version}`,
    `- Target experience: ${review.record.targetExperience}`,
    `- Review status: ${review.record.reviewStatus}`,
    `- Ready for pilot: ${review.readyForPilot ? "Yes" : "No"}`,
    `- Reviewer: ${review.record.reviewer || "Not recorded"}`,
    `- Last reviewed: ${review.record.lastReviewedAt || "Not recorded"}`,
    `- Review file: ${review.reviewFile.path}`,
    "",
    "## Summary",
    "",
    `- Pass: ${review.summary.pass}`,
    `- Watch: ${review.summary.watch}`,
    `- Pending: ${review.summary.pending}`,
    `- Fail: ${review.summary.fail}`,
    "",
    "## Checks",
    "",
    ...review.record.checks.flatMap((check) => [
      `### ${check.id}: ${check.label}`,
      "",
      `- Category: ${check.category}`,
      `- Owner: ${check.owner}`,
      `- Status: ${check.status}`,
      `- Evidence: ${check.evidence}`,
      `- Recommended action: ${check.recommendedAction}`,
      ""
    ]),
    "## Governance Notes",
    "",
    ...review.record.governanceNotes.map((note) => `- ${note}`),
    ""
  ].join("\n");
}

async function readAccessibilityReviewRecord(): Promise<AccessibilityUsabilityReviewRecord> {
  const content = await readFile(REVIEW_PATH, "utf8");
  const parsed = JSON.parse(content) as AccessibilityUsabilityReviewRecord;

  return {
    checks: Array.isArray(parsed.checks)
      ? parsed.checks.map(normalizeCheck)
      : [],
    governanceNotes: Array.isArray(parsed.governanceNotes)
      ? parsed.governanceNotes
      : [],
    lastReviewedAt: parsed.lastReviewedAt || "",
    reviewer: parsed.reviewer || "",
    reviewStatus: normalizeReviewStatus(parsed.reviewStatus),
    targetExperience:
      parsed.targetExperience || "FYEC100 assistant embedded in Moodle",
    version: parsed.version || "accessibility-usability-review"
  };
}

function normalizeCheck(
  check: AccessibilityReviewCheck
): AccessibilityReviewCheck {
  return {
    category: check.category || "General",
    evidence: check.evidence || "",
    id: check.id || "A11Y",
    label: check.label || "Accessibility review check",
    owner: check.owner || "Project team",
    recommendedAction: check.recommendedAction || "",
    status: normalizeCheckStatus(check.status)
  };
}

function normalizeCheckStatus(value: string): AccessibilityReviewStatus {
  const statuses: AccessibilityReviewStatus[] = [
    "fail",
    "pass",
    "pending",
    "watch"
  ];

  return statuses.includes(value as AccessibilityReviewStatus)
    ? (value as AccessibilityReviewStatus)
    : "pending";
}

function normalizeReviewStatus(
  value: string
): AccessibilityUsabilityReviewRecord["reviewStatus"] {
  const statuses: AccessibilityUsabilityReviewRecord["reviewStatus"][] = [
    "approved",
    "changes-requested",
    "pending-review"
  ];

  return statuses.includes(
    value as AccessibilityUsabilityReviewRecord["reviewStatus"]
  )
    ? (value as AccessibilityUsabilityReviewRecord["reviewStatus"])
    : "pending-review";
}

function countStatuses(checks: AccessibilityReviewCheck[]) {
  return {
    fail: checks.filter((check) => check.status === "fail").length,
    pass: checks.filter((check) => check.status === "pass").length,
    pending: checks.filter((check) => check.status === "pending").length,
    watch: checks.filter((check) => check.status === "watch").length
  };
}

function countCategories(checks: AccessibilityReviewCheck[]) {
  return checks.reduce<Record<string, number>>((counts, check) => {
    counts[check.category] = (counts[check.category] ?? 0) + 1;
    return counts;
  }, {});
}
