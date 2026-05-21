import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { verifyWindowsScripts } from "@/lib/finalPhaseLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return NextResponse.json({ generatedAt: new Date().toISOString(), scripts: await verifyWindowsScripts() });
}
