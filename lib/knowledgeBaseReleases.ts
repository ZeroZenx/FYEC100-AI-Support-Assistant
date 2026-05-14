import { readFile, stat } from "fs/promises";
import path from "path";
import { getKnowledgeBaseChangeRequests } from "@/lib/knowledgeBaseChangeRequests";
import { getKnowledgeBaseReviewStatus } from "@/lib/knowledgeBaseReview";

const RELEASES_PATH = path.join(
  process.cwd(),
  "data",
  "kb-release-notes.json"
);

export type KnowledgeBaseReleaseStatus =
  | "approved"
  | "draft"
  | "released"
  | "superseded";

export type KnowledgeBaseRelease = {
  approvedBy: string;
  changeRequestIds: string[];
  changes: string[];
  id: string;
  knowledgeBasePath: string;
  knownLimitations: string[];
  notes: string;
  pilotStage: string;
  releasedAt: string;
  releaseStatus: KnowledgeBaseReleaseStatus;
  reviewer: string;
  summary: string;
  versionLabel: string;
};

type KnowledgeBaseReleaseRecord = {
  governanceNotes: string[];
  lastUpdatedAt: string;
  releases: KnowledgeBaseRelease[];
  version: string;
};

export async function getKnowledgeBaseReleases() {
  const [record, stats, review, changeRequests] = await Promise.all([
    readKnowledgeBaseReleaseRecord(),
    stat(RELEASES_PATH),
    getKnowledgeBaseReviewStatus(),
    getKnowledgeBaseChangeRequests()
  ]);
  const byStatus = countByReleaseStatus(record.releases);
  const latestRelease = record.releases[0] ?? null;
  const draftReleases = record.releases.filter(
    (release) => release.releaseStatus === "draft"
  );

  return {
    byStatus,
    draftReleases,
    latestRelease,
    record,
    releaseFile: {
      lastUpdated: stats.mtime.toISOString(),
      path: "data/kb-release-notes.json",
      sizeBytes: stats.size
    },
    relatedWorkflow: {
      approvedChangeRequests: changeRequests.summary.approved,
      changeRequestsExportPath: changeRequests.exportPath,
      highPriorityPendingChangeRequests:
        changeRequests.summary.highPriorityPending,
      knowledgeBaseReadyForPilot: review.readyForPilot,
      reviewExportPath: review.exportPath,
      reviewStatus: review.record.approvalStatus
    },
    exportPath: "/api/admin/knowledge-base/releases.md",
    summary: {
      approved: byStatus.approved ?? 0,
      draft: byStatus.draft ?? 0,
      released: byStatus.released ?? 0,
      superseded: byStatus.superseded ?? 0,
      total: record.releases.length
    }
  };
}

export async function renderKnowledgeBaseReleasesMarkdown() {
  const releases = await getKnowledgeBaseReleases();

  return [
    "# FYEC100 Knowledge Base Releases",
    "",
    `- Version: ${releases.record.version}`,
    `- Release file: ${releases.releaseFile.path}`,
    `- Total releases: ${releases.summary.total}`,
    `- Draft: ${releases.summary.draft}`,
    `- Approved: ${releases.summary.approved}`,
    `- Released: ${releases.summary.released}`,
    `- Superseded: ${releases.summary.superseded}`,
    "",
    "## Related Workflow",
    "",
    `- Knowledge base review status: ${releases.relatedWorkflow.reviewStatus}`,
    `- Knowledge base ready for pilot: ${
      releases.relatedWorkflow.knowledgeBaseReadyForPilot ? "Yes" : "No"
    }`,
    `- Approved change requests: ${releases.relatedWorkflow.approvedChangeRequests}`,
    `- High-priority pending change requests: ${releases.relatedWorkflow.highPriorityPendingChangeRequests}`,
    "",
    "## Releases",
    "",
    ...releases.record.releases.flatMap((release) => [
      `### ${release.id}: ${release.versionLabel}`,
      "",
      `- Status: ${release.releaseStatus}`,
      `- Pilot stage: ${release.pilotStage}`,
      `- Knowledge base path: ${release.knowledgeBasePath}`,
      `- Released at: ${release.releasedAt || "Not recorded"}`,
      `- Reviewer: ${release.reviewer || "Not recorded"}`,
      `- Approved by: ${release.approvedBy || "Not recorded"}`,
      `- Change request IDs: ${
        release.changeRequestIds.length > 0
          ? release.changeRequestIds.join(", ")
          : "None recorded"
      }`,
      `- Summary: ${release.summary}`,
      "",
      "Changes:",
      ...release.changes.map((item) => `- ${item}`),
      "",
      "Known limitations:",
      ...release.knownLimitations.map((item) => `- ${item}`),
      "",
      `Notes: ${release.notes}`,
      ""
    ]),
    "## Governance Notes",
    "",
    ...releases.record.governanceNotes.map((note) => `- ${note}`),
    ""
  ].join("\n");
}

async function readKnowledgeBaseReleaseRecord(): Promise<KnowledgeBaseReleaseRecord> {
  const content = await readFile(RELEASES_PATH, "utf8");
  const parsed = JSON.parse(content) as KnowledgeBaseReleaseRecord;

  return {
    governanceNotes: Array.isArray(parsed.governanceNotes)
      ? parsed.governanceNotes
      : [],
    lastUpdatedAt: parsed.lastUpdatedAt || "",
    releases: Array.isArray(parsed.releases)
      ? parsed.releases.map(normalizeRelease)
      : [],
    version: parsed.version || "phase-2-kb-releases"
  };
}

function normalizeRelease(release: KnowledgeBaseRelease): KnowledgeBaseRelease {
  return {
    approvedBy: release.approvedBy || "",
    changeRequestIds: Array.isArray(release.changeRequestIds)
      ? release.changeRequestIds
      : [],
    changes: Array.isArray(release.changes) ? release.changes : [],
    id: release.id || "KBR-000",
    knowledgeBasePath:
      release.knowledgeBasePath || "data/fyec100-knowledge-base.md",
    knownLimitations: Array.isArray(release.knownLimitations)
      ? release.knownLimitations
      : [],
    notes: release.notes || "",
    pilotStage: release.pilotStage || "Controlled FYEC100 Moodle pilot",
    releasedAt: release.releasedAt || "",
    releaseStatus: normalizeStatus(release.releaseStatus),
    reviewer: release.reviewer || "",
    summary: release.summary || "",
    versionLabel: release.versionLabel || "FYEC100 KB draft"
  };
}

function normalizeStatus(value: string): KnowledgeBaseReleaseStatus {
  const statuses: KnowledgeBaseReleaseStatus[] = [
    "approved",
    "draft",
    "released",
    "superseded"
  ];

  return statuses.includes(value as KnowledgeBaseReleaseStatus)
    ? (value as KnowledgeBaseReleaseStatus)
    : "draft";
}

function countByReleaseStatus(items: KnowledgeBaseRelease[]) {
  return items.reduce<Record<string, number>>((counts, item) => {
    const value = item.releaseStatus;
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}
