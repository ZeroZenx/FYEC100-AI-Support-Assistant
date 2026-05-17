import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { buildSupportTriage } from "@/lib/supportTriage";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return NextResponse.json(await buildSupportTriage());
}
