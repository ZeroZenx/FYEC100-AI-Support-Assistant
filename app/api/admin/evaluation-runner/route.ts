import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import {
  buildEvaluationLayer,
  runEvaluationDataset
} from "@/lib/connectionAuthStorageEvaluationLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return NextResponse.json(await buildEvaluationLayer());
}

export async function POST(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return NextResponse.json(await runEvaluationDataset());
}
