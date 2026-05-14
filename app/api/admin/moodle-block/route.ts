import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { getMoodleBlockPluginStatus } from "@/lib/moodleBlockPlugin";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  const status = await getMoodleBlockPluginStatus();

  return NextResponse.json(status);
}
