import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import {
  buildKnowledgeBasePublishStatus,
  readKnowledgeBaseRegressionRuns,
  runKnowledgeBaseRegression
} from "@/lib/kbReleasePipeline";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  const [runs, publishStatus] = await Promise.all([
    readKnowledgeBaseRegressionRuns(),
    buildKnowledgeBasePublishStatus()
  ]);
  return NextResponse.json({ publishStatus, runs });
}

export async function POST(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return NextResponse.json(await runKnowledgeBaseRegression());
}
