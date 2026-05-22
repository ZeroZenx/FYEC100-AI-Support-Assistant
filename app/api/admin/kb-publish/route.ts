import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { publishApprovedKnowledgeBaseChanges } from "@/lib/kbReleasePipeline";

export async function POST(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return NextResponse.json(await publishApprovedKnowledgeBaseChanges(await request.json()));
}
