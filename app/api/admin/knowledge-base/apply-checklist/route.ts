import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { getKnowledgeBaseApplyChecklist } from "@/lib/knowledgeBaseApplyChecklist";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  return NextResponse.json(await getKnowledgeBaseApplyChecklist());
}
