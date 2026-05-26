import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { executePhase2GateAction } from "@/lib/phase2GateExecutor";

export async function POST(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));

  return NextResponse.json(await executePhase2GateAction(body));
}
