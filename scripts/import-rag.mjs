import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inflateRawSync, inflateSync } from "node:zlib";
import { PDFParse } from "pdf-parse";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = readLocalEnv(path.join(root, ".env.local"));
const sourceDirectory = path.resolve(
  process.argv[2] ||
    process.env.RAG_DATA_DIR ||
    env.RAG_DATA_DIR ||
    path.join(root, "data", "rag-sources")
);
const outputPath = path.resolve(
  process.env.RAG_INDEX_PATH ||
    env.RAG_INDEX_PATH ||
    path.join(root, "data", "rag-index.json")
);
const supportedExtensions = new Set([".pdf", ".pptx", ".md", ".txt"]);

const files = await listFiles(sourceDirectory);
const chunks = [];
const fileRecords = [];

for (const filePath of files) {
  const relativePath = path.relative(sourceDirectory, filePath).split(path.sep).join("/");
  const extension = path.extname(filePath).toLowerCase();
  const fileStats = await stat(filePath);

  try {
    const buffer = await readFile(filePath);
    const text = await extractText(buffer, extension);
    const fileChunks = chunkText(text);

    fileChunks.forEach((textChunk, index) => {
      chunks.push({
        id: `${relativePath}#${index + 1}`,
        source: relativePath,
        text: textChunk
      });
    });

    fileRecords.push({
      bytes: fileStats.size,
      extractedCharacters: text.length,
      modifiedAt: fileStats.mtime.toISOString(),
      path: relativePath,
      status: text ? "indexed" : "no-text",
      type: extension.slice(1),
      chunks: fileChunks.length
    });
  } catch (error) {
    fileRecords.push({
      bytes: fileStats.size,
      extractedCharacters: 0,
      modifiedAt: fileStats.mtime.toISOString(),
      path: relativePath,
      status: "error",
      type: extension.slice(1),
      chunks: 0,
      error: error instanceof Error ? error.message : "Unknown extraction error."
    });
  }
}

const indexed = fileRecords.filter((file) => file.status === "indexed");
const output = {
  generatedAt: new Date().toISOString(),
  sourceDirectory,
  files: fileRecords,
  chunks
};

