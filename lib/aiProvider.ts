import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import {
  ChatGptAuthError,
  generateChatGptResponse,
  getChatGptAuthConfigStatus,
  testChatGptProvider as testChatGptProviderRequest
} from "@/lib/chatgptAuth";

type ClientMessage = {
  role: "student" | "assistant";
  content: string;
};

type GenerateAnswerInput = {
  fallbackAnswer: string;
  knowledgeBase: string;
  messages: ClientMessage[];
  request?: Request;
  systemPrompt: string;
};

type OllamaChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ProviderName = "chatgpt" | "openai" | "ollama" | "deepseek";

export type ProviderTestOverrides = {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  provider?: ProviderName;
};

function toModelRole(role: ClientMessage["role"]): "user" | "assistant" {
  return role === "student" ? "user" : "assistant";
}

function getProvider(): ProviderName {
  const provider = (process.env.AI_PROVIDER ?? "openai").toLowerCase();

  if (provider === "chatgpt" || provider === "ollama" || provider === "deepseek") {
    return provider;
  }

  return "openai";
}

function getProviderFromOverride(provider?: string): ProviderName {
  const normalized = provider?.toLowerCase();

  if (normalized === "chatgpt" || normalized === "ollama" || normalized === "deepseek") {
    return normalized;
  }

  return normalized === "openai" ? "openai" : getProvider();
}

export function getProviderStatus(overrides: ProviderTestOverrides = {}) {
  const provider = getProviderFromOverride(overrides.provider);
  const model =
    provider === "chatgpt"
      ? overrides.model || process.env.CHATGPT_MODEL || "account-selected"
      : provider === "ollama"
      ? overrides.model || process.env.OLLAMA_MODEL || "llama3.1"
      : provider === "deepseek"
        ? overrides.model || process.env.DEEPSEEK_MODEL || "deepseek-chat"
      : overrides.model || process.env.OPENAI_MODEL || "gpt-4o-mini";
  const configured =
    provider === "chatgpt"
      ? getChatGptAuthConfigStatus().configured
      : provider === "ollama"
      ? Boolean(overrides.baseUrl || process.env.OLLAMA_BASE_URL || process.env.OLLAMA_MODEL)
      : provider === "deepseek"
        ? Boolean(overrides.apiKey || process.env.DEEPSEEK_API_KEY)
      : Boolean(overrides.apiKey || process.env.OPENAI_API_KEY);

  return {
    configured,
    model,
    provider,
    requiredVariables:
      provider === "chatgpt"
        ? [
            "AI_PROVIDER",
            "CHATGPT_AUTH_ENABLED",
            "CHATGPT_ALLOWED_EMAIL or CHATGPT_ALLOWED_SUBJECT",
            "CHATGPT_REDIRECT_URI"
          ]
        : provider === "ollama"
        ? ["AI_PROVIDER", "OLLAMA_BASE_URL", "OLLAMA_MODEL"]
        : provider === "deepseek"
          ? ["AI_PROVIDER", "DEEPSEEK_API_KEY", "DEEPSEEK_MODEL"]
        : ["AI_PROVIDER", "OPENAI_API_KEY", "OPENAI_MODEL"]
  };
}

export function getMissingProviderConfigMessage() {
  const provider = getProvider();

  if (provider === "chatgpt") {
    return (
      getChatGptAuthConfigStatus().error ||
      "The ChatGPT provider is ready for local use after you select Continue with ChatGPT and approve plan access."
    );
  }

  if (provider === "ollama") {
    return "The chat interface is running, but Ollama is not reachable or not configured. Start Ollama locally, set OLLAMA_BASE_URL and OLLAMA_MODEL in .env.local, then restart npm run dev.";
  }

  if (provider === "deepseek") {
    return "The chat interface is running, but DEEPSEEK_API_KEY is not configured. Add your key to .env.local, restart npm run dev, and try again.";
  }

  return "The chat interface is running, but OPENAI_API_KEY is not configured. Add your key to .env.local, restart npm run dev, and try again. For now, use the About and Roadmap pages to review the prototype.";
}

