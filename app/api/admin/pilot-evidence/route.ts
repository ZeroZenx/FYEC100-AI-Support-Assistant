import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { buildPilotEvidenceDashboard } from "@/lib/pilotEvidence";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  const dashboard = await buildPilotEvidenceDashboard();

  return NextResponse.json(dashboard);
}
