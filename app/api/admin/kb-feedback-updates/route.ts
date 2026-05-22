import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import {
  buildKnowledgeFeedbackSuggestions,
  updateKnowledgeFeedbackSuggestion
} from "@/lib/kbFeedbackLoop";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return NextResponse.json(await buildKnowledgeFeedbackSuggestions());
}

export async function PATCH(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return NextResponse.json(await updateKnowledgeFeedbackSuggestion(await request.json()));
}
