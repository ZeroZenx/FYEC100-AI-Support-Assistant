import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { buildLtiHardeningStatus } from "@/lib/ltiHardening";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return NextResponse.json(await buildLtiHardeningStatus());
}
