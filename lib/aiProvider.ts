import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

type ClientMessage = {
  role: "student" | "assistant";
  content: string;
};

type GenerateAnswerInput = {
  fallbackAnswer: string;
  knowledgeBase: string;
  messages: ClientMessage[];
  systemPrompt: string;
};

type OllamaChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

function toModelRole(role: ClientMessage["role"]): "user" | "assistant" {
  return role === "student" ? "user" : "assistant";
}

function getProvider() {
  return (process.env.AI_PROVIDER ?? "openai").toLowerCase();
}

export function getMissingProviderConfigMessage() {
  const provider = getProvider();

  if (provider === "ollama") {
    return "The chat interface is running, but Ollama is not reachable or not configured. Start Ollama locally, set OLLAMA_BASE_URL and OLLAMA_MODEL in .env.local, then restart npm run dev.";
  }

  return "The chat interface is running, but OPENAI_API_KEY is not configured. Add your key to .env.local, restart npm run dev, and try again. For now, use the About and Roadmap pages to review the prototype.";
}

export async function generateAssistantAnswer({
  fallbackAnswer,
  knowledgeBase,
  messages,
  systemPrompt
}: GenerateAnswerInput) {
  const provider = getProvider();

  if (provider === "ollama") {
    return generateWithOllama({
      fallbackAnswer,
      knowledgeBase,
      messages,
      systemPrompt
    });
  }

  return generateWithOpenAI({
    fallbackAnswer,
    knowledgeBase,
    messages,
    systemPrompt
  });
}

async function generateWithOpenAI({
  fallbackAnswer,
  knowledgeBase,
  messages,
  systemPrompt
}: GenerateAnswerInput) {
  if (!process.env.OPENAI_API_KEY) {
    return getMissingProviderConfigMessage();
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const conversationMessages: ChatCompletionMessageParam[] = messages
    .slice(-8)
    .map((message) => ({
      role: toModelRole(message.role),
      content: message.content
    }));

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "system",
        content: `FYEC100 knowledge base:\n\n${knowledgeBase}\n\nIf the student's answer cannot be supported by this knowledge base, use this fallback: ${fallbackAnswer}`
      },
      ...conversationMessages
    ]
  });

  return completion.choices[0]?.message.content?.trim() || fallbackAnswer;
}

async function generateWithOllama({
  fallbackAnswer,
  knowledgeBase,
  messages,
  systemPrompt
}: GenerateAnswerInput) {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL ?? "llama3.1";

  const ollamaMessages: OllamaChatMessage[] = [
    { role: "system", content: systemPrompt },
    {
      role: "system",
      content: `FYEC100 knowledge base:\n\n${knowledgeBase}\n\nIf the student's answer cannot be supported by this knowledge base, use this fallback: ${fallbackAnswer}`
    },
    ...messages.slice(-8).map((message) => ({
      role: toModelRole(message.role),
      content: message.content
    }))
  ];

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: ollamaMessages,
      stream: false,
      options: {
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    return getMissingProviderConfigMessage();
  }

  const data = (await response.json()) as {
    message?: { content?: string };
  };

  return data.message?.content?.trim() || fallbackAnswer;
}
