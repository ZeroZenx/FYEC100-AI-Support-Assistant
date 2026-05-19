import { getProviderStatus } from "@/lib/aiProvider";
import { getDeploymentReadiness } from "@/lib/deploymentReadiness";
import { buildMoodleLaunchSimulator } from "@/lib/moodleLaunchSimulator";
import { buildMoodlePilotConfigPack } from "@/lib/moodlePilotConfig";
import { buildPilotDataCleanupPreview } from "@/lib/pilotDataCleanup";
import {
  callout,
  codeBlock,
  list,
  metric,
  recordCard,
  renderHtmlReport,
  table
} from "@/lib/htmlReport";

export type HandoffStatus = "configured" | "local" | "missing" | "optional";

export type HandoffEnvItem = {
  category: string;
  example: string;
  name: string;
  notes: string;
  requiredFor: string;
  status: HandoffStatus;
};

export function buildEnvironmentItems(): HandoffEnvItem[] {
  const provider = getProviderStatus();
  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:4100";
  const moodleOrigin = process.env.MOODLE_ORIGIN ?? "";

  return [
    envItem({
      category: "Hosting",
      example: "https://fyec100-assistant.costaatt.edu.tt",
      name: "NEXT_PUBLIC_APP_BASE_URL",
      notes:
        "Use the approved HTTPS URL for the Windows VM or reverse proxy endpoint.",
      requiredFor: "Hosted iframe pilot",
      status: isLocalUrl(appBaseUrl) ? "local" : "configured"
    }),
    envItem({
      category: "Moodle",
      example: "https://moodle.costaatt.edu.tt",
      name: "MOODLE_ORIGIN",
      notes:
        "Set only the Moodle origin, not a full course URL. Rebuild after changing this value.",
      requiredFor: "Iframe frame-ancestors protection",
      status: moodleOrigin ? "configured" : "missing"
    }),
    envItem({
      category: "Admin",
      example: "long_random_value",
      name: "ADMIN_ACCESS_TOKEN",
      notes:
        "Protects pilot admin pages and /api/admin/* routes. Store in Windows environment variables or service manager config.",
      requiredFor: "Hosted admin protection",
      status: process.env.ADMIN_ACCESS_TOKEN ? "configured" : "missing"
    }),
    envItem({
      category: "Pilot",
      example: "pilot",
      name: "PILOT_MODE",
      notes: "Use demo for rehearsals and pilot for controlled student testing.",
      requiredFor: "Pilot governance",
      status: "configured"
    }),
    envItem({
      category: "Provider",
      example: "deepseek",
      name: "AI_PROVIDER",
      notes: "Supported values: openai, deepseek, ollama.",
      requiredFor: "Chat responses",
      status: provider.provider ? "configured" : "missing"
    }),
    envItem({
      category: "DeepSeek",
      example: "your_deepseek_key_here",
      name: "DEEPSEEK_API_KEY",
      notes:
        "Required only when AI_PROVIDER=deepseek. Never commit this value to GitHub.",
      requiredFor: "DeepSeek hosted pilot",
      status:
        provider.provider === "deepseek"
          ? process.env.DEEPSEEK_API_KEY
            ? "configured"
            : "missing"
          : "optional"
    }),
    envItem({
      category: "DeepSeek",
      example: "deepseek-chat",
      name: "DEEPSEEK_MODEL",
      notes: "Optional model override for DeepSeek.",
      requiredFor: "DeepSeek hosted pilot",
      status: provider.provider === "deepseek" ? "configured" : "optional"
    }),
    envItem({
      category: "OpenAI",
      example: "your_openai_key_here",
      name: "OPENAI_API_KEY",
      notes:
        "Required only when AI_PROVIDER=openai. Never commit this value to GitHub.",
      requiredFor: "OpenAI hosted pilot",
      status:
        provider.provider === "openai"
          ? process.env.OPENAI_API_KEY
            ? "configured"
            : "missing"
          : "optional"
    }),
    envItem({
      category: "OpenAI",
      example: "gpt-4o-mini",
      name: "OPENAI_MODEL",
      notes: "Optional OpenAI model override.",
      requiredFor: "OpenAI hosted pilot",
      status: provider.provider === "openai" ? "configured" : "optional"
    }),
    envItem({
      category: "Ollama",
      example: "http://localhost:11434",
      name: "OLLAMA_BASE_URL",
      notes:
        "For a Windows VM, install Ollama on the same VM or point to an approved internal Ollama host.",
      requiredFor: "Local model pilot",
      status:
        provider.provider === "ollama"
          ? process.env.OLLAMA_BASE_URL
            ? "configured"
            : "missing"
          : "optional"
    }),
    envItem({
      category: "Ollama",
      example: "llama3.1",
      name: "OLLAMA_MODEL",
      notes: "Model must be pulled and available to Ollama before testing.",
      requiredFor: "Local model pilot",
      status: provider.provider === "ollama" ? "configured" : "optional"
    }),
    envItem({
      category: "Rate Limits",
      example: "12",
      name: "CHAT_RATE_LIMIT_PER_MINUTE",
      notes: "In-memory limit suitable for a small pilot.",
      requiredFor: "Pilot API protection",
      status: "configured"
    }),
    envItem({
      category: "Rate Limits",
      example: "30",
      name: "FEEDBACK_RATE_LIMIT_PER_MINUTE",
      notes: "Controls feedback submissions during pilot sessions.",
      requiredFor: "Pilot API protection",
      status: "configured"
    }),
    envItem({
      category: "Rate Limits",
      example: "60",
      name: "LAUNCH_AUDIT_RATE_LIMIT_PER_MINUTE",
      notes: "Controls Moodle launch audit telemetry writes.",
      requiredFor: "Pilot API protection",
      status: "configured"
    })
  ];
}

