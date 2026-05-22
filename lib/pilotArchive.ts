import { readFile, stat, writeFile } from "fs/promises";
import { createHash } from "crypto";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ARCHIVE_HISTORY_PATH = path.join(DATA_DIR, "pilot-archive-history.jsonl");

const EXPORT_FILES = [
  "pilot-feedback.jsonl",
  "service-desk-cases.jsonl",
  "audit-events.jsonl",
  "evaluation-results.jsonl",
  "kb-release-notes.json",
  "moodle-launch-audit.jsonl",
  "launch-checklist.json",
  "course-registry.json"
];

export async function buildPilotArchive(options: { redact?: boolean } = {}) {
  const files = await Promise.all(EXPORT_FILES.map((file) => readExportFile(file, Boolean(options.redact))));
  const existing = files.filter((file) => file.exists);
  const manifest = {
    createdAt: new Date().toISOString(),
    excluded: files.filter((file) => !file.exists).map((file) => file.path),
    files: existing.map(({ content: _content, ...file }) => file),
    recordCounts: Object.fromEntries(existing.map((file) => [file.path, file.recordCount])),
    redacted: Boolean(options.redact),
    warnings: [
      "This local Phase 2 archive bundle is JSON-based. Compress externally if a ZIP file is required for governance storage.",
      "Review exports before sharing outside the project team."
    ]
  };
  const bundle = {
    files: Object.fromEntries(existing.map((file) => [file.path, file.content])),
    manifest
  };

  await writeFile(ARCHIVE_HISTORY_PATH, `${JSON.stringify({
    createdAt: manifest.createdAt,
    fileCount: existing.length,
    redacted: manifest.redacted
  })}\n`, { flag: "a" });

  return bundle;
}

export async function readArchiveHistory() {
  try {
    const content = await readFile(ARCHIVE_HISTORY_PATH, "utf8");
    return content.split("\n").filter(Boolean).map((line) => JSON.parse(line) as Record<string, unknown>);
  } catch {
    return [];
  }
}

async function readExportFile(file: string, redact: boolean) {
  const filePath = path.join(DATA_DIR, file);
  try {
    const [content, info] = await Promise.all([readFile(filePath, "utf8"), stat(filePath)]);
    const safeContent = redact ? redactSensitiveText(content) : content;
    return {
      checksum: createHash("sha256").update(safeContent).digest("hex"),
      content: safeContent,
      exists: true,
      path: `data/${file}`,
      recordCount: countRecords(content),
      sizeBytes: info.size
    };
  } catch {
    return {
      checksum: "",
      content: "",
      exists: false,
      path: `data/${file}`,
      recordCount: 0,
      sizeBytes: 0
    };
  }
}

function countRecords(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return 0;
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return 1;
  return trimmed.split("\n").filter(Boolean).length;
}

function redactSensitiveText(content: string) {
  return content
    .replace(/\b\d{6,}\b/g, "[redacted-number]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/password[^,\n}]*/gi, "password:[redacted]")
    .slice(0, 250000);
}
