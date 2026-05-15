import { getDeploymentReadiness } from "@/lib/deploymentReadiness";
import { getProviderStatus } from "@/lib/aiProvider";
import { getRateLimitSummary } from "@/lib/rateLimit";

type EnvStatus = "configured" | "missing" | "local" | "optional";
type TargetStatus = "recommended" | "possible" | "future";
type CaveatStatus = "required" | "review" | "future";

type EnvironmentItem = {
  name: string;
  purpose: string;
  status: EnvStatus;
  valuePreview: string;
};

type DeploymentTarget = {
  name: string;
  status: TargetStatus;
  bestFor: string;
  notes: string[];
};

type ProductionCaveat = {
  label: string;
  status: CaveatStatus;
  owner: string;
  note: string;
};

export async function buildHostedDeploymentPack() {
  const readiness = await getDeploymentReadiness();
  const provider = getProviderStatus();
  const rateLimits = getRateLimitSummary();
  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:4100";
  const moodleOrigin = process.env.MOODLE_ORIGIN ?? "";
  const environmentMatrix = buildEnvironmentMatrix({
    appBaseUrl,
    moodleOrigin,
    provider,
    rateLimits
  });
  const caveats = buildProductionCaveats();
  const unresolvedRequired = caveats.filter(
    (caveat) => caveat.status === "required"
  ).length;

  return {
    caveats,
    deploymentTargets: buildDeploymentTargets(),
    environmentMatrix,
    exportPath: "/api/admin/hosted-deployment-pack.md",
    generatedAt: new Date().toISOString(),
    readiness,
    statusMessage:
      readiness.summary.fail > 0
        ? "Hosted deployment pack has blocking readiness failures to resolve before Moodle pilot use."
        : "Hosted deployment pack is ready for IT review, with warnings to resolve before live Moodle testing.",
    summary: {
      configuredEnv: environmentMatrix.filter(
        (item) => item.status === "configured"
      ).length,
      localEnv: environmentMatrix.filter((item) => item.status === "local").length,
      missingEnv: environmentMatrix.filter((item) => item.status === "missing")
        .length,
      optionalEnv: environmentMatrix.filter((item) => item.status === "optional")
        .length,
      readinessFailures: readiness.summary.fail,
      readinessPasses: readiness.summary.pass,
      readinessWarnings: readiness.summary.warn,
      unresolvedRequired
    },
    verificationSteps: [
      "Set hosted environment variables in the approved platform or server secret store.",
      "Run npm install and npm run build on the hosted target.",
      "Start the app with npm run start:pilot or the approved process manager.",
      "Run PILOT_BASE_URL=<hosted-url> npm run smoke:pilot.",
      "Open /api/admin/deployment-readiness and confirm there are no failed checks.",
      "Open /embed inside the controlled Moodle course shell.",
      "Export this pack, the pilot evidence dashboard, and the pilot analytics summary for review."
    ]
  };
}

