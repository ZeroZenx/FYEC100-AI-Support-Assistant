import { NextResponse } from "next/server";
import { getProductionReadiness } from "@/lib/productionConfig";

export async function GET() {
  const readiness = getProductionReadiness();

  return NextResponse.json(readiness, {
    headers: { "Cache-Control": "no-store" },
    status: readiness.ok ? 200 : 503
  });
}
