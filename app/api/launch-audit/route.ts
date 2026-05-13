import { NextResponse } from "next/server";
import { saveLaunchAudit } from "@/lib/launchAudit";
import {
  checkRateLimit,
  getRateLimitConfig,
  rateLimitResponse
} from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(request, getRateLimitConfig().launchAudit);

    if (rateLimit.limited) {
      return rateLimitResponse(rateLimit);
    }

    const body = (await request.json()) as Parameters<typeof saveLaunchAudit>[0];
    const record = await saveLaunchAudit(body);

    return NextResponse.json({ launchAudit: record });
  } catch (error) {
    console.error("Launch audit route error", error);

    return NextResponse.json(
      { error: "Launch audit could not be saved." },
      { status: 500 }
    );
  }
}