export async function renderHostedDeploymentPackMarkdown() {
  const pack = await buildHostedDeploymentPack();

  return [
    "# FYEC100 Hosted Deployment Readiness Pack",
    "",
    `Generated: ${new Date(pack.generatedAt).toLocaleString()}`,
    "",
    "## Summary",
    "",
    `- Readiness passes: ${pack.summary.readinessPasses}`,
    `- Readiness warnings: ${pack.summary.readinessWarnings}`,
    `- Readiness failures: ${pack.summary.readinessFailures}`,
    `- Configured environment items: ${pack.summary.configuredEnv}`,
    `- Local environment items: ${pack.summary.localEnv}`,
    `- Missing environment items: ${pack.summary.missingEnv}`,
    `- Optional environment items: ${pack.summary.optionalEnv}`,
    `- Required production caveats: ${pack.summary.unresolvedRequired}`,
    "",
    "## Environment Matrix",
    "",
    ...pack.environmentMatrix.map(
      (item) =>
        `- [${item.status}] ${item.name}: ${item.purpose} (${item.valuePreview})`
    ),
    "",
    "## Deployment Targets",
    "",
    ...pack.deploymentTargets.flatMap((target) => [
      `### ${target.name}`,
      "",
      `- Status: ${target.status}`,
      `- Best for: ${target.bestFor}`,
      ...target.notes.map((note) => `- ${note}`),
      ""
    ]),
    "## Production Caveats",
    "",
    ...pack.caveats.map(
      (caveat) =>
        `- [${caveat.status}] ${caveat.label} (${caveat.owner}): ${caveat.note}`
    ),
    "",
    "## Verification Steps",
    "",
    ...pack.verificationSteps.map((step, index) => `${index + 1}. ${step}`),
    "",
    "## Current Deployment Readiness Checks",
    "",
    ...pack.readiness.checks.map(
      (check) => `- [${check.status}] ${check.label}: ${check.message}`
    ),
    "",
    "## Trust Boundary",
    "",
    "This pack supports a controlled Phase 2 hosted pilot. It is not a production security approval, production privacy assessment, or final Moodle/LTI authentication design.",
    ""
  ].join("\n");
}

function buildEnvironmentMatrix({
  appBaseUrl,
  moodleOrigin,
  provider,
  rateLimits
}: {
  appBaseUrl: string;
  moodleOrigin: string;
  provider: ReturnType<typeof getProviderStatus>;
  rateLimits: ReturnType<typeof getRateLimitSummary>;
}): EnvironmentItem[] {
  const providerIsOllama = provider.provider === "ollama";

  return [
    {
      name: "NEXT_PUBLIC_APP_BASE_URL",
      purpose: "Approved public or internal HTTPS URL for Moodle embedding.",
      status: isLocalUrl(appBaseUrl) ? "local" : "configured",
      valuePreview: appBaseUrl
    },
    {
      name: "MOODLE_ORIGIN",
      purpose: "Approved Moodle HTTPS origin for iframe frame-ancestors headers.",
      status: moodleOrigin ? "configured" : "missing",
      valuePreview: moodleOrigin || "not set"
    },
    {
      name: "ADMIN_ACCESS_TOKEN",
      purpose: "Pilot admin gate for /admin and /api/admin/* routes.",
      status: process.env.ADMIN_ACCESS_TOKEN ? "configured" : "missing",
      valuePreview: process.env.ADMIN_ACCESS_TOKEN ? "set" : "not set"
    },
    {
      name: "AI_PROVIDER",
      purpose: "Selected AI provider for the chat API.",
      status: provider.provider ? "configured" : "missing",
      valuePreview: provider.provider
    },
    {
      name: "OPENAI_API_KEY",
      purpose: "Required when AI_PROVIDER=openai.",
      status: providerIsOllama
        ? "optional"
        : process.env.OPENAI_API_KEY
          ? "configured"
          : "missing",
      valuePreview: providerIsOllama
        ? "not required for Ollama"
        : process.env.OPENAI_API_KEY
          ? "set"
          : "not set"
    },
    {
      name: "OPENAI_MODEL",
      purpose: "Optional OpenAI model override.",
      status: providerIsOllama ? "optional" : "configured",
      valuePreview: process.env.OPENAI_MODEL ?? "gpt-4o-mini"
    },
    {
      name: "OLLAMA_BASE_URL",
      purpose: "Required when AI_PROVIDER=ollama.",
      status: providerIsOllama
        ? process.env.OLLAMA_BASE_URL
          ? "configured"
          : "missing"
        : "optional",
      valuePreview: process.env.OLLAMA_BASE_URL ?? "not set"
    },
    {
      name: "OLLAMA_MODEL",
      purpose: "Model name when AI_PROVIDER=ollama.",
      status: providerIsOllama ? "configured" : "optional",
      valuePreview: process.env.OLLAMA_MODEL ?? "llama3.1"
    },
    {
      name: "CHAT_RATE_LIMIT_PER_MINUTE",
      purpose: "Pilot chat API rate limit.",
      status: rateLimits.chatPerMinute > 0 ? "configured" : "missing",
      valuePreview: String(rateLimits.chatPerMinute)
    },
    {
      name: "FEEDBACK_RATE_LIMIT_PER_MINUTE",
      purpose: "Pilot feedback API rate limit.",
      status: rateLimits.feedbackPerMinute > 0 ? "configured" : "missing",
      valuePreview: String(rateLimits.feedbackPerMinute)
    },
    {
      name: "LAUNCH_AUDIT_RATE_LIMIT_PER_MINUTE",
      purpose: "Pilot Moodle launch audit rate limit.",
      status: rateLimits.launchAuditPerMinute > 0 ? "configured" : "missing",
      valuePreview: String(rateLimits.launchAuditPerMinute)
    },
    {
      name: "PROVIDER_TEST_RATE_LIMIT_PER_MINUTE",
      purpose: "Pilot provider test API rate limit.",
      status: rateLimits.providerTestPerMinute > 0 ? "configured" : "missing",
      valuePreview: String(rateLimits.providerTestPerMinute)
    }
  ];
}

