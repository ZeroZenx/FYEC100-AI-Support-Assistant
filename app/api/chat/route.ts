import { NextResponse } from "next/server";
import {
  generateAssistantAnswer,
  getMissingProviderConfigMessage
} from "@/lib/aiProvider";
import { getLocalGuardrailResponse, assistantSystemPrompt } from "@/lib/guardrails";
import { readKnowledgeBase } from "@/lib/knowledgeBase";

type ClientMessage = {
  role: "student" | "assistant";
  content: string;
};

const fallbackAnswer =
  "I could not find that information in the Phase 1 FYEC100 knowledge base. Please check the LMS course shell, the course outline, or contact your lecturer. For LMS access or navigation issues, contact the LMS administrator.";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { messages?: ClientMessage[] };
    const messages = body.messages ?? [];
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
      return NextResponse.json({ answer: localGuardrailResponse });
    }

    const knowledgeBase = await readKnowledgeBase();
    const answer = await generateAssistantAnswer({
      fallbackAnswer,
      knowledgeBase,
      messages,
      systemPrompt: assistantSystemPrompt
    });

    return NextResponse.json({ answer: answer || getMissingProviderConfigMessage() });
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
