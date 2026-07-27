import { NextResponse } from "next/server";
import { getHealthStatus } from "@/lib/health";

export async function GET() {
  const health = await getHealthStatus();
  const showDetails =
    process.env.NODE_ENV !== "production" || process.env.HEALTH_DETAILS_PUBLIC === "true";

  return NextResponse.json(showDetails ? health : {
    ok: health.ok,
    timestamp: health.timestamp
  }, {
    headers: { "Cache-Control": "no-store" },
    status: health.ok ? 200 : 503
  });
}
