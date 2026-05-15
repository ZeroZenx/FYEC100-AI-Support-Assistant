import { readFile, stat } from "fs/promises";
import path from "path";
import { getKnowledgeBaseChangeRequests } from "@/lib/knowledgeBaseChangeRequests";
import { getKnowledgeBaseDraftUpdates } from "@/lib/knowledgeBaseDraftUpdates";
import { getKnowledgeBaseReleases } from "@/lib/knowledgeBaseReleases";

const APPLY_CHECKLIST_PATH = path.join(
  process.cwd(),
  "data",
  "kb-apply-checklist.json"
);

export type KnowledgeBaseApplyStatus =
  | "approved"
  | "blocked"
  | "pending-review"
  | "ready-to-apply";

export type KnowledgeBaseApplyStepStatus =
  | "blocked"
  | "complete"
  | "pending";

export type KnowledgeBaseApplyStep = {
  evidence: string;
  id: string;
  label: string;
  owner: string;
  requiredBeforeApply: boolean;
  status: KnowledgeBaseApplyStepStatus;
};

export type KnowledgeBaseApplyChecklistRecord = {
  applyOwner: string;
  applyStatus: KnowledgeBaseApplyStatus;
  governanceNotes: string[];
  lastUpdatedAt: string;
  linkedChangeRequestIds: string[];
  linkedDraftUpdateIds: string[];
  linkedReleaseId: string;
  reviewer: string;
  steps: KnowledgeBaseApplyStep[];
  targetKnowledgeBasePath: string;
  version: string;
};

export async function getKnowledgeBaseApplyChecklist() {
  const [record, stats, draftUpdates, changeRequests, releases] =
    await Promise.all([
      readKnowledgeBaseApplyChecklistRecord(),
      stat(APPLY_CHECKLIST_PATH),
      getKnowledgeBaseDraftUpdates(),
      getKnowledgeBaseChangeRequests(),
      getKnowledgeBaseReleases()
    ]);
  const summary = {
    blocked: record.steps.filter((step) => step.status === "blocked").length,
    complete: record.steps.filter((step) => step.status === "complete").length,
    pending: record.steps.filter((step) => step.status === "pending").length,
    requiredPending: record.steps.filter(
      (step) => step.requiredBeforeApply && step.status !== "complete"
    ).length,
    total: record.steps.length
  };
  const readyToApply =
    summary.blocked === 0 &&
    summary.requiredPending === 0 &&
    record.applyStatus === "ready-to-apply";

  return {
    applyFile: {
      lastUpdated: stats.mtime.toISOString(),
      path: "data/kb-apply-checklist.json",
      sizeBytes: stats.size
    },
    exportPath: "/api/admin/knowledge-base/apply-checklist.md",
    readyToApply,
    record,
    relatedWorkflow: {
      draftUpdateExportPath: draftUpdates.exportPath,
      linkedChangeRequestIds: record.linkedChangeRequestIds,
      linkedDraftUpdateIds: record.linkedDraftUpdateIds,
      linkedReleaseId: record.linkedReleaseId,
      liveKnowledgeBasePath: record.targetKnowledgeBasePath,
      openDrafts: draftUpdates.openDrafts.length,
      pendingChangeRequests: changeRequests.summary.pending,
      releaseExportPath: releases.exportPath
    },
    statusMessage: readyToApply
      ? "Knowledge base apply checklist is ready for manual live Markdown update."
      : "Knowledge base apply checklist is not ready. Complete required review steps before editing the live Markdown knowledge base.",
    summary
  };
}

