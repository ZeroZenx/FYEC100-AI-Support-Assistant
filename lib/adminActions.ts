import { readFile, stat } from "fs/promises";
import path from "path";

const ACTIONS_PATH = path.join(process.cwd(), "data", "admin-actions.json");

export type AdminActionPriority = "high" | "medium" | "low";
export type AdminActionStatus = "blocked" | "done" | "in-progress" | "open";

export type AdminAction = {
  dueDate: string;
  id: string;
  notes: string;
  owner: string;
  priority: AdminActionPriority;
  source: string;
  status: AdminActionStatus;
  title: string;
};

type AdminActionRecord = {
  actions: AdminAction[];
  governanceNotes: string[];
  lastUpdatedAt: string;
  version: string;
};

export async function getAdminActionRegister() {
  const [record, stats] = await Promise.all([
    readAdminActionRecord(),
    stat(ACTIONS_PATH)
  ]);
  const byPriority = countBy(record.actions, "priority");
  const byStatus = countBy(record.actions, "status");
  const openActions = record.actions.filter((action) => action.status !== "done");
  const highPriorityOpen = openActions.filter(
    (action) => action.priority === "high"
  );

  return {
    actionFile: {
      lastUpdated: stats.mtime.toISOString(),
      path: "data/admin-actions.json",
      sizeBytes: stats.size
    },
    byPriority,
    byStatus,
    exportPath: "/api/admin/actions.md",
    highPriorityOpen,
    openActions,
    record,
    summary: {
      blocked: byStatus.blocked ?? 0,
      done: byStatus.done ?? 0,
      highPriorityOpen: highPriorityOpen.length,
      inProgress: byStatus["in-progress"] ?? 0,
      open: byStatus.open ?? 0,
      total: record.actions.length
    }
  };
}

export async function renderAdminActionsMarkdown() {
  const register = await getAdminActionRegister();

  return [
    "# FYEC100 Admin Action Register",
    "",
    `- Version: ${register.record.version}`,
    `- Action file: ${register.actionFile.path}`,
    `- Total actions: ${register.summary.total}`,
    `- Open: ${register.summary.open}`,
    `- In progress: ${register.summary.inProgress}`,
    `- Blocked: ${register.summary.blocked}`,
    `- Done: ${register.summary.done}`,
    `- High-priority open: ${register.summary.highPriorityOpen}`,
    "",
    "## Actions",
    "",
    ...register.record.actions.flatMap((action) => [
      `### ${action.id}: ${action.title}`,
      "",
      `- Owner: ${action.owner}`,
      `- Priority: ${action.priority}`,
      `- Status: ${action.status}`,
      `- Due date: ${action.dueDate || "Not set"}`,
      `- Source: ${action.source}`,
      `- Notes: ${action.notes}`,
      ""
    ]),
    "## Governance Notes",
    "",
    ...register.record.governanceNotes.map((note) => `- ${note}`),
    ""
  ].join("\n");
}

async function readAdminActionRecord(): Promise<AdminActionRecord> {
  const content = await readFile(ACTIONS_PATH, "utf8");
  const parsed = JSON.parse(content) as AdminActionRecord;

  return {
    actions: Array.isArray(parsed.actions)
      ? parsed.actions.map(normalizeAction)
      : [],
    governanceNotes: Array.isArray(parsed.governanceNotes)
      ? parsed.governanceNotes
      : [],
    lastUpdatedAt: parsed.lastUpdatedAt || "",
    version: parsed.version || "phase-2-admin-actions"
  };
}

function normalizeAction(action: AdminAction): AdminAction {
  return {
    dueDate: action.dueDate || "",
    id: action.id || "ACT-000",
    notes: action.notes || "",
    owner: action.owner || "Project Team",
    priority: normalizePriority(action.priority),
    source: action.source || "Manual entry",
    status: normalizeStatus(action.status),
    title: action.title || "Untitled action"
  };
}

function normalizePriority(value: string): AdminActionPriority {
  const priorities: AdminActionPriority[] = ["high", "medium", "low"];

  return priorities.includes(value as AdminActionPriority)
    ? (value as AdminActionPriority)
    : "medium";
}

function normalizeStatus(value: string): AdminActionStatus {
  const statuses: AdminActionStatus[] = [
    "blocked",
    "done",
    "in-progress",
    "open"
  ];

  return statuses.includes(value as AdminActionStatus)
    ? (value as AdminActionStatus)
    : "open";
}

function countBy<T extends Record<string, string>>(items: T[], key: keyof T) {
  return items.reduce<Record<string, number>>((counts, item) => {
    const value = item[key];
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}
