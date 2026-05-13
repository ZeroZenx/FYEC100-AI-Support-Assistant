import { appendFile, readFile } from "fs/promises";
import path from "path";

const FEEDBACK_PATH = path.join(process.cwd(), "data", "pilot-feedback.jsonl");
const MAX_EXCERPT_LENGTH = 320;

export type FeedbackRating = "helpful" | "not-helpful" | "lecturer-follow-up";

export type EscalationCategory =
  | "lecturer-follow-up"
  | "lms-administrator"
  | "knowledge-base-update"
  | "technical-provider-issue"
  | "none";

export type PilotFeedbackRecord = {
  assistantResponseExcerpt: string;
  escalationCategory?: EscalationCategory;
  escalationOwner?: string;
  escalationReason?: string;
  mode: "standalone" | "embedded";
  note?: string;
  rating: FeedbackRating;
  studentQuestionExcerpt: string;
  timestamp: string;
};

export type PilotFeedbackSummary = {
  escalationCounts: Record<EscalationCategory, number>;
  counts: Record<FeedbackRating, number>;
  latest: PilotFeedbackRecord[];
  reviewQueue: PilotFeedbackRecord[];
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
  const review = classifyFeedback({
    assistantResponseExcerpt: excerpt(input.assistantResponse),
    mode: input.mode,
    note: input.note ? excerpt(input.note) : undefined,
    rating: input.rating,
    studentQuestionExcerpt: excerpt(input.studentQuestion),
    timestamp: new Date().toISOString()
  });
  const record: PilotFeedbackRecord = {
    assistantResponseExcerpt: excerpt(input.assistantResponse),
    escalationCategory: review.escalationCategory,
    escalationOwner: review.escalationOwner,
    escalationReason: review.escalationReason,
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
  const escalationCounts = getEmptyEscalationCounts();

  try {
    const content = await readFile(FEEDBACK_PATH, "utf8");
    const records = content
      .split("\n")
      .filter(Boolean)
      .map((line) => classifyFeedback(JSON.parse(line) as PilotFeedbackRecord));

    for (const record of records) {
      counts[record.rating] += 1;
      escalationCounts[record.escalationCategory ?? "none"] += 1;
    }
    const reviewQueue = records
      .filter((record) => record.escalationCategory !== "none")
      .slice(-10)
      .reverse();

    return {
      counts,
      escalationCounts,
      latest: records.slice(-5).reverse(),
      reviewQueue,
      total: records.length
    };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code !== "ENOENT") {
      throw error;
    }

    return {
      counts,
      escalationCounts,
      latest: [],
      reviewQueue: [],
      total: 0
    };
  }
}

function classifyFeedback(record: PilotFeedbackRecord): PilotFeedbackRecord {
  const text = [
    record.rating,
    record.note,
    record.studentQuestionExcerpt,
    record.assistantResponseExcerpt
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (record.rating === "lecturer-follow-up") {
    return withEscalation(
      record,
      "lecturer-follow-up",
      "Course interpretation or assignment guidance should be reviewed by the lecturer."
    );
  }

  if (/(lms|moodle|login|password|access|course shell|upload|file|navigation)/i.test(text)) {
    return withEscalation(
      record,
      "lms-administrator",
      "The feedback may involve LMS access, navigation, or Moodle course shell support."
    );
  }

  if (/(missing|not in|incorrect|outdated|wrong|knowledge base|course outline|deadline)/i.test(text)) {
    return withEscalation(
      record,
      "knowledge-base-update",
      "The FYEC100 knowledge base may need review or a content update."
    );
  }

  if (/(error|api|provider|openai|ollama|timeout|slow|not respond|server)/i.test(text)) {
    return withEscalation(
      record,
      "technical-provider-issue",
      "The feedback may point to a technical or AI provider reliability issue."
    );
  }

  if (record.rating === "not-helpful") {
    return withEscalation(
      record,
      "knowledge-base-update",
      "A not-helpful response should be checked for missing content or unclear assistant behavior."
    );
  }

  return {
    ...record,
    escalationCategory: "none",
    escalationOwner: "Pilot review team",
    escalationReason: "No immediate escalation category detected."
  };
}

function getEscalationOwner(category: EscalationCategory) {
  const owners: Record<EscalationCategory, string> = {
    "lecturer-follow-up": "Lecturer / Project Lead",
    "lms-administrator": "LMS Administrator",
    "knowledge-base-update": "Developer / Lecturer reviewer",
    "technical-provider-issue": "Technical Lead / System Administrator",
    none: "Pilot review team"
  };

  return owners[category];
}

function withEscalation(
  record: PilotFeedbackRecord,
  escalationCategory: EscalationCategory,
  escalationReason: string
): PilotFeedbackRecord {
  return {
    ...record,
    escalationCategory,
    escalationOwner: getEscalationOwner(escalationCategory),
    escalationReason
  };
}

function getEmptyEscalationCounts(): Record<EscalationCategory, number> {
  return {
    "lecturer-follow-up": 0,
    "lms-administrator": 0,
    "knowledge-base-update": 0,
    "technical-provider-issue": 0,
    none: 0
  };
}
