import { readFile, stat } from "fs/promises";
import path from "path";
import { buildPilotEvidenceDashboard } from "@/lib/pilotEvidence";

const SIGNOFF_PATH = path.join(process.cwd(), "data", "pilot-signoff.json");

export type PilotSignoffStatus =
  | "approved"
  | "changes-requested"
  | "pending";

export type PilotDecisionStatus =
  | "approved-for-controlled-pilot"
  | "changes-requested"
  | "pending-review";

export type PilotSignoffApproval = {
  name: string;
  notes: string;
  responsibility: string;
  role: string;
  signedAt: string;
  status: PilotSignoffStatus;
};

export type PilotSignoffRecord = {
  approvals: PilotSignoffApproval[];
  decisionNotes: string[];
  decisionStatus: PilotDecisionStatus;
  lastUpdatedAt: string;
  targetPilotStage: string;
  version: string;
};

export async function getPilotSignoffStatus() {
  const [record, stats, evidence] = await Promise.all([
    readPilotSignoffRecord(),
    stat(SIGNOFF_PATH),
    buildPilotEvidenceDashboard()
  ]);
  const counts = {
    approved: record.approvals.filter((item) => item.status === "approved").length,
    changesRequested: record.approvals.filter(
      (item) => item.status === "changes-requested"
    ).length,
    pending: record.approvals.filter((item) => item.status === "pending").length
  };
  const readyForDecision =
    evidence.goNoGo.status === "go" &&
    counts.changesRequested === 0 &&
    counts.pending === 0;
  const approvedForControlledPilot =
    record.decisionStatus === "approved-for-controlled-pilot" &&
    readyForDecision;

  return {
    approvedForControlledPilot,
    counts,
    evidenceGoNoGo: evidence.goNoGo,
    exportPath: "/api/admin/pilot-signoff.md",
    record,
    readyForDecision,
    signoffFile: {
      lastUpdated: stats.mtime.toISOString(),
      path: "data/pilot-signoff.json",
      sizeBytes: stats.size
    },
    statusMessage: approvedForControlledPilot
      ? "Pilot sign-off is complete for the controlled FYEC100 Moodle pilot."
      : "Pilot sign-off is not complete. Review pending approvals and evidence status."
  };
}

export async function renderPilotSignoffMarkdown() {
  const status = await getPilotSignoffStatus();

  return [
    "# FYEC100 Pilot Sign-off Pack",
    "",
    `- Version: ${status.record.version}`,
    `- Target stage: ${status.record.targetPilotStage}`,
    `- Decision status: ${status.record.decisionStatus}`,
    `- Ready for decision: ${status.readyForDecision ? "Yes" : "No"}`,
    `- Approved for controlled pilot: ${
      status.approvedForControlledPilot ? "Yes" : "No"
    }`,
    `- Evidence status: ${status.evidenceGoNoGo.label}`,
    `- Sign-off file: ${status.signoffFile.path}`,
    "",
    "## Approval Summary",
    "",
    `- Approved: ${status.counts.approved}`,
    `- Pending: ${status.counts.pending}`,
    `- Changes requested: ${status.counts.changesRequested}`,
    "",
    "## Approval Owners",
    "",
    ...status.record.approvals.flatMap((approval) => [
      `### ${approval.name}`,
      "",
      `- Role: ${approval.role}`,
      `- Responsibility: ${approval.responsibility}`,
      `- Status: ${approval.status}`,
      `- Signed at: ${approval.signedAt || "Not recorded"}`,
      `- Notes: ${approval.notes}`,
      ""
    ]),
    "## Decision Notes",
    "",
    ...status.record.decisionNotes.map((note) => `- ${note}`),
    "",
    "## Governance Notice",
    "",
    "This sign-off pack is a Phase 2 governance artifact for controlled pilot review. It is not an electronic signature system or production approval workflow.",
    ""
  ].join("\n");
}

async function readPilotSignoffRecord(): Promise<PilotSignoffRecord> {
  const content = await readFile(SIGNOFF_PATH, "utf8");
  const parsed = JSON.parse(content) as PilotSignoffRecord;

  return {
    approvals: Array.isArray(parsed.approvals)
      ? parsed.approvals.map(normalizeApproval)
      : [],
    decisionNotes: Array.isArray(parsed.decisionNotes)
      ? parsed.decisionNotes
      : [],
    decisionStatus: normalizeDecisionStatus(parsed.decisionStatus),
    lastUpdatedAt: parsed.lastUpdatedAt || "",
    targetPilotStage:
      parsed.targetPilotStage || "Controlled FYEC100 Moodle pilot",
    version: parsed.version || "phase-2-pilot-signoff"
  };
}

function normalizeApproval(
  approval: PilotSignoffApproval
): PilotSignoffApproval {
  return {
    name: approval.name || "Unassigned",
    notes: approval.notes || "",
    responsibility: approval.responsibility || "Pilot approval",
    role: approval.role || "Project team",
    signedAt: approval.signedAt || "",
    status: normalizeApprovalStatus(approval.status)
  };
}

function normalizeApprovalStatus(value: string): PilotSignoffStatus {
  const statuses: PilotSignoffStatus[] = [
    "approved",
    "changes-requested",
    "pending"
  ];

  return statuses.includes(value as PilotSignoffStatus)
    ? (value as PilotSignoffStatus)
    : "pending";
}

function normalizeDecisionStatus(value: string): PilotDecisionStatus {
  const statuses: PilotDecisionStatus[] = [
    "approved-for-controlled-pilot",
    "changes-requested",
    "pending-review"
  ];

  return statuses.includes(value as PilotDecisionStatus)
    ? (value as PilotDecisionStatus)
    : "pending-review";
}
