import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { buildPhase2CompletionGate } from "@/lib/phase2Completion";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;

  return NextResponse.json(await buildPhase2CompletionGate());
}
