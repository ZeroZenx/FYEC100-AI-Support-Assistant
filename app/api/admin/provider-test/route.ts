import { NextResponse } from "next/server";
import { testSelectedProvider } from "@/lib/aiProvider";
import {
  checkRateLimit,
  getRateLimitConfig,
  rateLimitResponse
} from "@/lib/rateLimit";

export async function POST(request: Request) {
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
