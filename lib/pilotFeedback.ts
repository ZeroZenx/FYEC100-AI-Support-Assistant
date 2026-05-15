import { appendFile, readFile } from "fs/promises";
import path from "path";

const FEEDBACK_PATH = path.join(process.cwd(), "data", "pilot-feedback.jsonl");
const MAX_EXCERPT_LENGTH = 320;

export type FeedbackCategory =
  | "academic-integrity-concern"
  | "helpful"
  | "lecturer-follow-up"
  | "lms-navigation-issue"
  | "missing-course-information"
  | "not-helpful"
  | "technical-issue";

export type FeedbackRating = FeedbackCategory;

export type EscalationCategory =
  | "academic-integrity"
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
  feedbackCategory?: FeedbackCategory;
  mode: "standalone" | "embedded";
  note?: string;
  rating: FeedbackRating;
  studentQuestionExcerpt: string;
  timestamp: string;
};

export type PilotFeedbackSummary = {
  counts: Record<FeedbackRating, number>;
  escalationCounts: Record<EscalationCategory, number>;
  recommendedOwnerCounts: Record<string, number>;
  latest: PilotFeedbackRecord[];
  reviewQueue: PilotFeedbackRecord[];
  total: number;
};

export const feedbackCategories: FeedbackCategory[] = [
  "helpful",
  "not-helpful",
  "lms-navigation-issue",
  "missing-course-information",
  "academic-integrity-concern",
  "technical-issue",
  "lecturer-follow-up"
];

