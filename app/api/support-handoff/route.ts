import { NextResponse } from "next/server";
import { createSupportCase, type SupportCaseCategory } from "@/lib/serviceDeskCases";
import { isConsentAcknowledged } from "@/lib/studentConsent";
import { checkRateLimit, getRateLimitConfig, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, getRateLimitConfig().feedback);
  if (rateLimit.limited) return rateLimitResponse(rateLimit);

  const body = (await request.json().catch(() => ({}))) as {
    category?: SupportCaseCategory;
    consentAcknowledged?: boolean;
    courseCode?: string;
    safeSummary?: string;
  };

  if (!isConsentAcknowledged(body.consentAcknowledged)) {
    return NextResponse.json(
      { error: "Please acknowledge the pilot privacy notice before requesting human support." },
      { status: 400 }
    );
  }

  if (!body.safeSummary?.trim()) {
    return NextResponse.json(
      { error: "Support handoff requires a short safe summary." },
      { status: 400 }
    );
  }

  if (body.safeSummary.length > 2000 || (body.courseCode?.length ?? 0) > 24) {
    return NextResponse.json(
      { error: "The support handoff exceeds the allowed size." },
      { status: 400 }
    );
  }

  const supportCase = await createSupportCase({
    category: body.category || "lecturer-help",
    courseCode: body.courseCode,
    safeSummary: body.safeSummary,
    source: "chat-escalation"
  });

  return NextResponse.json({ case: supportCase });
}
