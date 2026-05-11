import { readFile } from "fs/promises";
import path from "path";

const KNOWLEDGE_BASE_PATH = path.join(
  process.cwd(),
  "data",
  "fyec100-knowledge-base.md"
);

// Phase 1 keeps course content in a local Markdown file so admins can update it
// without running migrations or managing a database.
export async function readKnowledgeBase() {
  return readFile(KNOWLEDGE_BASE_PATH, "utf8");
}
