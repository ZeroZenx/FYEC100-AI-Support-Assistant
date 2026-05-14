import { readFile, stat } from "fs/promises";
import path from "path";

const CHANGE_REQUESTS_PATH = path.join(
  process.cwd(),
  "data",
  "kb-change-requests.json"
);

export type KnowledgeBaseChangePriority = "high" | "medium" | "low";
export type KnowledgeBaseChangeStatus =
  | "approved"
  | "implemented"
  | "pending-review"
  | "rejected";

export type KnowledgeBaseChangeRequest = {
  decisionDate: string;
  id: string;
  knowledgeBaseSection: string;
  notes: string;
  owner: string;
  priority: KnowledgeBaseChangePriority;
  rationale: string;
  recommendedChange: string;
  requestedBy: string;
  reviewer: string;
  source: string;
  status: KnowledgeBaseChangeStatus;
  title: string;
};

type KnowledgeBaseChangeRecord = {
  governanceNotes: string[];
  lastUpdatedAt: string;
  requests: KnowledgeBaseChangeRequest[];
  version: string;
};

export async function getKnowledgeBaseChangeRequests() {
  const [record, stats] = await Promise.all([
    readKnowledgeBaseChangeRecord(),
    stat(CHANGE_REQUESTS_PATH)
  ]);
  const byPriority = countBy(record.requests, "priority");
  const byStatus = countBy(record.requests, "status");
  const pending = record.requests.filter(
    (request) => request.status === "pending-review"
  );
  const approved = record.requests.filter(
    (request) => request.status === "approved"
  );

  return {
    approved,
    byPriority,
    byStatus,
    changeRequestFile: {
      lastUpdated: stats.mtime.toISOString(),
      path: "data/kb-change-requests.json",
      sizeBytes: stats.size
    },
    exportPath: "/api/admin/knowledge-base/change-requests.md",
    pending,
    record,
    summary: {
      approved: byStatus.approved ?? 0,
      highPriorityPending: pending.filter(
        (request) => request.priority === "high"
      ).length,
      implemented: byStatus.implemented ?? 0,
      pending: byStatus["pending-review"] ?? 0,
      rejected: byStatus.rejected ?? 0,
      total: record.requests.length
    }
  };
}

export async function renderKnowledgeBaseChangeRequestsMarkdown() {
  const register = await getKnowledgeBaseChangeRequests();

  return [
    "# FYEC100 Knowledge Base Change Requests",
    "",
    `- Version: ${register.record.version}`,
    `- Request file: ${register.changeRequestFile.path}`,
    `- Total requests: ${register.summary.total}`,
    `- Pending review: ${register.summary.pending}`,
    `- Approved: ${register.summary.approved}`,
    `- Implemented: ${register.summary.implemented}`,
    `- Rejected: ${register.summary.rejected}`,
    `- High-priority pending: ${register.summary.highPriorityPending}`,
    "",
    "## Requests",
    "",
    ...register.record.requests.flatMap((request) => [
      `### ${request.id}: ${request.title}`,
      "",
      `- Requested by: ${request.requestedBy}`,
      `- Owner: ${request.owner}`,
      `- Priority: ${request.priority}`,
      `- Status: ${request.status}`,
      `- Source: ${request.source}`,
      `- Section: ${request.knowledgeBaseSection}`,
      `- Reviewer: ${request.reviewer || "Not recorded"}`,
      `- Decision date: ${request.decisionDate || "Not recorded"}`,
      `- Rationale: ${request.rationale}`,
      `- Recommended change: ${request.recommendedChange}`,
      `- Notes: ${request.notes}`,
      ""
    ]),
    "## Governance Notes",
    "",
    ...register.record.governanceNotes.map((note) => `- ${note}`),
    ""
  ].join("\n");
}

async function readKnowledgeBaseChangeRecord(): Promise<KnowledgeBaseChangeRecord> {
  const content = await readFile(CHANGE_REQUESTS_PATH, "utf8");
  const parsed = JSON.parse(content) as KnowledgeBaseChangeRecord;

  return {
    governanceNotes: Array.isArray(parsed.governanceNotes)
      ? parsed.governanceNotes
      : [],
    lastUpdatedAt: parsed.lastUpdatedAt || "",
    requests: Array.isArray(parsed.requests)
      ? parsed.requests.map(normalizeRequest)
      : [],
    version: parsed.version || "phase-2-kb-change-requests"
  };
}

function normalizeRequest(
  request: KnowledgeBaseChangeRequest
): KnowledgeBaseChangeRequest {
  return {
    decisionDate: request.decisionDate || "",
    id: request.id || "KBCR-000",
    knowledgeBaseSection: request.knowledgeBaseSection || "Unassigned",
    notes: request.notes || "",
    owner: request.owner || "Lecturer / Content Owner",
    priority: normalizePriority(request.priority),
    rationale: request.rationale || "",
    recommendedChange: request.recommendedChange || "",
    requestedBy: request.requestedBy || "Pilot Review Team",
    reviewer: request.reviewer || "",
    source: request.source || "Manual entry",
    status: normalizeStatus(request.status),
    title: request.title || "Untitled change request"
  };
}

function normalizePriority(value: string): KnowledgeBaseChangePriority {
  const priorities: KnowledgeBaseChangePriority[] = ["high", "medium", "low"];

  return priorities.includes(value as KnowledgeBaseChangePriority)
    ? (value as KnowledgeBaseChangePriority)
    : "medium";
}

function normalizeStatus(value: string): KnowledgeBaseChangeStatus {
  const statuses: KnowledgeBaseChangeStatus[] = [
    "approved",
    "implemented",
    "pending-review",
    "rejected"
  ];

  return statuses.includes(value as KnowledgeBaseChangeStatus)
    ? (value as KnowledgeBaseChangeStatus)
    : "pending-review";
}

function countBy<T extends Record<string, string>>(items: T[], key: keyof T) {
  return items.reduce<Record<string, number>>((counts, item) => {
    const value = item[key];
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}
