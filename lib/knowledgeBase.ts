import { readFile, stat } from "fs/promises";
import path from "path";

export const KNOWLEDGE_BASE_PATH = path.join(
  process.cwd(),
  "data",
  "fyec100-knowledge-base.md"
);

// Phase 1 keeps course content in a local Markdown file so admins can update it
// without running migrations or managing a database.
export async function readKnowledgeBase() {
  return readFile(KNOWLEDGE_BASE_PATH, "utf8");
}

export async function getKnowledgeBaseMetadata() {
  const [content, stats] = await Promise.all([
    readKnowledgeBase(),
    stat(KNOWLEDGE_BASE_PATH)
  ]);
  const headings = extractHeadings(content);
  const words = content.trim().split(/\s+/).filter(Boolean);
  const legacyReviewed = process.env.KNOWLEDGE_BASE_REVIEWED === "true";

  return {
    characterCount: content.length,
    headings,
    lastUpdated: stats.mtime.toISOString(),
    lineCount: content.split("\n").length,
    needsReview: !legacyReviewed,
    path: "data/fyec100-knowledge-base.md",
    preview: getPreview(content),
    reviewStatus: legacyReviewed
      ? "Marked reviewed through KNOWLEDGE_BASE_REVIEWED=true."
      : "Needs lecturer/content-owner review before hosted pilot.",
    sizeBytes: stats.size,
    wordCount: words.length
  };
}

function extractHeadings(content: string) {
  return content
    .split("\n")
    .filter((line) => /^#{1,4}\s+/.test(line))
    .map((line) => {
      const match = /^(#{1,4})\s+(.+)$/.exec(line);

      return {
        level: match?.[1].length ?? 1,
        title: match?.[2].trim() ?? line.trim()
      };
    });
}

function getPreview(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();

  return normalized.length > 600
    ? `${normalized.slice(0, 597)}...`
    : normalized;
}
