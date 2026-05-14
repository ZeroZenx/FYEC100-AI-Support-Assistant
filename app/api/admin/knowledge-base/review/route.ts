import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { getKnowledgeBaseReviewStatus } from "@/lib/knowledgeBaseReview";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  const status = await getKnowledgeBaseReviewStatus();

  return NextResponse.json(status);
}
