import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { readLaunchChecklist, updateLaunchChecklist } from "@/lib/launchChecklist";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return NextResponse.json(await readLaunchChecklist());
}

export async function PATCH(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return NextResponse.json(await updateLaunchChecklist(await request.json()));
}