function buildDeploymentTargets(): DeploymentTarget[] {
  return [
    {
      name: "Internal VM or campus server",
      status: "recommended",
      bestFor: "Controlled Moodle pilot with institutional network controls.",
      notes: [
        "Run behind HTTPS and a process manager.",
        "Store environment secrets outside Git.",
        "Confirm writable storage for JSONL pilot files or replace it with approved storage."
      ]
    },
    {
      name: "Approved cloud host",
      status: "possible",
      bestFor: "Fast hosted pilot if cloud approval and privacy requirements are met.",
      notes: [
        "Use platform environment variables for secrets.",
        "Restrict /admin and /api/admin/* with platform access controls.",
        "Confirm data residency and logging expectations before student testing."
      ]
    },
    {
      name: "Container deployment",
      status: "future",
      bestFor: "Repeatable enterprise deployment after pilot architecture is approved.",
      notes: [
        "Add Dockerfile and health checks in a later build.",
        "Mount persistent storage or move pilot records to approved managed storage.",
        "Pair with SSO, Moodle validation, or LTI before production."
      ]
    },
    {
      name: "Local Mac only",
      status: "possible",
      bestFor: "Developer demos and project-team walkthroughs.",
      notes: [
        "Do not use local Mac hosting for a student Moodle pilot.",
        "Local URLs cannot be embedded for normal student access.",
        "Use this only for continued Phase 2 build validation."
      ]
    }
  ];
}

function buildProductionCaveats(): ProductionCaveat[] {
  return [
    {
      label: "HTTPS required",
      owner: "System Administrator",
      status: "required",
      note: "Hosted Moodle embedding and future LTI testing should use an approved HTTPS URL."
    },
    {
      label: "Admin token is pilot-only",
      owner: "Technical Lead",
      status: "review",
      note: "ADMIN_ACCESS_TOKEN is a Phase 2 gate, not production authentication or role authorization."
    },
    {
      label: "Moodle/LTI trust not final",
      owner: "Technical Lead / LMS Administrator",
      status: "required",
      note: "Query-string role context is not authenticated. Production should use Moodle-side validation or LTI 1.3."
    },
    {
      label: "Logging and retention approval",
      owner: "Project Sponsor / Governance",
      status: "required",
      note: "Feedback, launch audit, analytics, and support records need approved retention and access rules."
    },
    {
      label: "Knowledge base ownership",
      owner: "Lecturer / Content Owner",
      status: "review",
      note: "Define who approves FYEC100 content changes before production use."
    },
    {
      label: "Database decision",
      owner: "Technical Lead / System Administrator",
      status: "future",
      note: "Phase 2 remains file-based. Enterprise deployment should decide whether to use approved managed storage."
    }
  ];
}

function isLocalUrl(value: string) {
  return /(localhost|127\.0\.0\.1|0\.0\.0\.0)/i.test(value);
}
