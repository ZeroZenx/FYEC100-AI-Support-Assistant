import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { buildServiceDeskLayer } from "@/lib/productionLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;

  return NextResponse.json(await buildServiceDeskLayer());
}
