import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { readLaunchAuditSummary } from "@/lib/launchAudit";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  const summary = await readLaunchAuditSummary();

  return NextResponse.json(summary);
}
