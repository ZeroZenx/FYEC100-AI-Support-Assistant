import { appendFile, readFile } from "fs/promises";
import path from "path";
import { readPilotFeedbackRecords } from "@/lib/pilotFeedback";

const SUGGESTIONS_PATH = path.join(process.cwd(), "data", "kb-feedback-suggestions.jsonl");

export type KnowledgeFeedbackSuggestion = {
  affectedArea: "academic-integrity" | "assignment-guidance" | "course-expectations" | "lms-guidance";
  courseCode: string;
  createdAt: string;
  draftWording: string;
  feedbackCount: number;
  id: string;
  reviewerNote?: string;
  sourceQuestions: string[];
  status: "approved" | "draft" | "rejected";
  topic: string;
};

export async function buildKnowledgeFeedbackSuggestions() {
  const [stored, feedback] = await Promise.all([
    readStoredSuggestions(),
    readPilotFeedbackRecords()
  ]);
  const missing = feedback.filter(
    (record) =>
      record.feedbackCategory === "missing-course-information" ||
      record.escalationCategory === "knowledge-base-update"
  );
  const grouped = new Map<string, string[]>();

  for (const record of missing) {
    const topic = inferTopic(record.studentQuestionExcerpt);
    grouped.set(topic, [...(grouped.get(topic) ?? []), record.studentQuestionExcerpt]);
  }

  const generated = Array.from(grouped.entries()).map(([topic, questions]) =>
    normalizeSuggestion({
      affectedArea: inferAffectedArea(topic),
      courseCode: "FYEC100",
      createdAt: new Date().toISOString(),
      draftWording: `Add lecturer-approved FYEC100 guidance for ${topic.toLowerCase()}, including where students should confirm official instructions in Moodle or with the lecturer.`,
      feedbackCount: questions.length,
      id: `KBF-${slug(topic)}`,
      sourceQuestions: questions.slice(0, 5),
      status: "draft",
      topic
    })
  );
  const merged = mergeSuggestions(stored, generated);

  return {
    generatedAt: new Date().toISOString(),
    suggestions: merged.sort((a, b) => b.feedbackCount - a.feedbackCount),
    summary: {
      approved: merged.filter((item) => item.status === "approved").length,
      draft: merged.filter((item) => item.status === "draft").length,
      feedbackRecords: missing.length,
      rejected: merged.filter((item) => item.status === "rejected").length,
      topics: merged.length
    }
  };
}

export async function updateKnowledgeFeedbackSuggestion(input: {
  id: string;
  reviewerNote?: string;
  status: KnowledgeFeedbackSuggestion["status"];
}) {
  const current = await buildKnowledgeFeedbackSuggestions();
  const suggestions = current.suggestions.map((item) =>
    item.id === input.id
      ? normalizeSuggestion({
          ...item,
          reviewerNote: input.reviewerNote ?? item.reviewerNote,
          status: input.status
        })
      : item
  );

  await appendFile(SUGGESTIONS_PATH, `${JSON.stringify({
    id: input.id,
    reviewerNote: input.reviewerNote || "",
    status: input.status,
    timestamp: new Date().toISOString()
  })}\n`, "utf8");

  return {
    generatedAt: new Date().toISOString(),
    suggestions,
    summary: {
      approved: suggestions.filter((item) => item.status === "approved").length,
      draft: suggestions.filter((item) => item.status === "draft").length,
      feedbackRecords: suggestions.reduce((sum, item) => sum + item.feedbackCount, 0),
      rejected: suggestions.filter((item) => item.status === "rejected").length,
      topics: suggestions.length
    }
  };
}

async function readStoredSuggestions() {
  try {
    const content = await readFile(SUGGESTIONS_PATH, "utf8");
    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Partial<KnowledgeFeedbackSuggestion>);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }

    return [];
  }
}

function mergeSuggestions(
  stored: Partial<KnowledgeFeedbackSuggestion>[],
  generated: KnowledgeFeedbackSuggestion[]
) {
  return generated.map((item) => {
    const latest = [...stored].reverse().find((storedItem) => storedItem.id === item.id);
    return normalizeSuggestion({ ...item, ...latest });
  });
}

function normalizeSuggestion(input: Partial<KnowledgeFeedbackSuggestion>): KnowledgeFeedbackSuggestion {
  return {
    affectedArea: input.affectedArea || "course-expectations",
    courseCode: input.courseCode || "FYEC100",
    createdAt: input.createdAt || new Date().toISOString(),
    draftWording: input.draftWording || "",
    feedbackCount: input.feedbackCount || 0,
    id: input.id || `KBF-${crypto.randomUUID().slice(0, 8)}`,
    reviewerNote: input.reviewerNote || "",
    sourceQuestions: Array.isArray(input.sourceQuestions) ? input.sourceQuestions : [],
    status: input.status === "approved" || input.status === "rejected" ? input.status : "draft",
    topic: input.topic || "General FYEC100 clarification"
  };
}

function inferTopic(text: string) {
  if (/moodle|lms|course shell|resource|upload|file/i.test(text)) return "Moodle navigation";
  if (/assignment|rubric|submit|deadline|instructions/i.test(text)) return "Assignment guidance";
  if (/integrity|plagiarism|ai|responsible/i.test(text)) return "Academic integrity";
  return "Course expectations";
}

function inferAffectedArea(topic: string): KnowledgeFeedbackSuggestion["affectedArea"] {
  if (topic === "Moodle navigation") return "lms-guidance";
  if (topic === "Assignment guidance") return "assignment-guidance";
  if (topic === "Academic integrity") return "academic-integrity";
  return "course-expectations";
}

function slug(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
