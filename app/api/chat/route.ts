import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { getLocalGuardrailResponse, assistantSystemPrompt } from "@/lib/guardrails";
import { readKnowledgeBase } from "@/lib/knowledgeBase";

type ClientMessage = {
  role: "student" | "assistant";
  content: string;
};

const fallbackAnswer =
  "I could not find that information in the Phase 1 FYEC100 knowledge base. Please check the LMS course shell, the course outline, or contact your lecturer. For LMS access or navigation issues, contact the LMS administrator.";

function toOpenAIRole(role: ClientMessage["role"]): "user" | "assistant" {
  return role === "student" ? "user" : "assistant";
}

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

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          answer:
            "The chat interface is running, but OPENAI_API_KEY is not configured. Add your key to .env.local, restart npm run dev, and try again. For now, use the About and Roadmap pages to review the prototype."
        },
        { status: 200 }
      );
    }

    const knowledgeBase = await readKnowledgeBase();
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const conversationMessages: ChatCompletionMessageParam[] = messages
      .slice(-8)
      .map((message) => ({
        role: toOpenAIRole(message.role),
        content: message.content
      }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: assistantSystemPrompt },
        {
          role: "system",
          content: `FYEC100 knowledge base:\n\n${knowledgeBase}\n\nIf the student's answer cannot be supported by this knowledge base, use this fallback: ${fallbackAnswer}`
        },
        ...conversationMessages
      ]
    });

    const answer = completion.choices[0]?.message.content?.trim();

    return NextResponse.json({ answer: answer || fallbackAnswer });
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