export async function renderKnowledgeBaseApplyChecklistMarkdown() {
  const checklist = await getKnowledgeBaseApplyChecklist();

  return [
    "# FYEC100 Knowledge Base Apply Checklist",
    "",
    `- Version: ${checklist.record.version}`,
    `- Apply file: ${checklist.applyFile.path}`,
    `- Target knowledge base: ${checklist.record.targetKnowledgeBasePath}`,
    `- Apply status: ${checklist.record.applyStatus}`,
    `- Ready to apply: ${checklist.readyToApply ? "Yes" : "No"}`,
    `- Apply owner: ${checklist.record.applyOwner}`,
    `- Reviewer: ${checklist.record.reviewer || "Not recorded"}`,
    `- Linked draft update IDs: ${formatList(
      checklist.record.linkedDraftUpdateIds
    )}`,
    `- Linked change request IDs: ${formatList(
      checklist.record.linkedChangeRequestIds
    )}`,
    `- Linked release ID: ${
      checklist.record.linkedReleaseId || "Not recorded"
    }`,
    "",
    "## Summary",
    "",
    `- Complete: ${checklist.summary.complete}`,
    `- Pending: ${checklist.summary.pending}`,
    `- Blocked: ${checklist.summary.blocked}`,
    `- Required pending: ${checklist.summary.requiredPending}`,
    "",
    "## Steps",
    "",
    ...checklist.record.steps.flatMap((step) => [
      `### ${step.id}: ${step.label}`,
      "",
      `- Owner: ${step.owner}`,
      `- Status: ${step.status}`,
      `- Required before apply: ${step.requiredBeforeApply ? "Yes" : "No"}`,
      `- Evidence: ${step.evidence}`,
      ""
    ]),
    "## Related Workflow",
    "",
    `- Open draft updates: ${checklist.relatedWorkflow.openDrafts}`,
    `- Pending change requests: ${checklist.relatedWorkflow.pendingChangeRequests}`,
    `- Draft update export: ${checklist.relatedWorkflow.draftUpdateExportPath}`,
    `- Release export: ${checklist.relatedWorkflow.releaseExportPath}`,
    "",
    "## Governance Notes",
    "",
    ...checklist.record.governanceNotes.map((note) => `- ${note}`),
    ""
  ].join("\n");
}

async function readKnowledgeBaseApplyChecklistRecord(): Promise<KnowledgeBaseApplyChecklistRecord> {
  const content = await readFile(APPLY_CHECKLIST_PATH, "utf8");
  const parsed = JSON.parse(content) as KnowledgeBaseApplyChecklistRecord;

  return {
    applyOwner: parsed.applyOwner || "Developer / Lecturer reviewer",
    applyStatus: normalizeApplyStatus(parsed.applyStatus),
    governanceNotes: Array.isArray(parsed.governanceNotes)
      ? parsed.governanceNotes
      : [],
    lastUpdatedAt: parsed.lastUpdatedAt || "",
    linkedChangeRequestIds: Array.isArray(parsed.linkedChangeRequestIds)
      ? parsed.linkedChangeRequestIds
      : [],
    linkedDraftUpdateIds: Array.isArray(parsed.linkedDraftUpdateIds)
      ? parsed.linkedDraftUpdateIds
      : [],
    linkedReleaseId: parsed.linkedReleaseId || "",
    reviewer: parsed.reviewer || "",
    steps: Array.isArray(parsed.steps) ? parsed.steps.map(normalizeStep) : [],
    targetKnowledgeBasePath:
      parsed.targetKnowledgeBasePath || "data/fyec100-knowledge-base.md",
    version: parsed.version || "phase-2-kb-apply-checklist"
  };
}

function normalizeStep(step: KnowledgeBaseApplyStep): KnowledgeBaseApplyStep {
  return {
    evidence: step.evidence || "",
    id: step.id || "KBA-000",
    label: step.label || "Apply checklist step",
    owner: step.owner || "Project team",
    requiredBeforeApply: Boolean(step.requiredBeforeApply),
    status: normalizeStepStatus(step.status)
  };
}

function normalizeApplyStatus(value: string): KnowledgeBaseApplyStatus {
  const statuses: KnowledgeBaseApplyStatus[] = [
    "approved",
    "blocked",
    "pending-review",
    "ready-to-apply"
  ];

  return statuses.includes(value as KnowledgeBaseApplyStatus)
    ? (value as KnowledgeBaseApplyStatus)
    : "pending-review";
}

function normalizeStepStatus(value: string): KnowledgeBaseApplyStepStatus {
  const statuses: KnowledgeBaseApplyStepStatus[] = [
    "blocked",
    "complete",
    "pending"
  ];

  return statuses.includes(value as KnowledgeBaseApplyStepStatus)
    ? (value as KnowledgeBaseApplyStepStatus)
    : "pending";
}

function formatList(items: string[]) {
  return items.length > 0 ? items.join(", ") : "None recorded";
}
