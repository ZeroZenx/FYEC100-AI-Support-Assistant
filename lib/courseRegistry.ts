import { readFile, writeFile } from "fs/promises";
import path from "path";

const COURSE_REGISTRY_PATH = path.join(process.cwd(), "data", "course-registry.json");

export type CourseConfig = {
  allowedTopics: string[];
  approvalStatus: "approved" | "draft" | "needs-review";
  courseCode: string;
  guardrailNotes: string;
  knowledgeBasePath: string;
  lecturer: string;
  moodleCourseId: string;
  supportOwners: string[];
  title: string;
};

export async function readCourseRegistry() {
  try {
    const content = await readFile(COURSE_REGISTRY_PATH, "utf8");
    const parsed = JSON.parse(content) as { courses?: CourseConfig[] };
    return { courses: Array.isArray(parsed.courses) ? parsed.courses.map(normalizeCourse) : [defaultCourse()] };
  } catch {
    return { courses: [defaultCourse()] };
  }
}

export async function saveCourseRegistry(courses: CourseConfig[]) {
  const record = { courses: courses.map(normalizeCourse), updatedAt: new Date().toISOString() };
  await writeFile(COURSE_REGISTRY_PATH, `${JSON.stringify(record, null, 2)}\n`, "utf8");
  return record;
}

export async function upsertCourseConfig(input: Partial<CourseConfig>) {
  const registry = await readCourseRegistry();
  const next = normalizeCourse(input);
  const courses = registry.courses.filter((course) => course.courseCode !== next.courseCode);
  courses.push(next);
  return saveCourseRegistry(courses.sort((a, b) => a.courseCode.localeCompare(b.courseCode)));
}

export function getCourseReadiness(course: CourseConfig) {
  const checks = [
    ["Knowledge base path", Boolean(course.knowledgeBasePath)],
    ["Lecturer/content owner", Boolean(course.lecturer)],
    ["Moodle course ID", Boolean(course.moodleCourseId)],
    ["Support owners", course.supportOwners.length > 0],
    ["Allowed topics", course.allowedTopics.length > 0],
    ["Approval status", course.approvalStatus === "approved"]
  ] as const;

  return {
    checks: checks.map(([label, pass]) => ({ label, pass })),
    ready: checks.every(([, pass]) => pass)
  };
}

function normalizeCourse(input: Partial<CourseConfig>): CourseConfig {
  return {
    allowedTopics: toList(input.allowedTopics, ["FYEC100 expectations", "study planning", "Moodle navigation", "academic integrity"]),
    approvalStatus: input.approvalStatus === "approved" || input.approvalStatus === "needs-review" ? input.approvalStatus : "draft",
    courseCode: input.courseCode?.trim().toUpperCase() || "FYEC100",
    guardrailNotes: input.guardrailNotes?.trim() || "Do not write full assignments, grade work, or replace lecturer guidance.",
    knowledgeBasePath: input.knowledgeBasePath?.trim() || "data/fyec100-knowledge-base.md",
    lecturer: input.lecturer?.trim() || "FYEC100 Lecturer / Content Owner",
    moodleCourseId: input.moodleCourseId?.trim() || "FYEC100",
    supportOwners: toList(input.supportOwners, ["Lecturer", "LMS Administrator", "System Administrator"]),
    title: input.title?.trim() || "First Year Experience"
  };
}

function toList(value: string[] | undefined, fallback: string[]) {
  return Array.isArray(value)
    ? value.map((item) => item.trim()).filter(Boolean)
    : fallback;
}

function defaultCourse(): CourseConfig {
  return normalizeCourse({ approvalStatus: "approved" });
}
