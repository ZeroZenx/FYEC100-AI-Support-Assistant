import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { getSupportConnectorStatus, testSupportConnector } from "@/lib/supportConnector";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return NextResponse.json(getSupportConnectorStatus());
}

export async function POST(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return NextResponse.json(await testSupportConnector());
}
