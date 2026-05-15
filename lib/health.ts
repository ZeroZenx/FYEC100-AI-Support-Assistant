import { access, appendFile, mkdir } from "fs/promises";
import path from "path";
import { getProviderStatus } from "@/lib/aiProvider";
import { getRateLimitSummary } from "@/lib/rateLimit";

const DATA_DIR = path.join(process.cwd(), "data");
const KNOWLEDGE_BASE_PATH = path.join(DATA_DIR, "fyec100-knowledge-base.md");
const FEEDBACK_PATH = path.join(DATA_DIR, "pilot-feedback.jsonl");
const LAUNCH_AUDIT_PATH = path.join(DATA_DIR, "moodle-launch-audit.jsonl");

type HealthCheck = {
  label: string;
  message: string;
  status: "ok" | "warning" | "error";
};

export async function getHealthStatus() {
  const providerStatus = getProviderStatus();

  const checks: HealthCheck[] = [
    {
      label: "Application",
      message: "Next.js application is responding.",
      status: "ok"
    },
    {
      label: "AI provider",
      message: providerStatus.configured
        ? `${providerStatus.provider} provider variables are configured.`
        : `${providerStatus.provider} provider variables need configuration before pilot use.`,
      status: providerStatus.configured ? "ok" : "warning"
    },
    await checkKnowledgeBase(),
    checkRateLimiting(),
    await checkFeedbackStorage(),
    await checkLaunchAuditStorage()
  ];

  return {
    checks,
    ok: checks.every((check) => check.status !== "error"),
    provider: providerStatus.provider,
    timestamp: new Date().toISOString()
  };
}

function checkRateLimiting(): HealthCheck {
  const summary = getRateLimitSummary();

  return {
    label: "Rate limiting",
    message: `Pilot API limits are active: chat ${summary.chatPerMinute}/min, feedback ${summary.feedbackPerMinute}/min, launch audit ${summary.launchAuditPerMinute}/min, provider test ${summary.providerTestPerMinute}/min.`,
    status: "ok"
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

async function checkLaunchAuditStorage(): Promise<HealthCheck> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(LAUNCH_AUDIT_PATH, "", "utf8");

    return {
      label: "Moodle launch audit storage",
      message: "Moodle launch audit JSONL file is writable.",
      status: "ok"
    };
  } catch {
    return {
      label: "Moodle launch audit storage",
      message: "Moodle launch audit JSONL file is not writable.",
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
