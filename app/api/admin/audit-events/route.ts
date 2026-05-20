import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { buildAuditLayer, readAuditEvents } from "@/lib/auditEvents";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;

  return NextResponse.json({
    events: await readAuditEvents(),
    layer: await buildAuditLayer()
  });
}
