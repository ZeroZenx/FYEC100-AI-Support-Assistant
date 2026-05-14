import { readFile, stat } from "fs/promises";
import path from "path";
import { getKnowledgeBaseMetadata } from "@/lib/knowledgeBase";

const REVIEW_PATH = path.join(process.cwd(), "data", "knowledge-base-review.json");

export type KnowledgeBaseApprovalStatus =
  | "approved-for-pilot"
  | "changes-requested"
  | "pending-review";

export type KnowledgeBaseReviewRecord = {
  approvalStatus: KnowledgeBaseApprovalStatus;
  contentOwner: string;
  knowledgeBasePath: string;
  lastReviewedAt: string;
  notes: string[];
  reviewerName: string;
  reviewerRole: string;
  revision: string;
  versionLabel: string;
};

export async function getKnowledgeBaseReviewStatus() {
  const [record, metadata, reviewStats] = await Promise.all([
    readKnowledgeBaseReviewRecord(),
    getKnowledgeBaseMetadata(),
    stat(REVIEW_PATH)
  ]);
  const approved = record.approvalStatus === "approved-for-pilot";
  const hasReviewer = Boolean(record.reviewerName.trim());
  const hasReviewDate = Boolean(record.lastReviewedAt.trim());
  const readyForPilot = approved && hasReviewer && hasReviewDate;

  return {
    approved,
    exportPath: "/api/admin/knowledge-base/review.md",
    hasReviewDate,
    hasReviewer,
    metadata,
    record,
    readyForPilot,
    reviewFile: {
      lastUpdated: reviewStats.mtime.toISOString(),
      path: "data/knowledge-base-review.json",
      sizeBytes: reviewStats.size
    },
    statusMessage: readyForPilot
      ? "Knowledge base review is approved for controlled pilot use."
      : "Knowledge base review is not complete for hosted pilot use."
  };
}

export async function buildKnowledgeBaseReviewMarkdown() {
  const status = await getKnowledgeBaseReviewStatus();

  return [
    "# FYEC100 Knowledge Base Review",
    "",
    `- Status: ${status.record.approvalStatus}`,
    `- Ready for pilot: ${status.readyForPilot ? "Yes" : "No"}`,
    `- Version: ${status.record.versionLabel}`,
    `- Revision: ${status.record.revision}`,
    `- Content owner: ${status.record.contentOwner}`,
    `- Reviewer: ${status.record.reviewerName || "Not recorded"}`,
    `- Reviewer role: ${status.record.reviewerRole}`,
    `- Last reviewed: ${status.record.lastReviewedAt || "Not recorded"}`,
    `- Knowledge base path: ${status.record.knowledgeBasePath}`,
    `- Review record path: ${status.reviewFile.path}`,
    "",
    "## Content Metrics",
    "",
    `- Words: ${status.metadata.wordCount}`,
    `- Sections: ${status.metadata.headings.length}`,
    `- Lines: ${status.metadata.lineCount}`,
    `- Characters: ${status.metadata.characterCount}`,
    "",
    "## Notes",
    "",
    ...status.record.notes.map((note) => `- ${note}`),
    "",
    "## Section Headings",
    "",
    ...status.metadata.headings.map(
      (heading) => `- H${heading.level}: ${heading.title}`
    ),
    "",
    "## Governance Notice",
    "",
    "This review export is a Phase 2 governance artifact for controlled pilot planning. It is not a production content-management system."
  ].join("\n");
}

async function readKnowledgeBaseReviewRecord(): Promise<KnowledgeBaseReviewRecord> {
  const content = await readFile(REVIEW_PATH, "utf8");
  const parsed = JSON.parse(content) as KnowledgeBaseReviewRecord;

  return {
    approvalStatus: normalizeApprovalStatus(parsed.approvalStatus),
    contentOwner: parsed.contentOwner || "FYEC100 Lecturer / Content Owner",
    knowledgeBasePath:
      parsed.knowledgeBasePath || "data/fyec100-knowledge-base.md",
    lastReviewedAt: parsed.lastReviewedAt || "",
    notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    reviewerName: parsed.reviewerName || "",
    reviewerRole: parsed.reviewerRole || "Lecturer / Content Owner",
    revision: parsed.revision || "unversioned",
    versionLabel: parsed.versionLabel || "FYEC100 pilot knowledge base"
  };
}

function normalizeApprovalStatus(value: string): KnowledgeBaseApprovalStatus {
  const validStatuses: KnowledgeBaseApprovalStatus[] = [
    "approved-for-pilot",
    "changes-requested",
    "pending-review"
  ];

  return validStatuses.includes(value as KnowledgeBaseApprovalStatus)
    ? (value as KnowledgeBaseApprovalStatus)
    : "pending-review";
}
