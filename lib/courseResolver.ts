import { stat } from "fs/promises";
import { getCourseReadiness, readCourseRegistry, type CourseConfig } from "@/lib/courseRegistry";
import { readKnowledgeBaseByPath, resolveKnowledgeBasePath } from "@/lib/knowledgeBase";
import {
  normalizeMoodleLaunchContext,
  type MoodleLaunchContext
} from "@/lib/moodleContext";

export type CourseResolutionStatus =
  | "active"
  | "fallback"
  | "inactive"
  | "invalid-kb"
  | "missing-kb"
  | "unknown";

export type CourseChatContext = {
  allowedTopics: string[];
  courseCode: string;
  guardrailNotes: string;
  knowledgeBasePath: string;
  lifecycleStatus: CourseConfig["lifecycleStatus"];
  lecturer: string;
  moodleCourseId: string;
  pilotEnabled: boolean;
  readinessReady: boolean;
  resolutionMessage: string;
  status: CourseResolutionStatus;
  supportOwners: string[];
  title: string;
};

export type CourseResolverInput = {
  courseCode?: string;
  launchContext?: Partial<MoodleLaunchContext>;
};

const inactiveStatuses: CourseConfig["lifecycleStatus"][] = [
  "draft",
  "in-review",
  "paused",
  "retired"
];

export async function resolveCourseForChat(input: CourseResolverInput = {}) {
  const registry = await readCourseRegistry();
  const launchContext = input.launchContext
    ? normalizeMoodleLaunchContext(input.launchContext)
    : undefined;
  const requestedCourse = getRequestedCourseValue(input.courseCode, launchContext);
  const isExplicitRequest = Boolean(requestedCourse);
  const defaultCourse =
    registry.courses.find((course) => course.courseCode === "FYEC100") ??
    registry.courses[0];
  const matchedCourse =
    findCourse(registry.courses, requestedCourse) ??
    (!isExplicitRequest ? defaultCourse : undefined);

  if (!matchedCourse) {
    return {
      course: null,
      launchContext,
      requestedCourse,
      status: "unknown" as const,
      uiContext: buildUnknownCourseContext(requestedCourse)
    };
  }

  const readiness = getCourseReadiness(matchedCourse);
  const kbStatus = await checkKnowledgeBase(matchedCourse.knowledgeBasePath);
  const lifecycleBlocked = inactiveStatuses.includes(matchedCourse.lifecycleStatus);
  const pilotBlocked = !matchedCourse.pilotEnabled;
  const status: CourseResolutionStatus = lifecycleBlocked || pilotBlocked
    ? "inactive"
    : kbStatus === "missing-kb" || kbStatus === "invalid-kb"
      ? kbStatus
      : isExplicitRequest
        ? "active"
        : "fallback";

  return {
    course: matchedCourse,
    launchContext,
    requestedCourse,
    status,
    uiContext: buildCourseChatContext(matchedCourse, readiness.ready, status)
  };
}

export async function readResolvedCourseKnowledgeBase(course: CourseConfig) {
  return readKnowledgeBaseByPath(course.knowledgeBasePath);
}

export function getCourseChatBlockMessage(context: CourseChatContext) {
  if (context.status === "unknown") {
    return `I could not match that Moodle/course context to an approved course assistant. Please check the course code in Moodle or ask the LMS administrator to confirm the course configuration.`;
  }

  if (context.status === "inactive") {
    return `${context.courseCode} is configured, but it is not currently active for student chat. Current status: ${context.lifecycleStatus}; pilot enabled: ${context.pilotEnabled ? "yes" : "no"}. Please contact the lecturer, project lead, or LMS administrator.`;
  }

  if (context.status === "missing-kb") {
    return `${context.courseCode} is configured, but its knowledge base file could not be found. Please ask the project team to review ${context.knowledgeBasePath}.`;
  }

  if (context.status === "invalid-kb") {
    return `${context.courseCode} is configured, but its knowledge base path is not valid for this local pilot. Knowledge bases must be Markdown files inside the data folder.`;
  }

  return "";
}

export function buildCourseSystemPrompt(course: CourseChatContext) {
  return `Course routing context:
- Course code: ${course.courseCode}
- Course title: ${course.title}
- Moodle course ID: ${course.moodleCourseId}
- Lecturer/content owner: ${course.lecturer}
- Allowed support topics: ${course.allowedTopics.join(", ")}
- Support owners: ${course.supportOwners.join(", ")}
- Course guardrail notes: ${course.guardrailNotes}

Use this course context to keep answers grounded in the selected course. If a question is outside these allowed topics or unsupported by the selected knowledge base, say so and refer the student to the appropriate human support owner.`;
}

function getRequestedCourseValue(
  courseCode?: string,
  launchContext?: MoodleLaunchContext
) {
  return (
    courseCode?.trim() ||
    launchContext?.courseShortName?.trim() ||
    launchContext?.courseId?.trim() ||
    ""
  );
}

function findCourse(courses: CourseConfig[], requestedCourse: string) {
  const normalized = normalizeLookupValue(requestedCourse);

  if (!normalized) return undefined;

  return courses.find((course) => {
    const candidates = [
      course.courseCode,
      course.moodleCourseId,
      course.title
    ].map(normalizeLookupValue);

    return candidates.includes(normalized);
  });
}

async function checkKnowledgeBase(knowledgeBasePath: string) {
  try {
    await stat(resolveKnowledgeBasePath(knowledgeBasePath));
    return "active" as const;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    return message.includes("must")
      ? ("invalid-kb" as const)
      : ("missing-kb" as const);
  }
}

function buildCourseChatContext(
  course: CourseConfig,
  readinessReady: boolean,
  status: CourseResolutionStatus
): CourseChatContext {
  return {
    allowedTopics: course.allowedTopics,
    courseCode: course.courseCode,
    guardrailNotes: course.guardrailNotes,
    knowledgeBasePath: course.knowledgeBasePath,
    lifecycleStatus: course.lifecycleStatus,
    lecturer: course.lecturer,
    moodleCourseId: course.moodleCourseId,
    pilotEnabled: course.pilotEnabled,
    readinessReady,
    resolutionMessage:
      status === "fallback"
        ? "No course context was supplied, so the local FYEC100 default is active."
        : "Course context resolved from the supplied course or Moodle launch values.",
    status,
    supportOwners: course.supportOwners,
    title: course.title
  };
}

function buildUnknownCourseContext(requestedCourse: string): CourseChatContext {
  return {
    allowedTopics: [],
    courseCode: requestedCourse || "UNKNOWN",
    guardrailNotes: "No configured course guardrails were found for this context.",
    knowledgeBasePath: "",
    lifecycleStatus: "draft",
    lecturer: "Unassigned",
    moodleCourseId: requestedCourse || "UNKNOWN",
    pilotEnabled: false,
    readinessReady: false,
    resolutionMessage: "No matching course record was found in the course registry.",
    status: "unknown",
    supportOwners: ["LMS Administrator", "Project Lead"],
    title: "Unknown Course"
  };
}

function normalizeLookupValue(value: string) {
  return value.trim().toUpperCase();
}
