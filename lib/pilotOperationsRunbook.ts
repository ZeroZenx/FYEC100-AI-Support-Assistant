import { readFile, stat } from "fs/promises";
import path from "path";
import { getAdminActionRegister } from "@/lib/adminActions";
import { getAccessibilityUsabilityReview } from "@/lib/accessibilityUsabilityReview";
import { buildPilotEvidenceDashboard } from "@/lib/pilotEvidence";

const RUNBOOK_PATH = path.join(
  process.cwd(),
  "data",
  "pilot-operations-runbook.json"
);

export type PilotRunbookProcedureStatus = "ready" | "watch" | "blocked";
export type PilotRunbookStatus = "approved" | "draft" | "needs-review";

export type PilotRunbookRole = {
  name: string;
  owner: string;
  responsibility: string;
};

export type PilotRunbookProcedure = {
  id: string;
  outputs: string[];
  owner: string;
  phase: string;
  status: PilotRunbookProcedureStatus;
  steps: string[];
  title: string;
};

export type PilotOperationsRunbookRecord = {
  governanceNotes: string[];
  lastReviewedAt: string;
  operatingPrinciples: string[];
  pilotStage: string;
  postSessionQuestions: string[];
  procedures: PilotRunbookProcedure[];
  reviewOwner: string;
  roles: PilotRunbookRole[];
  runbookStatus: PilotRunbookStatus;
  stopPilotTriggers: string[];
  version: string;
};

export async function getPilotOperationsRunbook() {
  const [record, stats, evidence, actions, accessibility] = await Promise.all([
    readPilotOperationsRunbook(),
    stat(RUNBOOK_PATH),
    buildPilotEvidenceDashboard(),
    getAdminActionRegister(),
    getAccessibilityUsabilityReview()
  ]);
  const summary = {
    blocked: record.procedures.filter((item) => item.status === "blocked").length,
    ready: record.procedures.filter((item) => item.status === "ready").length,
    watch: record.procedures.filter((item) => item.status === "watch").length
  };
  const readyForPilot =
    record.runbookStatus === "approved" &&
    summary.blocked === 0 &&
    accessibility.readyForPilot;

  return {
    exportPath: "/api/admin/pilot-operations-runbook.md",
    readinessContext: {
      accessibilityReady: accessibility.readyForPilot,
      evidenceStatus: evidence.goNoGo.status,
      openHighPriorityActions: actions.summary.highPriorityOpen
    },
    readyForPilot,
    record,
    runbookFile: {
      lastUpdated: stats.mtime.toISOString(),
      path: "data/pilot-operations-runbook.json",
      sizeBytes: stats.size
    },
    statusMessage: readyForPilot
      ? "Pilot operations runbook is approved and ready for controlled Moodle pilot use."
      : "Pilot operations runbook is drafted. Review it with the project team before pilot go-live.",
    summary
  };
}

