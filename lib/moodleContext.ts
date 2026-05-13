export type MoodleLaunchSource = "iframe" | "moodle-block" | "lti" | "direct";

export type MoodleRole = "student" | "lecturer" | "lms-admin" | "unknown";

export type MoodleLaunchContext = {
  courseId: string;
  courseShortName: string;
  launchSource: MoodleLaunchSource;
  role: MoodleRole;
};

type RawMoodleLaunchContext = {
  courseId?: string;
  courseShortName?: string;
  launchSource?: string;
  role?: string;
};

const defaultContext: MoodleLaunchContext = {
  courseId: "FYEC100",
  courseShortName: "FYEC100",
  launchSource: "direct",
  role: "student"
};

const validRoles: MoodleRole[] = ["student", "lecturer", "lms-admin", "unknown"];
const validSources: MoodleLaunchSource[] = [
  "iframe",
  "moodle-block",
  "lti",
  "direct"
];

export function getDefaultMoodleContext(): MoodleLaunchContext {
  return defaultContext;
}

export function parseMoodleLaunchContext(
  searchParams: Record<string, string | string[] | undefined>
): MoodleLaunchContext {
  return normalizeMoodleLaunchContext({
    courseId: readParam(searchParams.courseId) || readParam(searchParams.course_id),
    courseShortName:
      readParam(searchParams.courseShortName) ||
      readParam(searchParams.course_short_name),
    launchSource:
      readParam(searchParams.launchSource) || readParam(searchParams.launch_source),
    role: readParam(searchParams.role)
  });
}

export function normalizeMoodleLaunchContext(
  input?: RawMoodleLaunchContext
): MoodleLaunchContext {
  return {
    courseId: cleanValue(input?.courseId, defaultContext.courseId),
    courseShortName: cleanValue(
      input?.courseShortName,
      defaultContext.courseShortName
    ),
    launchSource: validSources.includes(input?.launchSource as MoodleLaunchSource)
      ? (input?.launchSource as MoodleLaunchSource)
      : defaultContext.launchSource,
    role: validRoles.includes(input?.role as MoodleRole)
      ? (input?.role as MoodleRole)
      : defaultContext.role
  };
}

export function getMoodleContextSystemPrompt(context: MoodleLaunchContext) {
  return `Moodle launch context:
- Course ID: ${context.courseId}
- Course short name: ${context.courseShortName}
- User role: ${context.role}
- Launch source: ${context.launchSource}

Use this context only to tailor support tone and escalation guidance. Do not treat it as authenticated identity or official student-record access. If the role is student, focus on learning support. If the role is lecturer or LMS administrator, support pilot testing, content review, and escalation planning without exposing private student information.`;
}

export function getMoodleContextQueryString(context: MoodleLaunchContext) {
  const params = new URLSearchParams({
    courseId: context.courseId,
    courseShortName: context.courseShortName,
    launchSource: context.launchSource,
    role: context.role
  });

  return params.toString();
}

function cleanValue(value: string | undefined, fallback: string) {
  const trimmed = value?.trim().slice(0, 80);

  return trimmed || fallback;
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