function excerpt(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= MAX_EXCERPT_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, MAX_EXCERPT_LENGTH - 3)}...`;
}

export async function savePilotFeedback(input: {
  assistantResponse: string;
  feedbackCategory?: FeedbackCategory;
  mode: PilotFeedbackRecord["mode"];
  note?: string;
  rating: FeedbackRating;
  studentQuestion: string;
}) {
  const timestamp = new Date().toISOString();
  const feedbackCategory = normalizeFeedbackCategory(
    input.feedbackCategory ?? input.rating
  );
  const review = classifyFeedback({
    assistantResponseExcerpt: excerpt(input.assistantResponse),
    feedbackCategory,
    mode: input.mode,
    note: input.note ? excerpt(input.note) : undefined,
    rating: feedbackCategory,
    studentQuestionExcerpt: excerpt(input.studentQuestion),
    timestamp
  });
  const record: PilotFeedbackRecord = {
    assistantResponseExcerpt: excerpt(input.assistantResponse),
    escalationCategory: review.escalationCategory,
    escalationOwner: review.escalationOwner,
    escalationReason: review.escalationReason,
    feedbackCategory,
    mode: input.mode,
    note: input.note ? excerpt(input.note) : undefined,
    rating: feedbackCategory,
    studentQuestionExcerpt: excerpt(input.studentQuestion),
    timestamp
  };

  await appendFile(FEEDBACK_PATH, `${JSON.stringify(record)}\n`, "utf8");

  return record;
}

export async function readPilotFeedbackSummary(): Promise<PilotFeedbackSummary> {
  const counts = getEmptyFeedbackCounts();
  const escalationCounts = getEmptyEscalationCounts();
  const recommendedOwnerCounts: Record<string, number> = {};
  const records = await readPilotFeedbackRecords();

  for (const record of records) {
    counts[record.rating] += 1;
    escalationCounts[record.escalationCategory ?? "none"] += 1;
    const owner = record.escalationOwner ?? "Pilot review team";
    recommendedOwnerCounts[owner] = (recommendedOwnerCounts[owner] ?? 0) + 1;
  }
  const reviewQueue = records
    .filter((record) => record.escalationCategory !== "none")
    .slice(-10)
    .reverse();

  return {
    counts,
    escalationCounts,
    recommendedOwnerCounts,
    latest: records.slice(-5).reverse(),
    reviewQueue,
    total: records.length
  };
}

export async function readPilotFeedbackRecords(): Promise<PilotFeedbackRecord[]> {
  try {
    const content = await readFile(FEEDBACK_PATH, "utf8");

    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => classifyFeedback(JSON.parse(line) as PilotFeedbackRecord));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code !== "ENOENT") {
      throw error;
    }

    return [];
  }
}

function classifyFeedback(record: PilotFeedbackRecord): PilotFeedbackRecord {
  const normalizedRecord = normalizeRecord(record);
  const text = [
    normalizedRecord.rating,
    normalizedRecord.feedbackCategory,
    normalizedRecord.note,
    normalizedRecord.studentQuestionExcerpt,
    normalizedRecord.assistantResponseExcerpt
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (normalizedRecord.feedbackCategory === "lecturer-follow-up") {
    return withEscalation(
      normalizedRecord,
      "lecturer-follow-up",
      "Course interpretation or assignment guidance should be reviewed by the lecturer."
    );
  }

  if (normalizedRecord.feedbackCategory === "lms-navigation-issue") {
    return withEscalation(
      normalizedRecord,
      "lms-administrator",
      "The student identified Moodle, LMS navigation, access, or course shell support needs."
    );
  }

  if (normalizedRecord.feedbackCategory === "missing-course-information") {
    return withEscalation(
      normalizedRecord,
      "knowledge-base-update",
      "The FYEC100 knowledge base may need approved course information added or clarified."
    );
  }

  if (normalizedRecord.feedbackCategory === "academic-integrity-concern") {
    return withEscalation(
      normalizedRecord,
      "academic-integrity",
      "The feedback may involve responsible AI use, assignment writing, or academic integrity guidance."
    );
  }

  if (normalizedRecord.feedbackCategory === "technical-issue") {
    return withEscalation(
      normalizedRecord,
      "technical-provider-issue",
      "The feedback identifies a technical, model, provider, hosting, or reliability issue."
    );
  }

  if (/(lms|moodle|login|password|access|course shell|upload|file|navigation)/i.test(text)) {
    return withEscalation(
      normalizedRecord,
      "lms-administrator",
      "The feedback may involve LMS access, navigation, or Moodle course shell support."
    );
  }

  if (/(missing|not in|incorrect|outdated|wrong|knowledge base|course outline|deadline)/i.test(text)) {
    return withEscalation(
      normalizedRecord,
      "knowledge-base-update",
      "The FYEC100 knowledge base may need review or a content update."
    );
  }

  if (/(integrity|plagiarism|write my|assignment|submit|grade|marks|rubric)/i.test(text)) {
    return withEscalation(
      normalizedRecord,
      "academic-integrity",
      "The feedback may involve academic integrity, assignment-writing boundaries, or official grading guidance."
    );
  }

  if (/(error|api|provider|openai|ollama|timeout|slow|not respond|server)/i.test(text)) {
    return withEscalation(
      normalizedRecord,
      "technical-provider-issue",
      "The feedback may point to a technical or AI provider reliability issue."
    );
  }

  if (normalizedRecord.rating === "not-helpful") {
    return withEscalation(
      normalizedRecord,
      "knowledge-base-update",
      "A not-helpful response should be checked for missing content or unclear assistant behavior."
    );
  }

  return {
    ...normalizedRecord,
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
    "academic-integrity": "Lecturer / Project Sponsor",
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
    "academic-integrity": 0,
    "lecturer-follow-up": 0,
    "lms-administrator": 0,
    "knowledge-base-update": 0,
    "technical-provider-issue": 0,
    none: 0
  };
}

function getEmptyFeedbackCounts(): Record<FeedbackRating, number> {
  return {
    "academic-integrity-concern": 0,
    helpful: 0,
    "lecturer-follow-up": 0,
    "lms-navigation-issue": 0,
    "missing-course-information": 0,
    "not-helpful": 0,
    "technical-issue": 0
  };
}

function normalizeFeedbackCategory(value: string): FeedbackCategory {
  return feedbackCategories.includes(value as FeedbackCategory)
    ? (value as FeedbackCategory)
    : "not-helpful";
}

function normalizeRecord(record: PilotFeedbackRecord): PilotFeedbackRecord {
  const feedbackCategory = normalizeFeedbackCategory(
    record.feedbackCategory ?? record.rating
  );

  return {
    ...record,
    feedbackCategory,
    rating: feedbackCategory
  };
}
