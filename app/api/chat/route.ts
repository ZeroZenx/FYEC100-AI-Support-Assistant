import { NextResponse } from "next/server";
import {
  generateAssistantAnswer,
  getMissingProviderConfigMessage
} from "@/lib/aiProvider";
import { buildAssistantSystemPrompt, getLocalGuardrailResponse } from "@/lib/guardrails";
import {
  getCourseChatBlockMessage,
  readResolvedCourseKnowledgeBase,
  resolveCourseForChat
} from "@/lib/courseResolver";
import {
  normalizeMoodleLaunchContext,
  type MoodleLaunchContext
} from "@/lib/moodleContext";
import {
  checkRateLimit,
  getRateLimitConfig,
  rateLimitResponse
} from "@/lib/rateLimit";

type ClientMessage = {
  role: "student" | "assistant";
  content: string;
};

const fallbackAnswer =
  "I could not find that information in the Phase 1 FYEC100 knowledge base. Please check the LMS course shell, the course outline, or contact your lecturer. For LMS access or navigation issues, contact the LMS administrator.";

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(request, getRateLimitConfig().chat);

    if (rateLimit.limited) {
      return rateLimitResponse(rateLimit);
    }

    const body = (await request.json()) as {
      courseCode?: string;
      launchContext?: Partial<MoodleLaunchContext>;
      messages?: ClientMessage[];
    };
    const messages = body.messages ?? [];
    const launchContext = normalizeMoodleLaunchContext(body.launchContext);
    const courseResolution = await resolveCourseForChat({
      courseCode: body.courseCode,
      launchContext: body.launchContext ? launchContext : undefined
    });
    const latestStudentMessage = [...messages]
      .reverse()
      .find((message) => message.role === "student");

    if (!latestStudentMessage?.content?.trim()) {
      return NextResponse.json(
        { error: "Please enter an FYEC100 question." },
        { status: 400 }
      );
    }

    const localGuardrailResponse = getLocalGuardrailResponse(
      latestStudentMessage.content
    );

    if (localGuardrailResponse) {
      return NextResponse.json({
        answer: localGuardrailResponse,
        course: courseResolution.uiContext
      });
    }

    const blockMessage = getCourseChatBlockMessage(courseResolution.uiContext);

    if (blockMessage || !courseResolution.course) {
      return NextResponse.json(
        {
          answer: blockMessage,
          course: courseResolution.uiContext,
          error: blockMessage
        },
        { status: 409 }
      );
    }

    const knowledgeBase = await readResolvedCourseKnowledgeBase(
      courseResolution.course
    );
    const answer = await generateAssistantAnswer({
      fallbackAnswer,
      knowledgeBase,
      messages,
      systemPrompt: buildAssistantSystemPrompt(
        launchContext,
        courseResolution.uiContext
      )
    });

    return NextResponse.json({
      answer: answer || getMissingProviderConfigMessage(),
      course: courseResolution.uiContext
    });
  } catch (error) {
    console.error("Chat route error", error);
    return NextResponse.json(
      {
        error:
          "The assistant could not complete the request. Check the server logs, API key, and local setup."
      },
      { status: 500 }
    );
  }
}
