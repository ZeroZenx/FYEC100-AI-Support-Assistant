import { appendFile, readFile, stat } from "fs/promises";
import path from "path";

export type StorageCollection =
  | "audit-events"
  | "configuration-records"
  | "evaluation-results"
  | "feedback"
  | "kb-releases"
  | "launch-states"
  | "service-desk-cases";

export type StorageRecord = {
  id: string;
  payload: unknown;
  timestamp: string;
};

export type StorageProvider = {
  append(collection: StorageCollection, record: StorageRecord): Promise<void>;
  list(collection: StorageCollection): Promise<StorageRecord[]>;
  status(): Promise<StorageProviderStatus>;
};

export type StorageProviderStatus = {
  adapter: "local-file" | "postgresql-scaffold" | "sql-server-scaffold";
  collections: Array<{
    collection: StorageCollection;
    path: string;
    present: boolean;
    sizeBytes: number;
    target: "pilot-local" | "production-approved-store";
  }>;
};

const DATA_DIR = path.join(process.cwd(), "data");

const collectionFiles: Record<StorageCollection, string> = {
  "audit-events": "audit-events.jsonl",
  "configuration-records": "admin-actions.json",
  "evaluation-results": "evaluation-results.jsonl",
  feedback: "pilot-feedback.jsonl",
  "kb-releases": "kb-release-notes.json",
  "launch-states": "lti-launch-states.jsonl",
  "service-desk-cases": "service-desk-cases.jsonl"
};

export const storageProviderContract = [
  "append(collection, record)",
  "list(collection)",
  "status()",
  "export(collection)",
  "retentionPreview(policy)",
  "deleteByPolicy(policy, approval)"
];

export function getLocalFileStorageProvider(): StorageProvider {
  return {
    async append(collection, record) {
      await appendFile(
        path.join(DATA_DIR, collectionFiles[collection]),
        `${JSON.stringify(record)}\n`,
        "utf8"
      );
    },
    async list(collection) {
      try {
        const content = await readFile(
          path.join(DATA_DIR, collectionFiles[collection]),
          "utf8"
        );

        return content
          .split("\n")
          .filter(Boolean)
          .map((line) => JSON.parse(line) as StorageRecord);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }

        return [];
      }
    },
    async status() {
      return getStorageProviderStatus();
    }
  };
}

export async function getStorageProviderStatus(): Promise<StorageProviderStatus> {
  const collections = await Promise.all(
    Object.entries(collectionFiles).map(async ([collection, fileName]) => {
      const relativePath = `data/${fileName}`;
      try {
        const stats = await stat(path.join(DATA_DIR, fileName));

        return {
          collection: collection as StorageCollection,
          path: relativePath,
          present: true,
          sizeBytes: stats.size,
          target: isProductionTarget(collection as StorageCollection)
            ? "production-approved-store"
            : "pilot-local"
        } as const;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }

        return {
          collection: collection as StorageCollection,
          path: relativePath,
          present: false,
          sizeBytes: 0,
          target: isProductionTarget(collection as StorageCollection)
            ? "production-approved-store"
            : "pilot-local"
        } as const;
      }
    })
  );

  return {
    adapter: "local-file",
    collections
  };
}

export const productionAdapterScaffold = [
  "Create a PostgreSQL or SQL Server connection module only after COSTAATT confirms the approved platform.",
  "Map each StorageCollection to a table with id, timestamp, source, payload JSON, retention status, and audit metadata.",
  "Use parameterized queries and platform secret management.",
  "Keep local file adapter available for development and offline demos.",
  "Add migration scripts only after schema approval."
];

function isProductionTarget(collection: StorageCollection) {
  return [
    "audit-events",
    "evaluation-results",
    "feedback",
    "launch-states",
    "service-desk-cases"
  ].includes(collection);
}