export async function buildPilotExportCenter() {
  const [cleanup, moodleConfig, simulator] = await Promise.all([
    buildPilotDataCleanupPreview(),
    buildMoodlePilotConfigPack(),
    buildMoodleLaunchSimulator()
  ]);

  return {
    cleanup,
    generatedAt: new Date().toISOString(),
    groups: [
      {
        title: "Executive and decision artifacts",
        items: [
          {
            description: "Sponsor-ready all-in-one HTML bundle.",
            href: "/api/admin/pilot-export-bundle.html",
            label: "Pilot Export Bundle HTML"
          },
          {
            description: "Decision summary, risks, evidence, and ownership.",
            href: "/api/admin/pilot-decision-packet.html",
            label: "Pilot Decision Packet HTML"
          },
          {
            description: "Evidence dashboard source export.",
            href: "/api/admin/pilot-evidence.md",
            label: "Pilot Evidence Markdown"
          },
          {
            description: "Project-team sign-off export.",
            href: "/api/admin/pilot-signoff.md",
            label: "Pilot Sign-off Markdown"
          }
        ]
      },
      {
        title: "Operations and support artifacts",
        items: [
          {
            description: "Support queue and routing summary.",
            href: "/api/admin/support-triage.html",
            label: "Support Triage HTML"
          },
          {
            description: "Pilot analytics source export.",
            href: "/api/admin/pilot-analytics.md",
            label: "Pilot Analytics Markdown"
          },
          {
            description: "Operational runbook source export.",
            href: "/api/admin/pilot-operations-runbook.md",
            label: "Pilot Operations Runbook"
          },
          {
            description: "Cleanup preview and reset guidance.",
            href: cleanup.exportPath,
            label: "Pilot Data Cleanup"
          }
        ]
      },
      {
        title: "Moodle and hosting artifacts",
        items: [
          {
            description: "Moodle embed, block, and fallback snippets.",
            href: "/moodle-copy-center",
            label: "Moodle Admin Copy Center"
          },
          {
            description: "Moodle security hardening report.",
            href: "/api/admin/moodle-security-hardening.html",
            label: "Moodle Security HTML"
          },
          {
            description: "Hosted readiness report for IT review.",
            href: "/api/admin/hosted-deployment-pack.html",
            label: "Hosted Deployment HTML"
          },
          {
            description: "Windows VM hosting runbook.",
            href: "/api/admin/windows-hosting-runbook.html",
            label: "Windows Hosting Runbook HTML"
          }
        ]
      },
      {
        title: "Moodle launch rehearsals",
        items: simulator.scenarioPreviews.map((scenario) => ({
          description: `${scenario.role} / ${scenario.launchSource} / ${scenario.moodlePlacement}`,
          href: scenario.previewUrl,
          label: scenario.title
        }))
      }
    ],
    moodleConfig
  };
}

