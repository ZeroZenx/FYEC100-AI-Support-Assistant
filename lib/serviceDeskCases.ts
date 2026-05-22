import { appendFile, readFile } from "fs/promises";
import path from "path";
import { recordAuditEvent } from "@/lib/auditEvents";

const CASES_PATH = path.join(process.cwd(), "data", "service-desk-cases.jsonl");

export type SupportCaseCategory =
  | "academic-integrity"
  | "lecturer-help"
  | "missing-course-info"
  | "moodle-help"
  | "technical-issue";

export type SupportCaseStatus =
  | "assigned"
  | "closed"
  | "in-progress"
  | "new"
  | "resolved"
  | "waiting-on-lecturer"
  | "waiting-on-lms-admin";

export type SupportCase = {
  category: SupportCaseCategory;
  courseCode: string;
  createdAt: string;
  id: string;
  owner: string;
  priority: "high" | "low" | "medium";
  resolutionNote?: string;
  safeSummary: string;
  source: "chat-escalation" | "feedback" | "manual";
  status: SupportCaseStatus;
  studentFacingConfirmation: string;
  updatedAt: string;
};

const ownerByCategory: Record<SupportCaseCategory, string> = {
  "academic-integrity": "Lecturer / Project Sponsor",
  "lecturer-help": "Lecturer",
  "missing-course-info": "Lecturer / Developer",
  "moodle-help": "LMS Administrator",
  "technical-issue": "Technical Lead / System Administrator"
};

const priorityByCategory: Record<SupportCaseCategory, SupportCase["priority"]> = {
  "academic-integrity": "high",
  "lecturer-help": "high",
  "missing-course-info": "medium",
  "moodle-help": "high",
  "technical-issue": "high"
};

export async function createSupportCase(input: {
  category: SupportCaseCategory;
  courseCode?: string;
  safeSummary: string;
  source?: SupportCase["source"];
}) {
  const now = new Date().toISOString();
  const category = normalizeCaseCategory(input.category);
  const record: SupportCase = {
    category,
    courseCode: input.courseCode?.trim().toUpperCase() || "FYEC100",
    createdAt: now,
    id: `CASE-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    owner: ownerByCategory[category],
    priority: priorityByCategory[category],
    safeSummary: sanitizeSupportSummary(input.safeSummary),
    source: input.source || "chat-escalation",
    status: "new",
    studentFacingConfirmation:
      "This has been flagged for human follow-up. Do not include private details in the chat; contact the lecturer, LMS administrator, or IT help channel for urgent issues.",
    updatedAt: now
  };

  await appendFile(CASES_PATH, `${JSON.stringify(record)}\n`, "utf8");
  await recordAuditEvent({
    actor: "student-escalation",
    area: "support",
    detail: `Created support case ${record.id} for ${record.category}.`,
    eventType: "support-routing",
    relatedId: record.id,
    severity: record.priority === "high" ? "warning" : "info",
    source: "api/support-handoff"
  });

  return record;
}

export async function readSupportCases() {
  try {
    const content = await readFile(CASES_PATH, "utf8");

    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => normalizeSupportCase(JSON.parse(line) as SupportCase))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }

    return [];
  }
}

export async function buildSupportCaseSummary() {
  const cases = await readSupportCases();
  const byCategory = countBy(cases.map((item) => item.category));
  const byOwner = countBy(cases.map((item) => item.owner));
  const open = cases.filter((item) => item.status !== "closed" && item.status !== "resolved");

  return {
    byCategory,
    byOwner,
    cases: cases.slice(0, 50),
    generatedAt: new Date().toISOString(),
    summary: {
      highPriorityOpen: open.filter((item) => item.priority === "high").length,
      open: open.length,
      total: cases.length
    }
  };
}

function normalizeSupportCase(record: SupportCase): SupportCase {
  const category = normalizeCaseCategory(record.category);

  return {
    category,
    courseCode: record.courseCode || "FYEC100",
    createdAt: record.createdAt || new Date().toISOString(),
    id: record.id || `CASE-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    owner: record.owner || ownerByCategory[category],
    priority: record.priority || priorityByCategory[category],
    resolutionNote: record.resolutionNote || "",
    safeSummary: sanitizeSupportSummary(record.safeSummary || ""),
    source: record.source || "manual",
    status: record.status || "new",
    studentFacingConfirmation:
      record.studentFacingConfirmation ||
      "This has been flagged for human follow-up.",
    updatedAt: record.updatedAt || record.createdAt || new Date().toISOString()
  };
}

function normalizeCaseCategory(value: string): SupportCaseCategory {
  const categories: SupportCaseCategory[] = [
    "academic-integrity",
    "lecturer-help",
    "missing-course-info",
    "moodle-help",
    "technical-issue"
  ];

  return categories.includes(value as SupportCaseCategory)
    ? (value as SupportCaseCategory)
    : "lecturer-help";
}

function sanitizeSupportSummary(value: string) {
  return value
    .replace(/\b\d{6,}\b/g, "[redacted-number]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/password[^,.\n]*/gi, "password [redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

function countBy(values: string[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}
