import { getAdminAuthStatus } from "@/lib/adminAuth";
import { getProviderStatus } from "@/lib/aiProvider";

export type ReadinessCheck = {
  id: string;
  label: string;
  message: string;
  status: "pass" | "warning" | "fail";
};

export function getProductionReadiness() {
  const appUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;
  const moodleOrigin = process.env.MOODLE_ORIGIN;
  const integrationMode = process.env.MOODLE_INTEGRATION_MODE ?? "iframe";
  const admin = getAdminAuthStatus();
  const provider = getProviderStatus();
  const adminToken = process.env.ADMIN_ACCESS_TOKEN ?? "";
  const sessionSecret = process.env.ADMIN_SESSION_SECRET ?? "";
  const checks: ReadinessCheck[] = [
    {
      id: "app-url",
      label: "Public application URL",
      message: appUrl
        ? appUrl.startsWith("https://")
          ? "The application URL uses HTTPS."
          : "Use an HTTPS application URL before Moodle pilot access."
        : "NEXT_PUBLIC_APP_BASE_URL is not configured.",
      status: appUrl?.startsWith("https://") ? "pass" : "fail"
    },
    {
      id: "moodle-origin",
      label: "Moodle origin",
      message: moodleOrigin
        ? moodleOrigin.startsWith("https://")
          ? "The Moodle origin is configured with HTTPS."
          : "The Moodle origin must use HTTPS."
        : "MOODLE_ORIGIN is not configured.",
      status: moodleOrigin?.startsWith("https://") ? "pass" : "fail"
    },
    {
      id: "admin-auth",
      label: "Admin access",
      message:
        admin.configured && adminToken.length >= 32
          ? "Admin route protection has a strong access token."
          : "Set ADMIN_ACCESS_TOKEN to a random value of at least 32 characters.",
      status: admin.configured && adminToken.length >= 32 ? "pass" : "fail"
    },
    {
      id: "session-signing",
      label: "Admin session signing",
      message:
        sessionSecret.length >= 32 && sessionSecret !== adminToken
          ? "Admin sessions use a separate signing secret."
          : "Set a separate ADMIN_SESSION_SECRET of at least 32 characters.",
      status:
        sessionSecret.length >= 32 && sessionSecret !== adminToken ? "pass" : "fail"
    },
    {
      id: "provider",
      label: "AI provider",
      message: provider.configured
        ? `${provider.provider} is configured with model ${provider.model}.`
        : `${provider.provider} is selected but not fully configured.`,
      status: provider.configured ? "pass" : "fail"
    },
    {
      id: "integration-mode",
      label: "Moodle integration mode",
      message:
        integrationMode === "iframe"
          ? "Iframe mode is selected for the controlled Moodle pilot."
          : "LTI mode requires completed launch validation and platform configuration.",
      status: integrationMode === "iframe" ? "pass" : "warning"
    },
    {
      id: "storage",
      label: "Operational storage",
      message:
        (process.env.STORAGE_ADAPTER ?? "local") === "local"
          ? "Local file storage supports one Windows VM instance; use approved shared storage before scaling to multiple app instances."
          : "A non-local storage adapter is selected.",
      status: (process.env.STORAGE_ADAPTER ?? "local") === "local" ? "warning" : "pass"
    },
    {
      id: "proxy-headers",
      label: "Reverse proxy trust",
      message:
        process.env.TRUST_PROXY_HEADERS === "true"
          ? "Forwarded client addresses are enabled; IIS must overwrite untrusted forwarding headers."
          : "Enable TRUST_PROXY_HEADERS behind the controlled IIS reverse proxy for per-client rate limits.",
      status: process.env.TRUST_PROXY_HEADERS === "true" ? "pass" : "fail"
    }
  ];
  const failed = checks.filter((check) => check.status === "fail").length;

  return {
    checks,
    failed,
    ok: failed === 0,
    status: failed === 0 ? "ready" : "not-ready",
    timestamp: new Date().toISOString(),
    warnings: checks.filter((check) => check.status === "warning").length
  };
}