export async function renderWindowsHostingRunbookHtml() {
  const [readiness, moodleConfig] = await Promise.all([
    getDeploymentReadiness(),
    buildMoodlePilotConfigPack()
  ]);
  const envItems = buildEnvironmentItems();

  return renderHtmlReport({
    generatedAt: new Date().toISOString(),
    lede:
      "A Windows VM handoff runbook for hosting the FYEC100 AI Support Assistant as a controlled Moodle iframe pilot.",
    title: "FYEC100 Windows VM Hosting Runbook",
    sections: [
      {
        id: "overview",
        title: "Windows VM Hosting Overview",
        body: [
          callout(
            "Recommended pilot pattern",
            "Run the Next.js app on the Windows VM behind IIS ARR, Nginx for Windows, or an approved reverse proxy that terminates HTTPS and forwards to Node.js on localhost:4100.",
            "watch"
          ),
          `<div class="metric-grid">
            ${metric("Readiness Pass", readiness.summary.pass, "checks")}
            ${metric("Warnings", readiness.summary.warn, "checks")}
            ${metric("Failures", readiness.summary.fail, "checks")}
            ${metric("Moodle Origin", moodleConfig.moodleOrigin ?? "Not set", "frame allowlist")}
          </div>`
        ].join("")
      },
      {
        id: "install",
        title: "Install Steps",
        body: list([
          "Provision a Windows Server VM with approved patching, firewall, endpoint protection, and backup policies.",
          "Install Git and Node.js LTS on the VM.",
          "Clone the GitHub repository into an approved application directory, for example C:\\Apps\\FYEC100-AI-Support-Assistant.",
          "Run npm install.",
          "Create production environment variables in the service account or process manager configuration.",
          "Run npm run build after setting MOODLE_ORIGIN.",
          "Start the app with npm run start:pilot or a Windows service wrapper such as NSSM or PM2."
        ])
      },
      {
        id: "commands",
        title: "Build And Start Commands",
        body: codeBlock(
          [
            "git clone https://github.com/ZeroZenx/FYEC100-AI-Support-Assistant.git",
            "cd FYEC100-AI-Support-Assistant",
            "npm install",
            "npm run build",
            "set PORT=4100",
            "npm run start:pilot"
          ].join("\n")
        )
      },
      {
        id: "environment",
        title: "Environment Variables",
        body: table(
          ["Variable", "Status", "Required For", "Example", "Notes"],
          envItems.map((item) => [
            item.name,
            item.status,
            item.requiredFor,
            item.example,
            item.notes
          ])
        )
      },
      {
        id: "proxy",
        title: "HTTPS And Reverse Proxy",
        body: list([
          "Expose only HTTPS to Moodle and users.",
          "Keep Node.js bound to localhost or a private VM interface.",
          "Forward the public HTTPS host to http://127.0.0.1:4100.",
          "Confirm the public URL is set as NEXT_PUBLIC_APP_BASE_URL.",
          "Confirm MOODLE_ORIGIN is the approved Moodle HTTPS origin.",
          "Rebuild after changing MOODLE_ORIGIN because Next.js headers are build-time configuration."
        ])
      },
      {
        id: "operations",
        title: "Logs, Backups, And Retention",
        body: list([
          "Capture process logs through the selected Windows service manager.",
          "Back up data/fyec100-knowledge-base.md and governance JSON files before content updates.",
          "Pilot telemetry files are local JSONL files and should be exported before cleanup.",
          "Do not treat local JSONL telemetry as a production student record store.",
          "Define retention, access, and deletion rules before live production use."
        ])
      },
      {
        id: "rollback",
        title: "Rollback",
        body: list([
          "Keep the last known good Git commit hash and build artifact notes.",
          "Stop the Windows service before rollback.",
          "Checkout the previous approved commit.",
          "Run npm install only if package files changed.",
          "Run npm run build and restart the service.",
          "Run the smoke test against the hosted URL before reopening Moodle access."
        ])
      },
      {
        id: "verification",
        title: "Verification",
        body: `<div class="record-grid">${readiness.checks
          .map((check) =>
            recordCard({
              label: check.label,
              meta: "Deployment readiness",
              status: check.status,
              text: check.message
            })
          )
          .join("")}</div>`
      }
    ]
  });
}

function envItem(item: HandoffEnvItem) {
  return item;
}

function isLocalUrl(value: string) {
  return /(localhost|127\.0\.0\.1|0\.0\.0\.0)/i.test(value);
}
