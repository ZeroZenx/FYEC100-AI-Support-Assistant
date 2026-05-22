import { readFile, writeFile } from "fs/promises";
import path from "path";

const COURSE_REGISTRY_PATH = path.join(process.cwd(), "data", "course-registry.json");

export type CourseConfig = {
  allowedTopics: string[];
  approvalStatus: "approved" | "draft" | "needs-review";
  courseCode: string;
  guardrailNotes: string;
  knowledgeBasePath: string;
  lifecycleStatus: "active" | "approved-for-pilot" | "draft" | "in-review" | "paused" | "retired";
  lecturer: string;
  moodleCourseId: string;
  pilotEnabled: boolean;
  signoffs: {
    lecturer: boolean;
    lmsAdmin: boolean;
    projectLead: boolean;
  };
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

export async function updateCourseLifecycle(input: {
  courseCode: string;
  lifecycleStatus?: CourseConfig["lifecycleStatus"];
  pilotEnabled?: boolean;
  signoffs?: Partial<CourseConfig["signoffs"]>;
}) {
  const registry = await readCourseRegistry();
  const courses = registry.courses.map((course) =>
    course.courseCode === input.courseCode.toUpperCase()
      ? normalizeCourse({
          ...course,
          lifecycleStatus: input.lifecycleStatus ?? course.lifecycleStatus,
          pilotEnabled: input.pilotEnabled ?? course.pilotEnabled,
          signoffs: { ...course.signoffs, ...input.signoffs }
        })
      : course
  );

  return saveCourseRegistry(courses);
}

export function getCourseReadiness(course: CourseConfig) {
  const checks = [
    ["Knowledge base path", Boolean(course.knowledgeBasePath)],
    ["Lecturer/content owner", Boolean(course.lecturer)],
    ["Moodle course ID", Boolean(course.moodleCourseId)],
    ["Support owners", course.supportOwners.length > 0],
    ["Allowed topics", course.allowedTopics.length > 0],
    ["Approval status", course.approvalStatus === "approved"],
    ["Course lifecycle active or pilot-approved", course.lifecycleStatus === "active" || course.lifecycleStatus === "approved-for-pilot"],
    ["Pilot enabled", course.pilotEnabled],
    ["Owner sign-off", course.signoffs.lecturer && course.signoffs.lmsAdmin && course.signoffs.projectLead]
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
    lifecycleStatus: normalizeLifecycleStatus(input.lifecycleStatus),
    lecturer: input.lecturer?.trim() || "FYEC100 Lecturer / Content Owner",
    moodleCourseId: input.moodleCourseId?.trim() || "FYEC100",
    pilotEnabled: input.pilotEnabled ?? true,
    signoffs: {
      lecturer: Boolean(input.signoffs?.lecturer ?? true),
      lmsAdmin: Boolean(input.signoffs?.lmsAdmin ?? true),
      projectLead: Boolean(input.signoffs?.projectLead ?? true)
    },
    supportOwners: toList(input.supportOwners, ["Lecturer", "LMS Administrator", "System Administrator"]),
    title: input.title?.trim() || "First Year Experience"
  };
}

function normalizeLifecycleStatus(value?: string): CourseConfig["lifecycleStatus"] {
  const statuses: CourseConfig["lifecycleStatus"][] = [
    "active",
    "approved-for-pilot",
    "draft",
    "in-review",
    "paused",
    "retired"
  ];

  return statuses.includes(value as CourseConfig["lifecycleStatus"])
    ? (value as CourseConfig["lifecycleStatus"])
    : "active";
}

function toList(value: string[] | undefined, fallback: string[]) {
  return Array.isArray(value)
    ? value.map((item) => item.trim()).filter(Boolean)
    : fallback;
}

function defaultCourse(): CourseConfig {
  return normalizeCourse({ approvalStatus: "approved" });
}
