import { readFile, stat } from "fs/promises";
import path from "path";
import { getKnowledgeBaseChangeRequests } from "@/lib/knowledgeBaseChangeRequests";

const DRAFT_UPDATES_PATH = path.join(
  process.cwd(),
  "data",
  "kb-draft-updates.json"
);

export type KnowledgeBaseDraftPriority = "high" | "medium" | "low";
export type KnowledgeBaseDraftStatus =
  | "approved"
  | "applied"
  | "draft"
  | "pending-review"
  | "rejected";

export type KnowledgeBaseDraftUpdate = {
  createdAt: string;
  decisionDate: string;
  draftWording: string;
  id: string;
  knowledgeBaseSection: string;
  linkedChangeRequestIds: string[];
  owner: string;
  priority: KnowledgeBaseDraftPriority;
  rationale: string;
  reviewer: string;
  reviewerNotes: string;
  source: string;
  status: KnowledgeBaseDraftStatus;
  title: string;
};

type KnowledgeBaseDraftUpdateRecord = {
  drafts: KnowledgeBaseDraftUpdate[];
  governanceNotes: string[];
  lastUpdatedAt: string;
  version: string;
};

export async function getKnowledgeBaseDraftUpdates() {
  const [record, stats, changeRequests] = await Promise.all([
    readKnowledgeBaseDraftUpdateRecord(),
    stat(DRAFT_UPDATES_PATH),
    getKnowledgeBaseChangeRequests()
  ]);
  const byPriority = countByDraftField(record.drafts, "priority");
  const byStatus = countByDraftField(record.drafts, "status");
  const openDrafts = record.drafts.filter(
    (draft) => draft.status === "draft" || draft.status === "pending-review"
  );
  const linkedChangeRequestIds = new Set(
    record.drafts.flatMap((draft) => draft.linkedChangeRequestIds)
  );

  return {
    byPriority,
    byStatus,
    draftFile: {
      lastUpdated: stats.mtime.toISOString(),
      path: "data/kb-draft-updates.json",
      sizeBytes: stats.size
    },
    exportPath: "/api/admin/knowledge-base/draft-updates.md",
    openDrafts,
    record,
    relatedWorkflow: {
      approvedChangeRequests: changeRequests.summary.approved,
      changeRequestsExportPath: changeRequests.exportPath,
      linkedChangeRequests: linkedChangeRequestIds.size,
      pendingChangeRequests: changeRequests.summary.pending
    },
    summary: {
      applied: byStatus.applied ?? 0,
      approved: byStatus.approved ?? 0,
      draft: byStatus.draft ?? 0,
      highPriorityOpen: openDrafts.filter((draft) => draft.priority === "high")
        .length,
      pendingReview: byStatus["pending-review"] ?? 0,
      rejected: byStatus.rejected ?? 0,
      total: record.drafts.length
    }
  };
}

export async function renderKnowledgeBaseDraftUpdatesMarkdown() {
  const drafts = await getKnowledgeBaseDraftUpdates();

  return [
    "# FYEC100 Knowledge Base Draft Updates",
    "",
    `- Version: ${drafts.record.version}`,
    `- Draft file: ${drafts.draftFile.path}`,
    `- Total drafts: ${drafts.summary.total}`,
    `- Draft: ${drafts.summary.draft}`,
    `- Pending review: ${drafts.summary.pendingReview}`,
    `- Approved: ${drafts.summary.approved}`,
    `- Applied: ${drafts.summary.applied}`,
    `- Rejected: ${drafts.summary.rejected}`,
    `- High-priority open: ${drafts.summary.highPriorityOpen}`,
    "",
    "## Related Workflow",
    "",
    `- Pending change requests: ${drafts.relatedWorkflow.pendingChangeRequests}`,
    `- Approved change requests: ${drafts.relatedWorkflow.approvedChangeRequests}`,
    `- Linked change requests: ${drafts.relatedWorkflow.linkedChangeRequests}`,
    "",
    "## Draft Updates",
    "",
    ...drafts.record.drafts.flatMap((draft) => [
      `### ${draft.id}: ${draft.title}`,
      "",
      `- Status: ${draft.status}`,
      `- Priority: ${draft.priority}`,
      `- Owner: ${draft.owner}`,
      `- Reviewer: ${draft.reviewer || "Not recorded"}`,
      `- Section: ${draft.knowledgeBaseSection}`,
      `- Source: ${draft.source}`,
      `- Linked change request IDs: ${
        draft.linkedChangeRequestIds.length > 0
          ? draft.linkedChangeRequestIds.join(", ")
          : "None recorded"
      }`,
      `- Created: ${draft.createdAt || "Not recorded"}`,
      `- Decision date: ${draft.decisionDate || "Not recorded"}`,
      `- Rationale: ${draft.rationale}`,
      "",
      "Draft wording:",
      "",
      draft.draftWording || "No draft wording recorded.",
      "",
      `Reviewer notes: ${draft.reviewerNotes || "None recorded."}`,
      ""
    ]),
    "## Governance Notes",
    "",
    ...drafts.record.governanceNotes.map((note) => `- ${note}`),
    ""
  ].join("\n");
}

async function readKnowledgeBaseDraftUpdateRecord(): Promise<KnowledgeBaseDraftUpdateRecord> {
  const content = await readFile(DRAFT_UPDATES_PATH, "utf8");
  const parsed = JSON.parse(content) as KnowledgeBaseDraftUpdateRecord;

  return {
    drafts: Array.isArray(parsed.drafts)
      ? parsed.drafts.map(normalizeDraft)
      : [],
    governanceNotes: Array.isArray(parsed.governanceNotes)
      ? parsed.governanceNotes
      : [],
    lastUpdatedAt: parsed.lastUpdatedAt || "",
    version: parsed.version || "phase-2-kb-draft-updates"
  };
}

function normalizeDraft(
  draft: KnowledgeBaseDraftUpdate
): KnowledgeBaseDraftUpdate {
  return {
    createdAt: draft.createdAt || "",
    decisionDate: draft.decisionDate || "",
    draftWording: draft.draftWording || "",
    id: draft.id || "KBD-000",
    knowledgeBaseSection: draft.knowledgeBaseSection || "Unassigned",
    linkedChangeRequestIds: Array.isArray(draft.linkedChangeRequestIds)
      ? draft.linkedChangeRequestIds
      : [],
    owner: draft.owner || "Lecturer / Content Owner",
    priority: normalizePriority(draft.priority),
    rationale: draft.rationale || "",
    reviewer: draft.reviewer || "",
    reviewerNotes: draft.reviewerNotes || "",
    source: draft.source || "Manual draft",
    status: normalizeStatus(draft.status),
    title: draft.title || "Untitled draft update"
  };
}

function normalizePriority(value: string): KnowledgeBaseDraftPriority {
  const priorities: KnowledgeBaseDraftPriority[] = ["high", "medium", "low"];

  return priorities.includes(value as KnowledgeBaseDraftPriority)
    ? (value as KnowledgeBaseDraftPriority)
    : "medium";
}

function normalizeStatus(value: string): KnowledgeBaseDraftStatus {
  const statuses: KnowledgeBaseDraftStatus[] = [
    "approved",
    "applied",
    "draft",
    "pending-review",
    "rejected"
  ];

  return statuses.includes(value as KnowledgeBaseDraftStatus)
    ? (value as KnowledgeBaseDraftStatus)
    : "draft";
}

function countByDraftField(
  items: KnowledgeBaseDraftUpdate[],
  key: "priority" | "status"
) {
  return items.reduce<Record<string, number>>((counts, item) => {
    const value = item[key];
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}
