import { access, appendFile, mkdir } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const KNOWLEDGE_BASE_PATH = path.join(DATA_DIR, "fyec100-knowledge-base.md");
const FEEDBACK_PATH = path.join(DATA_DIR, "pilot-feedback.jsonl");

type HealthCheck = {
  label: string;
  message: string;
  status: "ok" | "warning" | "error";
};

export async function getHealthStatus() {
  const provider = (process.env.AI_PROVIDER ?? "openai").toLowerCase();
  const providerConfigured =
    provider === "ollama"
      ? Boolean(process.env.OLLAMA_BASE_URL || process.env.OLLAMA_MODEL)
      : Boolean(process.env.OPENAI_API_KEY);

  const checks: HealthCheck[] = [
    {
      label: "Application",
      message: "Next.js application is responding.",
      status: "ok"
    },
    {
      label: "AI provider",
      message: providerConfigured
        ? `${provider} provider variables are configured.`
        : `${provider} provider variables need configuration before pilot use.`,
      status: providerConfigured ? "ok" : "warning"
    },
    await checkKnowledgeBase(),
    await checkFeedbackStorage()
  ];

  return {
    checks,
    ok: checks.every((check) => check.status !== "error"),
    provider,
    timestamp: new Date().toISOString()
  };
}

async function checkKnowledgeBase(): Promise<HealthCheck> {
  try {
    await access(KNOWLEDGE_BASE_PATH);

    return {
      label: "Knowledge base",
      message: "FYEC100 knowledge base file is readable.",
      status: "ok"
    };
  } catch {
    return {
      label: "Knowledge base",
      message: "FYEC100 knowledge base file is not readable.",
      status: "error"
    };
  }
}

async function checkFeedbackStorage(): Promise<HealthCheck> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(FEEDBACK_PATH, "", "utf8");

    return {
      label: "Feedback storage",
      message: "Pilot feedback JSONL file is writable.",
      status: "ok"
    };
  } catch {
    return {
      label: "Feedback storage",
      message: "Pilot feedback JSONL file is not writable.",
      status: "error"
    };
  }
}
