import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { readPilotSessionSummary } from "@/lib/pilotSessions";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  const summary = await readPilotSessionSummary();

  return NextResponse.json(summary);
}
