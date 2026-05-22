import { NextResponse } from "next/server";
import {
  type FeedbackCategory,
  type FeedbackRating,
  feedbackCategories,
  readPilotFeedbackSummary,
  savePilotFeedback
} from "@/lib/pilotFeedback";
import {
  checkRateLimit,
  getRateLimitConfig,
  rateLimitResponse
} from "@/lib/rateLimit";
import { isConsentAcknowledged } from "@/lib/studentConsent";

const ratings: FeedbackRating[] = feedbackCategories;

export async function GET() {
  const summary = await readPilotFeedbackSummary();

  return NextResponse.json(summary);
}

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(request, getRateLimitConfig().feedback);

    if (rateLimit.limited) {
      return rateLimitResponse(rateLimit);
    }

    const body = (await request.json()) as {
      assistantResponse?: string;
      consentAcknowledged?: boolean;
      courseCode?: string;
      feedbackCategory?: FeedbackCategory;
      mode?: "standalone" | "embedded";
      note?: string;
      rating?: FeedbackRating;
      studentQuestion?: string;
    };

    if (!body.rating || !ratings.includes(body.rating)) {
      return NextResponse.json(
        { error: "Please choose a valid feedback rating." },
        { status: 400 }
      );
    }

    if (!body.studentQuestion || !body.assistantResponse || !body.mode) {
      return NextResponse.json(
        { error: "Feedback requires a question, response, and mode." },
        { status: 400 }
      );
    }

    if (!isConsentAcknowledged(body.consentAcknowledged)) {
      return NextResponse.json(
        { error: "Please acknowledge the pilot privacy notice before submitting feedback." },
        { status: 400 }
      );
    }

    const record = await savePilotFeedback({
      assistantResponse: body.assistantResponse,
      consentAcknowledged: body.consentAcknowledged,
      courseCode: body.courseCode,
      feedbackCategory: body.feedbackCategory,
      mode: body.mode,
      note: body.note,
      rating: body.rating,
      studentQuestion: body.studentQuestion
    });

    return NextResponse.json({ feedback: record });
  } catch (error) {
    console.error("Feedback route error", error);
    return NextResponse.json(
      { error: "Pilot feedback could not be saved." },
      { status: 500 }
    );
  }
}
