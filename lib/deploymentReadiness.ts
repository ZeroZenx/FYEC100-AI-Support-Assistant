import { access, appendFile, mkdir } from "fs/promises";
import path from "path";
import { getProviderStatus } from "@/lib/aiProvider";
import { getRateLimitSummary } from "@/lib/rateLimit";

type ReadinessStatus = "pass" | "warn" | "fail";

type ReadinessCheck = {
  label: string;
  message: string;
  status: ReadinessStatus;
};

const DATA_DIR = path.join(process.cwd(), "data");
const KNOWLEDGE_BASE_PATH = path.join(DATA_DIR, "fyec100-knowledge-base.md");
const FEEDBACK_PATH = path.join(DATA_DIR, "pilot-feedback.jsonl");

export async function getDeploymentReadiness() {
  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:4100";
  const providerStatus = getProviderStatus();
  const rateLimits = getRateLimitSummary();
  const checks: ReadinessCheck[] = [
    checkAppBaseUrl(appBaseUrl),
    checkHttps(appBaseUrl),
    checkProvider(providerStatus.configured),
    checkRateLimits(rateLimits),
    await checkKnowledgeBase(),
    await checkFeedbackStorage(),
    checkAdminExposure(),
    checkPilotMode()
  ];
  const summary = {
    fail: checks.filter((check) => check.status === "fail").length,
    pass: checks.filter((check) => check.status === "pass").length,
    warn: checks.filter((check) => check.status === "warn").length
  };

  return {
    appBaseUrl,
    checks,
    okForControlledPilot: summary.fail === 0,
    provider: providerStatus,
    rateLimits,
    summary,
    timestamp: new Date().toISOString()
  };
}

function checkAppBaseUrl(appBaseUrl: string): ReadinessCheck {
  if (/(localhost|127\.0\.0\.1|0\.0\.0\.0)/i.test(appBaseUrl)) {
    return {
      label: "Public app base URL",
      message:
        "NEXT_PUBLIC_APP_BASE_URL is still local. Set it to the approved hosted pilot URL before Moodle embedding.",
      status: "warn"
    };
  }

  return {
    label: "Public app base URL",
    message: `App base URL is set to ${appBaseUrl}.`,
    status: "pass"
  };
}

function checkHttps(appBaseUrl: string): ReadinessCheck {
  if (!appBaseUrl.startsWith("https://")) {
    return {
      label: "HTTPS",
      message: "Hosted Moodle pilots should use HTTPS for iframe and LTI testing.",
      status: "warn"
    };
  }

  return {
    label: "HTTPS",
    message: "App base URL uses HTTPS.",
    status: "pass"
  };
}

function checkProvider(configured: boolean): ReadinessCheck {
  return {
    label: "AI provider",
    message: configured
      ? "Selected AI provider has required environment variables."
      : "Selected AI provider is missing required environment variables.",
    status: configured ? "pass" : "warn"
  };
}

function checkRateLimits(rateLimits: ReturnType<typeof getRateLimitSummary>): ReadinessCheck {
  const enabled =
    rateLimits.chatPerMinute > 0 &&
    rateLimits.feedbackPerMinute > 0 &&
    rateLimits.providerTestPerMinute > 0;

  return {
    label: "Pilot rate limits",
    message: enabled
      ? `Rate limits are active: chat ${rateLimits.chatPerMinute}/min, feedback ${rateLimits.feedbackPerMinute}/min, provider test ${rateLimits.providerTestPerMinute}/min.`
      : "Rate limits must be positive numbers before pilot use.",
    status: enabled ? "pass" : "fail"
  };
}

async function checkKnowledgeBase(): Promise<ReadinessCheck> {
  try {
    await access(KNOWLEDGE_BASE_PATH);

    return {
      label: "Knowledge base",
      message: "FYEC100 knowledge base file is readable.",
      status: "pass"
    };
  } catch {
    return {
      label: "Knowledge base",
      message: "FYEC100 knowledge base file is missing or unreadable.",
      status: "fail"
    };
  }
}

async function checkFeedbackStorage(): Promise<ReadinessCheck> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(FEEDBACK_PATH, "", "utf8");

    return {
      label: "Pilot feedback storage",
      message: "Local JSONL feedback storage is writable.",
      status: "pass"
    };
  } catch {
    return {
      label: "Pilot feedback storage",
      message:
        "Local JSONL feedback storage is not writable. Confirm hosted storage before a pilot.",
      status: "fail"
    };
  }
}

function checkAdminExposure(): ReadinessCheck {
  return {
    label: "Admin exposure",
    message:
      "The current /admin page is not authenticated. Keep it internal or behind platform access controls for hosted pilots.",
    status: "warn"
  };
}

function checkPilotMode(): ReadinessCheck {
  return {
    label: "Pilot scope",
    message:
      "This build is suitable for controlled Phase 2 pilot testing, not open production deployment.",
    status: "warn"
  };
}
