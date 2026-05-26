import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { resolveCourseForChat } from "@/lib/courseResolver";
import { readCourseRegistry } from "@/lib/courseRegistry";
import type { MoodleLaunchContext } from "@/lib/moodleContext";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;

  const registry = await readCourseRegistry();
  const defaultResolution = await resolveCourseForChat();

  return NextResponse.json({
    courses: registry.courses,
    defaultResolution: defaultResolution.uiContext
  });
}

export async function POST(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;

  const body = (await request.json().catch(() => ({}))) as {
    courseCode?: string;
    courseId?: string;
    courseShortName?: string;
    launchSource?: string;
    role?: string;
  };

  const resolution = await resolveCourseForChat({
    courseCode: body.courseCode,
    launchContext: {
      courseId: body.courseId,
      courseShortName: body.courseShortName,
      launchSource: body.launchSource,
      role: body.role
    } as Partial<MoodleLaunchContext>
  });

  return NextResponse.json({
    launchContext: resolution.launchContext,
    requestedCourse: resolution.requestedCourse,
    result: resolution.uiContext
  });
}
