import { readFile, stat } from "fs/promises";
import path from "path";

type RagChunk = {
  id: string;
  source: string;
  text: string;
};

type RagIndex = {
  generatedAt: string;
  sourceDirectory: string;
  files: Array<{
    path: string;
    status: string;
    chunks: number;
  }>;
  chunks: RagChunk[];
};

let cachedIndex: { modifiedAt: number; index: RagIndex } | null = null;

export async function retrieveRagContext(query: string) {
  const index = await loadRagIndex();
  if (!index || !index.chunks.length) return "";

  const queryTokens = tokenize(query);
  const ranked = index.chunks
    .map((chunk) => ({ chunk, score: scoreChunk(chunk, query, queryTokens) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);
  const selected = (ranked.length ? ranked.map((item) => item.chunk) : index.chunks).slice(0, 6);

  return selected
    .map((chunk) => `[Source: ${chunk.source}]\n${chunk.text}`)
    .join("\n\n");
}

export async function getRagCorpusStatus() {
  const sourceDirectory = process.env.RAG_DATA_DIR?.trim() || "";
  const indexPath = getRagIndexPath();

  try {
    const [index, indexStats] = await Promise.all([loadRagIndex(), stat(indexPath)]);

    return {
      configured: Boolean(sourceDirectory),
      generatedAt: index?.generatedAt || "",
      indexPath: path.relative(process.cwd(), indexPath).split(path.sep).join("/"),
      indexedFiles: index?.files.filter((file) => file.status === "indexed").length || 0,
      chunkCount: index?.chunks.length || 0,
      ready: Boolean(index && index.chunks.length),
      sourceDirectory,
      indexModifiedAt: indexStats.mtime.toISOString()
    };
  } catch {
    return {
      configured: Boolean(sourceDirectory),
      generatedAt: "",
      indexPath: path.relative(process.cwd(), indexPath).split(path.sep).join("/"),
      indexedFiles: 0,
      chunkCount: 0,
      ready: false,
      sourceDirectory,
      indexModifiedAt: ""
    };
  }
}

async function loadRagIndex() {
  const indexPath = getRagIndexPath();

  try {
    const indexStats = await stat(indexPath);
    if (cachedIndex?.modifiedAt === indexStats.mtimeMs) return cachedIndex.index;

    const parsed = JSON.parse(await readFile(indexPath, "utf8")) as RagIndex;
    if (!Array.isArray(parsed.chunks) || !Array.isArray(parsed.files)) return null;

    cachedIndex = { modifiedAt: indexStats.mtimeMs, index: parsed };
    return parsed;
  } catch {
    return null;
  }
}

function getRagIndexPath() {
  return path.resolve(
    process.cwd(),
    process.env.RAG_INDEX_PATH?.trim() || path.join("data", "rag-index.json")
  );
}

function scoreChunk(chunk: RagChunk, query: string, queryTokens: string[]) {
  const text = chunk.text.toLowerCase();
  const source = chunk.source.toLowerCase();
  let score = query.trim() && text.includes(query.trim().toLowerCase()) ? 20 : 0;

  for (const token of queryTokens) {
    if (source.includes(token)) score += 6;
    if (text.includes(token)) score += 1;
    score += Math.min(countOccurrences(text, token), 4);
  }

  return score;
}

function tokenize(value: string) {
  const stopWords = new Set([
    "about", "after", "again", "also", "and", "are", "can", "could", "from", "have",
    "help", "how", "into", "just", "like", "more", "need", "please", "should", "that",
    "the", "their", "this", "what", "when", "where", "which", "with", "would", "your"
  ]);

  return Array.from(new Set(
    value
      .toLowerCase()
      .match(/[a-z0-9][a-z0-9_-]{2,}/g)
      ?.filter((token) => !stopWords.has(token)) || []
  ));
}

function countOccurrences(value: string, token: string) {
  let count = 0;
  let position = 0;

  while ((position = value.indexOf(token, position)) >= 0) {
    count += 1;
    position += token.length;
  }

  return count;
}
