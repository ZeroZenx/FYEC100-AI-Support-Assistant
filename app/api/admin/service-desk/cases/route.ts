import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { buildServiceDeskLayer } from "@/lib/productionLayers";
import { buildSupportCaseSummary } from "@/lib/serviceDeskCases";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;

  const [layer, realCases] = await Promise.all([
    buildServiceDeskLayer(),
    buildSupportCaseSummary()
  ]);

  return NextResponse.json({ ...layer, realCases });
}
