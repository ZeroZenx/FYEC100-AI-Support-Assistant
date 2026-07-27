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

type ProviderName = "openai" | "ollama" | "deepseek";

function getProviderTimeoutMs() {
  const configured = Number(process.env.PROVIDER_TIMEOUT_MS ?? 30000);
  return Number.isFinite(configured) && configured >= 1000 ? configured : 30000;
}

function getMaxOutputTokens() {
  const configured = Number(process.env.PROVIDER_MAX_OUTPUT_TOKENS ?? 900);
  return Number.isFinite(configured) && configured >= 200 ? configured : 900;
}

function createOpenAIClient(apiKey: string | undefined, baseURL?: string) {
  return new OpenAI({
    apiKey,
    baseURL,
    maxRetries: 1,
    timeout: getProviderTimeoutMs()
  });
}

function toModelRole(role: ClientMessage["role"]): "user" | "assistant" {
  return role === "student" ? "user" : "assistant";
}

function getProvider(): ProviderName {
  const provider = (process.env.AI_PROVIDER ?? "openai").toLowerCase();

  if (provider === "ollama" || provider === "deepseek") {
    return provider;
  }

  return "openai";
}

export function getProviderStatus() {
  const provider = getProvider();
  const model =
    provider === "ollama"
      ? process.env.OLLAMA_MODEL ?? "llama3.1"
      : provider === "deepseek"
        ? process.env.DEEPSEEK_MODEL ?? "deepseek-chat"
      : process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const configured =
    provider === "ollama"
      ? Boolean(process.env.OLLAMA_BASE_URL || process.env.OLLAMA_MODEL)
      : provider === "deepseek"
        ? Boolean(process.env.DEEPSEEK_API_KEY)
      : Boolean(process.env.OPENAI_API_KEY);

  return {
    configured,
    model,
    provider,
    requiredVariables:
      provider === "ollama"
        ? ["AI_PROVIDER", "OLLAMA_BASE_URL", "OLLAMA_MODEL"]
        : provider === "deepseek"
          ? ["AI_PROVIDER", "DEEPSEEK_API_KEY", "DEEPSEEK_MODEL"]
        : ["AI_PROVIDER", "OPENAI_API_KEY", "OPENAI_MODEL"]
  };
}

export function getMissingProviderConfigMessage() {
  const provider = getProvider();

  if (provider === "ollama") {
    return "The chat interface is running, but Ollama is not reachable or not configured. Start Ollama locally, set OLLAMA_BASE_URL and OLLAMA_MODEL in .env.local, then restart npm run dev.";
  }

  if (provider === "deepseek") {
    return "The chat interface is running, but DEEPSEEK_API_KEY is not configured. Add your key to .env.local, restart npm run dev, and try again.";
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

  if (provider === "deepseek") {
    return generateWithDeepSeek({
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

export async function testSelectedProvider() {
  const status = getProviderStatus();
  const startedAt = Date.now();

  if (!status.configured) {
    return {
      ...status,
      durationMs: 0,
      ok: false,
      responseExcerpt: "",
      error: "Provider environment variables are not configured."
    };
  }

  try {
    const responseExcerpt =
      status.provider === "ollama"
        ? await testOllamaProvider()
        : status.provider === "deepseek"
          ? await testDeepSeekProvider()
        : await testOpenAIProvider();

    return {
      ...status,
      durationMs: Date.now() - startedAt,
      ok: true,
      responseExcerpt,
      error: ""
    };
  } catch (error) {
    return {
      ...status,
      durationMs: Date.now() - startedAt,
      ok: false,
      responseExcerpt: "",
      error:
        error instanceof Error
          ? error.message
          : "Provider test failed for an unknown reason."
    };
  }
}

async function testOpenAIProvider() {
  const openai = createOpenAIClient(process.env.OPENAI_API_KEY);
  const completion = await openai.chat.completions.create({
    max_tokens: 120,
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0,
    messages: [
      {
        role: "user",
        content:
          "Reply with one short sentence confirming the FYEC100 assistant provider test is working."
      }
    ]
  });

  return (
    completion.choices[0]?.message.content?.trim().slice(0, 240) ||
    "Provider responded without text."
  );
}

async function testOllamaProvider() {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL ?? "llama3.1",
      messages: [
        {
          role: "user",
          content:
            "Reply with one short sentence confirming the FYEC100 assistant provider test is working."
        }
      ],
      stream: false,
      options: {
        temperature: 0
      }
    }),
    signal: AbortSignal.timeout(getProviderTimeoutMs())
  });

  if (!response.ok) {
    throw new Error(`Ollama responded with HTTP ${response.status}.`);
  }

  const data = (await response.json()) as {
    message?: { content?: string };
  };

  return data.message?.content?.trim().slice(0, 240) || "Provider responded without text.";
}

async function testDeepSeekProvider() {
  const deepseek = createOpenAIClient(
    process.env.DEEPSEEK_API_KEY,
    process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com"
  );
  const completion = await deepseek.chat.completions.create({
    max_tokens: 120,
    model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
    temperature: 0,
    messages: [
      {
        role: "user",
        content:
          "Reply with one short sentence confirming the FYEC100 assistant provider test is working."
      }
    ]
  });

  return (
    completion.choices[0]?.message.content?.trim().slice(0, 240) ||
    "Provider responded without text."
  );
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

  const openai = createOpenAIClient(process.env.OPENAI_API_KEY);
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const conversationMessages: ChatCompletionMessageParam[] = messages
    .slice(-8)
    .map((message) => ({
      role: toModelRole(message.role),
      content: message.content
    }));

  const completion = await openai.chat.completions.create({
    max_tokens: getMaxOutputTokens(),
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
    }),
    signal: AbortSignal.timeout(getProviderTimeoutMs())
  });

  if (!response.ok) {
    return getMissingProviderConfigMessage();
  }

  const data = (await response.json()) as {
    message?: { content?: string };
  };

  return data.message?.content?.trim() || fallbackAnswer;
}

async function generateWithDeepSeek({
  fallbackAnswer,
  knowledgeBase,
  messages,
  systemPrompt
}: GenerateAnswerInput) {
  if (!process.env.DEEPSEEK_API_KEY) {
    return getMissingProviderConfigMessage();
  }

  const deepseek = createOpenAIClient(
    process.env.DEEPSEEK_API_KEY,
    process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com"
  );
  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

  const conversationMessages: ChatCompletionMessageParam[] = messages
    .slice(-8)
    .map((message) => ({
      role: toModelRole(message.role),
      content: message.content
    }));

  const completion = await deepseek.chat.completions.create({
    max_tokens: getMaxOutputTokens(),
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
