import { NextResponse } from "next/server";
import {
  type FeedbackRating,
  readPilotFeedbackSummary,
  savePilotFeedback
} from "@/lib/pilotFeedback";

const ratings: FeedbackRating[] = [
  "helpful",
  "not-helpful",
  "lecturer-follow-up"
];

export async function GET() {
  const summary = await readPilotFeedbackSummary();

  return NextResponse.json(summary);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      assistantResponse?: string;
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

    const record = await savePilotFeedback({
      assistantResponse: body.assistantResponse,
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
