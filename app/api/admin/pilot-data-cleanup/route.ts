import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import {
  buildPilotDataCleanupPreview,
  resetPilotData
} from "@/lib/pilotDataCleanup";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return NextResponse.json(await buildPilotDataCleanupPreview());
}

export async function POST(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  const body = (await request.json().catch(() => ({}))) as {
    confirmation?: string;
    target?: "feedback" | "launch-audit" | "all";
  };
  const result = await resetPilotData({
    confirmation: body.confirmation,
    target: body.target
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
