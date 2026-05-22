import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import {
  isProductionWorkflowId,
  readProductionWorkflow,
  updateProductionWorkflowItem
} from "@/lib/productionWorkflow";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workflow: string }> }
) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  const { workflow } = await params;
  if (!isProductionWorkflowId(workflow)) {
    return NextResponse.json({ error: "Unknown production workflow." }, { status: 404 });
  }
  return NextResponse.json(await readProductionWorkflow(workflow));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ workflow: string }> }
) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  const { workflow } = await params;
  if (!isProductionWorkflowId(workflow)) {
    return NextResponse.json({ error: "Unknown production workflow." }, { status: 404 });
  }
  return NextResponse.json(await updateProductionWorkflowItem(workflow, await request.json()));
}
