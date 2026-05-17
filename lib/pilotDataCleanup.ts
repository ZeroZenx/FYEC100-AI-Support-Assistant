import { mkdir, readFile, stat, writeFile } from "fs/promises";
import path from "path";
import { getPilotModeStatus } from "@/lib/pilotMode";

type CleanupFileStatus = {
  description: string;
  exists: boolean;
  label: string;
  path: string;
  recordCount: number;
  resettable: boolean;
  sizeBytes: number;
};

type ResetTarget = "feedback" | "launch-audit" | "all";

const DATA_DIR = path.join(process.cwd(), "data");
const cleanupFiles = [
  {
    description: "Privacy-light feedback records used by review, analytics, and support triage.",
    key: "feedback",
    label: "Pilot feedback",
    path: path.join(DATA_DIR, "pilot-feedback.jsonl"),
    relativePath: "data/pilot-feedback.jsonl"
  },
  {
    description: "Privacy-light Moodle launch diagnostics used by analytics and readiness review.",
    key: "launch-audit",
    label: "Moodle launch audit",
    path: path.join(DATA_DIR, "moodle-launch-audit.jsonl"),
    relativePath: "data/moodle-launch-audit.jsonl"
  }
] as const;

export const cleanupConfirmationPhrase = "RESET PILOT DATA";

export async function buildPilotDataCleanupPreview() {
  const files = await Promise.all(cleanupFiles.map(getFileStatus));
  const pilotMode = getPilotModeStatus();
  const totalRecords = files.reduce((sum, file) => sum + file.recordCount, 0);
  const totalBytes = files.reduce((sum, file) => sum + file.sizeBytes, 0);

  return {
    confirmationPhrase: cleanupConfirmationPhrase,
    exportPath: "/api/admin/pilot-data-cleanup.md",
    files,
    generatedAt: new Date().toISOString(),
    modeWarning:
      pilotMode.mode === "pilot"
        ? "Pilot mode is active. Export needed records before any reset."
        : "Demo mode is active. Reset is intended for rehearsal and walkthrough cleanup.",
    pilotMode,
    resetEndpoint: "/api/admin/pilot-data-cleanup",
    resetMethod: "POST",
    resetScope:
      "Only local pilot telemetry JSONL files are reset. Knowledge base, Moodle config, docs, source code, and governance records are not touched.",
    statusMessage:
      totalRecords > 0
        ? "Pilot telemetry contains demo or test records that can be reset before a clean pilot or sponsor demo."
        : "Pilot telemetry files are already empty or not present.",
    summary: {
      resettableFiles: files.filter((file) => file.resettable).length,
      totalBytes,
      totalRecords
    }
  };
}

export async function resetPilotData({
  confirmation,
  target
}: {
  confirmation?: string;
  target?: ResetTarget;
}) {
  if (confirmation !== cleanupConfirmationPhrase) {
    return {
      ok: false,
      error: `Confirmation phrase required: ${cleanupConfirmationPhrase}`,
      preview: await buildPilotDataCleanupPreview(),
      reset: []
    };
  }

  const targets = cleanupFiles.filter((file) =>
    target === "all" || !target ? true : file.key === target
  );

  await mkdir(DATA_DIR, { recursive: true });

  const reset = [];

  for (const file of targets) {
    const before = await getFileStatus(file);

    await writeFile(file.path, "", "utf8");

    reset.push({
      label: file.label,
      path: file.relativePath,
      recordsRemoved: before.recordCount,
      sizeBytesRemoved: before.sizeBytes
    });
  }

  return {
    ok: true,
    error: "",
    preview: await buildPilotDataCleanupPreview(),
    reset
  };
}

export async function renderPilotDataCleanupMarkdown() {
  const preview = await buildPilotDataCleanupPreview();

  return [
    "# FYEC100 Pilot Data Cleanup Preview",
    "",
    `Generated: ${new Date(preview.generatedAt).toLocaleString()}`,
    "",
    "## Summary",
    "",
    `- Total pilot telemetry records: ${preview.summary.totalRecords}`,
    `- Total telemetry bytes: ${preview.summary.totalBytes}`,
    `- Resettable files: ${preview.summary.resettableFiles}`,
    `- Pilot mode: ${preview.pilotMode.mode}`,
    `- Confirmation phrase: ${preview.confirmationPhrase}`,
    "",
    "## Reset Scope",
    "",
    preview.resetScope,
    "",
    "## Mode Warning",
    "",
    preview.modeWarning,
    "",
    "## Files",
    "",
    ...preview.files.map(
      (file) =>
        `- ${file.label}: ${file.recordCount} record(s), ${file.sizeBytes} byte(s), exists=${file.exists}, path=${file.path}`
    ),
    "",
    "## Reset Request Example",
    "",
    "```bash",
    "curl -X POST http://localhost:4100/api/admin/pilot-data-cleanup \\",
    "  -H 'Content-Type: application/json' \\",
    `  -d '{"confirmation":"${preview.confirmationPhrase}","target":"all"}'`,
    "```",
    "",
    "## Governance Notes",
    "",
    "- Use before a clean sponsor demo or controlled pilot start.",
    "- Do not use to remove official records after a live production process is approved.",
    "- Export pilot analytics, support triage, or reports first if the records are needed for review.",
    "- This tool does not reset the FYEC100 knowledge base or governance data.",
    ""
  ].join("\n");
}

async function getFileStatus(
  file: (typeof cleanupFiles)[number]
): Promise<CleanupFileStatus> {
  try {
    const [metadata, content] = await Promise.all([
      stat(file.path),
      readFile(file.path, "utf8")
    ]);

    return {
      description: file.description,
      exists: true,
      label: file.label,
      path: file.relativePath,
      recordCount: countJsonlRecords(content),
      resettable: true,
      sizeBytes: metadata.size
    };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code !== "ENOENT") {
      throw error;
    }

    return {
      description: file.description,
      exists: false,
      label: file.label,
      path: file.relativePath,
      recordCount: 0,
      resettable: true,
      sizeBytes: 0
    };
  }
}

function countJsonlRecords(content: string) {
  return content.split("\n").filter((line) => line.trim()).length;
}
