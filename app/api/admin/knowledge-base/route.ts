import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { getKnowledgeBaseMetadata } from "@/lib/knowledgeBase";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  const metadata = await getKnowledgeBaseMetadata();

  return NextResponse.json(metadata);
}
