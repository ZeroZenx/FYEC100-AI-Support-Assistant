import { appendFile, readFile } from "fs/promises";
import path from "path";

const FEEDBACK_PATH = path.join(process.cwd(), "data", "pilot-feedback.jsonl");
const MAX_EXCERPT_LENGTH = 320;

export type FeedbackRating = "helpful" | "not-helpful" | "lecturer-follow-up";

export type PilotFeedbackRecord = {
  assistantResponseExcerpt: string;
  mode: "standalone" | "embedded";
  note?: string;
  rating: FeedbackRating;
  studentQuestionExcerpt: string;
  timestamp: string;
};

export type PilotFeedbackSummary = {
  counts: Record<FeedbackRating, number>;
  latest: PilotFeedbackRecord[];
  total: number;
};

function excerpt(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= MAX_EXCERPT_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, MAX_EXCERPT_LENGTH - 3)}...`;
}

export async function savePilotFeedback(input: {
  assistantResponse: string;
  mode: PilotFeedbackRecord["mode"];
  note?: string;
  rating: FeedbackRating;
  studentQuestion: string;
}) {
  const record: PilotFeedbackRecord = {
    assistantResponseExcerpt: excerpt(input.assistantResponse),
    mode: input.mode,
    note: input.note ? excerpt(input.note) : undefined,
    rating: input.rating,
    studentQuestionExcerpt: excerpt(input.studentQuestion),
    timestamp: new Date().toISOString()
  };

  await appendFile(FEEDBACK_PATH, `${JSON.stringify(record)}\n`, "utf8");

  return record;
}

export async function readPilotFeedbackSummary(): Promise<PilotFeedbackSummary> {
  const counts: Record<FeedbackRating, number> = {
    helpful: 0,
    "not-helpful": 0,
    "lecturer-follow-up": 0
  };

  try {
    const content = await readFile(FEEDBACK_PATH, "utf8");
    const records = content
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as PilotFeedbackRecord);

    for (const record of records) {
      counts[record.rating] += 1;
    }

    return {
      counts,
      latest: records.slice(-5).reverse(),
      total: records.length
    };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code !== "ENOENT") {
      throw error;
    }

    return {
      counts,
      latest: [],
      total: 0
    };
  }
}
