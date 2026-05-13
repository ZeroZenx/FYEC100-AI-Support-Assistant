import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { testSelectedProvider } from "@/lib/aiProvider";
import {
  checkRateLimit,
  getRateLimitConfig,
  rateLimitResponse
} from "@/lib/rateLimit";

export async function POST(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  const rateLimit = checkRateLimit(
    request,
    getRateLimitConfig().providerTest
  );

  if (rateLimit.limited) {
    return rateLimitResponse(rateLimit);
  }

  const result = await testSelectedProvider();

  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
