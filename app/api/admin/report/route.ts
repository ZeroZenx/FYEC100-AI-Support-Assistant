import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { buildPilotReport } from "@/lib/pilotReport";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  const report = await buildPilotReport();

  return NextResponse.json(report);
}