await writeFile(outputPath, `${JSON.stringify(output)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      outputPath,
      sourceDirectory,
      files: fileRecords.length,
      indexedFiles: indexed.length,
      chunks: chunks.length,
      noTextFiles: fileRecords.filter((file) => file.status === "no-text").length,
      errors: fileRecords.filter((file) => file.status === "error").length
    },
    null,
    2
  )
);

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      result.push(...(await listFiles(entryPath)));
      continue;
    }

    if (entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase())) {
      result.push(entryPath);
    }
  }

  return result;
}

async function extractText(buffer, extension) {
  if (extension === ".pdf") return extractPdfText(buffer);
  if (extension === ".pptx") return extractPptxText(buffer);
  return cleanText(buffer.toString("utf8"));
}

async function extractPdfText(buffer) {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return cleanText(result.text);
  } finally {
    await parser.destroy();
  }
}

function inflatePdfStream(buffer) {
  const candidates = [buffer];
  if (buffer.at(-1) === 10) candidates.push(buffer.subarray(0, -1));
  if (buffer.at(-1) === 13) candidates.push(buffer.subarray(0, -1));

  for (const candidate of candidates) {
    try {
      return inflateRawSync(candidate);
    } catch {}

    try {
      return inflateSync(candidate);
    } catch {}
  }

  return buffer;
}

function extractPdfOperators(stream) {
  const pieces = [];
  let cursor = 0;

  while (cursor < stream.length) {
    const textStart = stream.indexOf("BT", cursor);
    if (textStart < 0) break;

    const textEnd = stream.indexOf("ET", textStart + 2);
    const block = stream.slice(textStart, textEnd < 0 ? stream.length : textEnd);

    for (let index = 0; index < block.length; index += 1) {
      if (block[index] === "(") {
        const end = findPdfLiteralEnd(block, index);
        if (end >= 0) {
          pieces.push(decodePdfToken(block.slice(index, end + 1)));
          index = end;
        }
      } else if (block[index] === "<" && block[index + 1] !== "<") {
        const end = block.indexOf(">", index + 1);
        if (end >= 0) {
          pieces.push(decodePdfToken(block.slice(index, end + 1)));
          index = end;
        }
      }
    }

    cursor = textEnd < 0 ? stream.length : textEnd + 2;
  }

  return pieces.join(" ");
}

function findPdfLiteralEnd(value, start) {
  let depth = 1;
  let escaped = false;

  for (let index = start + 1; index < value.length; index += 1) {
    const character = value[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (character === "\\") {
      escaped = true;
    } else if (character === "(") {
      depth += 1;
    } else if (character === ")") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  return -1;
}

function decodePdfToken(token) {
  if (token.startsWith("<")) {
    const hex = token.slice(1, -1).replace(/\s/g, "");
    const normalized = hex.length % 2 ? `${hex}0` : hex;
    return decodePdfBytes(Buffer.from(normalized, "hex"));
  }

  const source = token.slice(1, -1);
  const bytes = [];

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (character !== "\\") {
      bytes.push(source.charCodeAt(index));
      continue;
    }

    const next = source[index + 1] || "";
    const escapes = { b: 8, f: 12, n: 10, r: 13, t: 9 };

    if (escapes[next] !== undefined) {
      bytes.push(escapes[next]);
      index += 1;
      continue;
    }

    if (next === "\r" || next === "\n") {
      index += next === "\r" && source[index + 2] === "\n" ? 2 : 1;
      continue;
    }

    if (/[0-7]/.test(next)) {
      const octal = source.slice(index + 1).match(/^[0-7]{1,3}/)?.[0] || next;
      bytes.push(Number.parseInt(octal, 8));
      index += octal.length;
      continue;
    }

    bytes.push(next.charCodeAt(0));
    index += 1;
  }

  return decodePdfBytes(Buffer.from(bytes));
}

function decodePdfBytes(buffer) {
  if (buffer[0] === 0xfe && buffer[1] === 0xff) {
    const littleEndian = Buffer.alloc(buffer.length - 2);
    for (let index = 2; index + 1 < buffer.length; index += 2) {
      littleEndian[index - 2] = buffer[index + 1];
      littleEndian[index - 1] = buffer[index];
    }
    return littleEndian.toString("utf16le");
  }

  return buffer.toString("latin1");
}

function extractPptxText(buffer) {
  const endOfCentralDirectory = findEndOfCentralDirectory(buffer);
  if (endOfCentralDirectory < 0) return "";

  const entryCount = buffer.readUInt16LE(endOfCentralDirectory + 10);
  const centralDirectoryOffset = buffer.readUInt32LE(endOfCentralDirectory + 16);
  const parts = [];
  let cursor = centralDirectoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (buffer.readUInt32LE(cursor) !== 0x02014b50) break;

    const compressionMethod = buffer.readUInt16LE(cursor + 10);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const fileNameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localHeaderOffset = buffer.readUInt32LE(cursor + 42);
    const fileName = buffer
      .subarray(cursor + 46, cursor + 46 + fileNameLength)
      .toString("utf8");

    if (/^ppt\/(slides|notesSlides)\/.*\.xml$/i.test(fileName)) {
      const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
      const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
      const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
      const xml = compressionMethod === 8
        ? inflateRawSync(compressed).toString("utf8")
        : compressed.toString("utf8");
      const text = [...xml.matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)]
        .map((match) => decodeXml(match[1]))
        .join(" ");

      if (text.trim()) parts.push(`## ${fileName}\n${text}`);
    }

    cursor += 46 + fileNameLength + extraLength + commentLength;
  }

  return cleanText(parts.join("\n\n"));
}

function findEndOfCentralDirectory(buffer) {
  const minimumOffset = Math.max(0, buffer.length - 65557);

  for (let offset = buffer.length - 22; offset >= minimumOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset;
  }

  return -1;
}

function decodeXml(value) {
  return value
    .replace(/&#x([\da-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function chunkText(text) {
  const words = cleanText(text).split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const chunks = [];
  const maxCharacters = 2400;
  const overlapWords = 45;
  let start = 0;

  while (start < words.length) {
    const selected = [];
    let characters = 0;
    let end = start;

    while (end < words.length) {
      const nextLength = characters + words[end].length + (selected.length ? 1 : 0);
      if (selected.length && nextLength > maxCharacters) break;
      selected.push(words[end]);
      characters = nextLength;
      end += 1;
    }

    chunks.push(selected.join(" "));
    if (end >= words.length) break;
    start = Math.max(start + 1, end - overlapWords);
  }

  return chunks;
}

function cleanText(value) {
  return value
    .replace(/\0/g, "")
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function readLocalEnv(filePath) {
  const values = {};

  try {
    const content = readFileSync(filePath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const match = /^\s*([^#][^=]*)=(.*)$/.exec(line);
      if (match) values[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, "");
    }
  } catch {}

  return values;
}