export async function renderPilotOperationsRunbookMarkdown() {
  const runbook = await getPilotOperationsRunbook();

  return [
    "# FYEC100 Pilot Operations Runbook",
    "",
    `- Version: ${runbook.record.version}`,
    `- Pilot stage: ${runbook.record.pilotStage}`,
    `- Runbook status: ${runbook.record.runbookStatus}`,
    `- Ready for pilot: ${runbook.readyForPilot ? "Yes" : "No"}`,
    `- Review owner: ${runbook.record.reviewOwner}`,
    `- Last reviewed: ${runbook.record.lastReviewedAt || "Not recorded"}`,
    `- Runbook file: ${runbook.runbookFile.path}`,
    "",
    "## Readiness Context",
    "",
    `- Pilot evidence status: ${runbook.readinessContext.evidenceStatus}`,
    `- Accessibility review ready: ${
      runbook.readinessContext.accessibilityReady ? "Yes" : "No"
    }`,
    `- Open high-priority actions: ${runbook.readinessContext.openHighPriorityActions}`,
    "",
    "## Operating Principles",
    "",
    ...runbook.record.operatingPrinciples.map((principle) => `- ${principle}`),
    "",
    "## Roles",
    "",
    ...runbook.record.roles.flatMap((role) => [
      `### ${role.name}`,
      "",
      `- Owner: ${role.owner}`,
      `- Responsibility: ${role.responsibility}`,
      ""
    ]),
    "## Procedures",
    "",
    ...runbook.record.procedures.flatMap((procedure) => [
      `### ${procedure.id}: ${procedure.title}`,
      "",
      `- Phase: ${procedure.phase}`,
      `- Owner: ${procedure.owner}`,
      `- Status: ${procedure.status}`,
      "",
      "Steps:",
      ...procedure.steps.map((step) => `- ${step}`),
      "",
      "Outputs:",
      ...procedure.outputs.map((output) => `- ${output}`),
      ""
    ]),
    "## Stop-Pilot Triggers",
    "",
    ...runbook.record.stopPilotTriggers.map((trigger) => `- ${trigger}`),
    "",
    "## Post-Session Questions",
    "",
    ...runbook.record.postSessionQuestions.map((question) => `- ${question}`),
    "",
    "## Governance Notes",
    "",
    ...runbook.record.governanceNotes.map((note) => `- ${note}`),
    ""
  ].join("\n");
}

async function readPilotOperationsRunbook(): Promise<PilotOperationsRunbookRecord> {
  const content = await readFile(RUNBOOK_PATH, "utf8");
  const parsed = JSON.parse(content) as PilotOperationsRunbookRecord;

  return {
    governanceNotes: Array.isArray(parsed.governanceNotes)
      ? parsed.governanceNotes
      : [],
    lastReviewedAt: parsed.lastReviewedAt || "",
    operatingPrinciples: Array.isArray(parsed.operatingPrinciples)
      ? parsed.operatingPrinciples
      : [],
    pilotStage: parsed.pilotStage || "Controlled FYEC100 Moodle pilot",
    postSessionQuestions: Array.isArray(parsed.postSessionQuestions)
      ? parsed.postSessionQuestions
      : [],
    procedures: Array.isArray(parsed.procedures)
      ? parsed.procedures.map(normalizeProcedure)
      : [],
    reviewOwner: parsed.reviewOwner || "Project Lead",
    roles: Array.isArray(parsed.roles) ? parsed.roles.map(normalizeRole) : [],
    runbookStatus: normalizeRunbookStatus(parsed.runbookStatus),
    stopPilotTriggers: Array.isArray(parsed.stopPilotTriggers)
      ? parsed.stopPilotTriggers
      : [],
    version: parsed.version || "pilot-operations-runbook"
  };
}

function normalizeProcedure(
  procedure: PilotRunbookProcedure
): PilotRunbookProcedure {
  return {
    id: procedure.id || "OPS",
    outputs: Array.isArray(procedure.outputs) ? procedure.outputs : [],
    owner: procedure.owner || "Project team",
    phase: procedure.phase || "Pilot operations",
    status: normalizeProcedureStatus(procedure.status),
    steps: Array.isArray(procedure.steps) ? procedure.steps : [],
    title: procedure.title || "Pilot procedure"
  };
}

function normalizeRole(role: PilotRunbookRole): PilotRunbookRole {
  return {
    name: role.name || "Pilot role",
    owner: role.owner || "Unassigned",
    responsibility: role.responsibility || "Pilot support"
  };
}

function normalizeProcedureStatus(value: string): PilotRunbookProcedureStatus {
  const statuses: PilotRunbookProcedureStatus[] = [
    "ready",
    "watch",
    "blocked"
  ];

  return statuses.includes(value as PilotRunbookProcedureStatus)
    ? (value as PilotRunbookProcedureStatus)
    : "watch";
}

function normalizeRunbookStatus(value: string): PilotRunbookStatus {
  const statuses: PilotRunbookStatus[] = ["approved", "draft", "needs-review"];

  return statuses.includes(value as PilotRunbookStatus)
    ? (value as PilotRunbookStatus)
    : "draft";
}
