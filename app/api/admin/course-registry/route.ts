import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { getCourseReadiness, readCourseRegistry, upsertCourseConfig } from "@/lib/courseRegistry";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  const registry = await readCourseRegistry();
  return NextResponse.json({
    courses: registry.courses.map((course) => ({
      ...course,
      readiness: getCourseReadiness(course)
    }))
  });
}

export async function POST(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  const record = await upsertCourseConfig(await request.json());
  return NextResponse.json(record);
}
