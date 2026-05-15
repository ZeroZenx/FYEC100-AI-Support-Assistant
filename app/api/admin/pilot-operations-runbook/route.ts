import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { getPilotOperationsRunbook } from "@/lib/pilotOperationsRunbook";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  return NextResponse.json(await getPilotOperationsRunbook());
}
