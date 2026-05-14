import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { getKnowledgeBaseReleases } from "@/lib/knowledgeBaseReleases";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  return NextResponse.json(await getKnowledgeBaseReleases());
}
