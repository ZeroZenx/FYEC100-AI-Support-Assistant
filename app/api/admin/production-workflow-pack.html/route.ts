import { NextResponse } from "next/server";
import {
  isProductionWorkflowId,
  renderProductionWorkflowHtml
} from "@/lib/productionWorkflow";
import { requireAdminAccess } from "@/lib/adminAuth";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  const workflow = new URL(request.url).searchParams.get("workflow") || "";
  if (!isProductionWorkflowId(workflow)) {
    return new NextResponse("Unknown production workflow.", { status: 404 });
  }

  return new NextResponse(await renderProductionWorkflowHtml(workflow), {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
