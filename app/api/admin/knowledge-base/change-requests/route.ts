import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { getKnowledgeBaseChangeRequests } from "@/lib/knowledgeBaseChangeRequests";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  return NextResponse.json(await getKnowledgeBaseChangeRequests());
}
