import { appendFile, readFile } from "fs/promises";
import path from "path";
import {
  type MoodleLaunchContext,
  normalizeMoodleLaunchContext
} from "@/lib/moodleContext";

const LAUNCH_AUDIT_PATH = path.join(process.cwd(), "data", "moodle-launch-audit.jsonl");
const MAX_RECENT_RECORDS = 10;

export type LaunchAuditRecord = {
  context: MoodleLaunchContext;
  path: string;
  referrer?: string;
  timestamp: string;
  userAgent?: string;
};

export type LaunchAuditSummary = {
  countsByRole: Record<string, number>;
  countsBySource: Record<string, number>;
  latest: LaunchAuditRecord[];
  path: string;
  privacyNotice: string;
  total: number;
};

export async function saveLaunchAudit(input: {
  context?: Partial<MoodleLaunchContext>;
  path?: string;
  referrer?: string;
  userAgent?: string;
}) {
  const record: LaunchAuditRecord = {
    context: normalizeMoodleLaunchContext(input.context),
    path: cleanValue(input.path, "/embed"),
    referrer: cleanOptional(input.referrer),
    timestamp: new Date().toISOString(),
    userAgent: cleanOptional(input.userAgent)
  };

  await appendFile(LAUNCH_AUDIT_PATH, `${JSON.stringify(record)}\n`, "utf8");

  return record;
}

export async function readLaunchAuditSummary(): Promise<LaunchAuditSummary> {
  try {
    const content = await readFile(LAUNCH_AUDIT_PATH, "utf8");
    const records = content
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as LaunchAuditRecord);

    return summarizeLaunchAudit(records);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code !== "ENOENT") {
      throw error;
    }

    return summarizeLaunchAudit([]);
  }
}

function summarizeLaunchAudit(records: LaunchAuditRecord[]): LaunchAuditSummary {
  const countsByRole: Record<string, number> = {};
  const countsBySource: Record<string, number> = {};

  for (const record of records) {
    countsByRole[record.context.role] = (countsByRole[record.context.role] ?? 0) + 1;
    countsBySource[record.context.launchSource] =
      (countsBySource[record.context.launchSource] ?? 0) + 1;
  }

  return {
    countsByRole,
    countsBySource,
    latest: records.slice(-MAX_RECENT_RECORDS).reverse(),
    path: "data/moodle-launch-audit.jsonl",
    privacyNotice:
      "Launch audit records are pilot diagnostics only. They avoid names, emails, grades, and student identifiers.",
    total: records.length
  };
}

function cleanOptional(value?: string) {
  const cleaned = cleanValue(value, "");

  return cleaned || undefined;
}

function cleanValue(value: string | undefined, fallback: string) {
  return value?.replace(/\s+/g, " ").trim().slice(0, 240) || fallback;
}