export function getProviderRuntimeErrorMessage(error: unknown) {
  const provider = getProvider();
  const message = error instanceof Error ? error.message : "";
  const lowerMessage = message.toLowerCase();

  if (provider === "chatgpt") {
    if (error instanceof ChatGptAuthError && error.code === "not_authenticated") {
      return "Continue with ChatGPT before using the ChatGPT provider. The existing OpenAI and Ollama providers remain available when selected explicitly.";
    }

    if (error instanceof ChatGptAuthError && error.code === "local_only") {
      return "ChatGPT plan usage is restricted to this local development runtime and is not available through a hosted or Moodle iframe request.";
    }

    if (error instanceof ChatGptAuthError && error.code === "not_configured") {
      return getMissingProviderConfigMessage();
    }

    return "The signed-in ChatGPT provider could not complete this request. Check ChatGPT connection status, plan access, model availability, and the local authentication guide.";
  }

  if (
    lowerMessage.includes("429") ||
    lowerMessage.includes("quota") ||
    lowerMessage.includes("billing") ||
    lowerMessage.includes("rate limit")
  ) {
    return `${getProviderLabel(provider)} is configured, but it is currently rejecting requests because of quota, billing, or rate limits. Check the provider account, billing status, and model access, then try again.`;
  }

  if (
    lowerMessage.includes("401") ||
    lowerMessage.includes("403") ||
    lowerMessage.includes("api key") ||
    lowerMessage.includes("auth")
  ) {
    return `${getProviderLabel(provider)} is configured, but the provider rejected the credentials or model access. Check the API key, selected model, and provider permissions.`;
  }

  if (
    lowerMessage.includes("fetch failed") ||
    lowerMessage.includes("econnrefused") ||
    lowerMessage.includes("enotfound") ||
    lowerMessage.includes("timeout")
  ) {
    return `${getProviderLabel(provider)} is configured, but the assistant could not reach the provider. Check network access and the provider endpoint, then try again.`;
  }

  return "The assistant provider is configured, but the request failed. Check the provider test page or server logs for the exact provider error.";
}

function getProviderLabel(provider: ProviderName) {
  if (provider === "chatgpt") return "ChatGPT";
  if (provider === "ollama") return "Ollama";
  if (provider === "deepseek") return "DeepSeek";
  return "OpenAI";
}

export async function generateAssistantAnswer({
  fallbackAnswer,
  knowledgeBase,
  messages,
  request,
  systemPrompt
}: GenerateAnswerInput) {
  const provider = getProvider();

  if (provider === "chatgpt") {
    return generateWithChatGpt({
      fallbackAnswer,
      knowledgeBase,
      messages,
      request,
      systemPrompt
    });
  }

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

export async function testSelectedProvider(
  overrides: ProviderTestOverrides = {},
  request?: Request
) {
  const status = getProviderStatus(overrides);
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
      status.provider === "chatgpt"
        ? request
          ? await testChatGptProviderRequest(request)
          : await Promise.reject(new ChatGptAuthError("request_missing", "A request context is required for ChatGPT provider testing."))
        : status.provider === "ollama"
        ? await testOllamaProvider(overrides)
        : status.provider === "deepseek"
          ? await testDeepSeekProvider(overrides)
        : await testOpenAIProvider(overrides);

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

async function testOpenAIProvider(overrides: ProviderTestOverrides = {}) {
  const openai = new OpenAI({ apiKey: overrides.apiKey || process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: overrides.model || process.env.OPENAI_MODEL || "gpt-4o-mini",
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

async function testOllamaProvider(overrides: ProviderTestOverrides = {}) {
  const baseUrl = overrides.baseUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: overrides.model || process.env.OLLAMA_MODEL || "llama3.1",
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
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama responded with HTTP ${response.status}.`);
  }

  const data = (await response.json()) as {
    message?: { content?: string };
  };

  return data.message?.content?.trim().slice(0, 240) || "Provider responded without text.";
}

async function testDeepSeekProvider(overrides: ProviderTestOverrides = {}) {
  const deepseek = new OpenAI({
    apiKey: overrides.apiKey || process.env.DEEPSEEK_API_KEY,
    baseURL: overrides.baseUrl || process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"
  });
  const completion = await deepseek.chat.completions.create({
    model: overrides.model || process.env.DEEPSEEK_MODEL || "deepseek-chat",
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

async function generateWithChatGpt({
  fallbackAnswer,
  knowledgeBase,
  messages,
  request,
  systemPrompt
}: GenerateAnswerInput) {
  if (!request) {
    throw new ChatGptAuthError(
      "request_missing",
      "A request context is required for ChatGPT plan usage."
    );
  }

  const conversationMessages = messages.slice(-8).map((message) => ({
    content: message.content,
    role: toModelRole(message.role)
  }));

  const answer = await generateChatGptResponse({
    messages: conversationMessages,
    request,
    systemPrompt: `${systemPrompt}

FYEC100 knowledge base:

${knowledgeBase}

If the student's answer cannot be supported by this knowledge base, use this fallback: ${fallbackAnswer}`
  });

  return answer.trim() || fallbackAnswer;
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

async function generateWithDeepSeek({
  fallbackAnswer,
  knowledgeBase,
  messages,
  systemPrompt
}: GenerateAnswerInput) {
  if (!process.env.DEEPSEEK_API_KEY) {
    return getMissingProviderConfigMessage();
  }

  const deepseek = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com"
  });
  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

  const conversationMessages: ChatCompletionMessageParam[] = messages
    .slice(-8)
    .map((message) => ({
      role: toModelRole(message.role),
      content: message.content
    }));

  const completion = await deepseek.chat.completions.create({
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
