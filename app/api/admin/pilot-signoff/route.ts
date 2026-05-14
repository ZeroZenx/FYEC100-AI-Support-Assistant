import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { getPilotSignoffStatus } from "@/lib/pilotSignoff";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  return NextResponse.json(await getPilotSignoffStatus());
}
