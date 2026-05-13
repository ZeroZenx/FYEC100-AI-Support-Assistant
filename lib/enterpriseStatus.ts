import { stat } from "fs/promises";
import path from "path";
import { getDeploymentReadiness } from "@/lib/deploymentReadiness";
import { getProviderStatus } from "@/lib/aiProvider";
import { getHealthStatus } from "@/lib/health";
import {
  getDefaultMoodleContext,
  getMoodleContextQueryString
} from "@/lib/moodleContext";
import { buildPilotReport } from "@/lib/pilotReport";
import { readPilotFeedbackSummary } from "@/lib/pilotFeedback";

const KNOWLEDGE_BASE_PATH = path.join(
  process.cwd(),
  "data",
  "fyec100-knowledge-base.md"
);

export type DeploymentChecklistItem = {
  label: string;
  status: "complete" | "in-progress" | "pending";
  note: string;
};

export async function getEnterpriseStatus() {
  const provider = (process.env.AI_PROVIDER ?? "openai").toLowerCase();
  const knowledgeBaseStats = await stat(KNOWLEDGE_BASE_PATH);
  const feedback = await readPilotFeedbackSummary();
  const pilotReport = await buildPilotReport();
  const deploymentReadiness = await getDeploymentReadiness();
  const health = await getHealthStatus();
  const providerStatus = getProviderStatus();
  const embedBaseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:4100";
  const sampleMoodleContext = getDefaultMoodleContext();
  const sampleMoodleQuery = getMoodleContextQueryString({
    ...sampleMoodleContext,
    launchSource: "iframe"
  });
  const sampleMoodleEmbedUrl = `${embedBaseUrl}/embed?${sampleMoodleQuery}`;

  const providerConfigured =
    provider === "ollama"
      ? Boolean(process.env.OLLAMA_BASE_URL || process.env.OLLAMA_MODEL)
      : Boolean(process.env.OPENAI_API_KEY);

  const providerLabel =
    provider === "ollama"
      ? `Ollama (${process.env.OLLAMA_MODEL ?? "llama3.1"})`
      : `OpenAI (${process.env.OPENAI_MODEL ?? "gpt-4o-mini"})`;

  const checklist: DeploymentChecklistItem[] = [
    {
      label: "Moodle embedded route",
      status: "complete",
      note: "The /embed route is available for iframe, modal, drawer, or LTI launch testing."
    },
    {
      label: "Moodle launch context",
      status: "in-progress",
      note: "The embed route accepts course, role, and launch-source context as pilot query parameters. Production should replace this with Moodle block or LTI trust."
    },
    {
      label: "AI provider configuration",
      status: providerConfigured ? "complete" : "in-progress",
      note: providerConfigured
        ? `${providerLabel} is selected through environment configuration.`
        : "Set OpenAI or Ollama environment variables before pilot testing."
    },
    {
      label: "API rate limiting",
      status: "complete",
      note: "Chat, feedback, and provider test APIs use configurable in-memory pilot limits."
    },
    {
      label: "Pilot review workflow",
      status: "complete",
      note: "Admin feedback review surfaces escalation categories, owners, and next-action guidance for controlled pilot oversight."
    },
    {
      label: "Pilot reporting",
      status: "complete",
      note: "Admin report endpoints provide JSON and Markdown summaries for project-team review meetings."
    },
    {
      label: "Deployment readiness",
      status: deploymentReadiness.okForControlledPilot ? "complete" : "in-progress",
      note: "Deployment readiness checks validate hosted URL, HTTPS, provider config, storage, rate limits, and admin exposure warnings."
    },
    {
      label: "Knowledge base file",
      status: "complete",
      note: "FYEC100 content is loaded from data/fyec100-knowledge-base.md."
    },
    {
      label: "Moodle pilot course",
      status: "pending",
      note: "Add the embed URL to a controlled FYEC100 Moodle test course."
    },
    {
      label: "Authentication and launch context",
      status: "pending",
      note: "Choose Moodle block plugin or LTI 1.3 before production deployment."
    },
    {
      label: "Privacy and support approval",
      status: "pending",
      note: "Confirm student notice, support escalation, logging, and governance procedures."
    }
  ];

  return {
    appBaseUrl: embedBaseUrl,
    embedUrl: `${embedBaseUrl}/embed`,
    embedSnippets: {
      iframe: `<iframe src="${embedBaseUrl}/embed" width="100%" height="760" style="border:0; width:100%; min-height:760px;" title="FYEC100 AI Academic Support Assistant"></iframe>`,
      iframeWithContext: `<iframe src="${sampleMoodleEmbedUrl}" width="100%" height="760" style="border:0; width:100%; min-height:760px;" title="FYEC100 AI Academic Support Assistant"></iframe>`,
      link: `<p><a href="${embedBaseUrl}/embed" target="_blank" rel="noopener">Open the FYEC100 AI Academic Support Assistant</a></p>`,
      moodleHtmlBlock: `<div style="width:100%; min-height:760px;"><iframe src="${embedBaseUrl}/embed" width="100%" height="760" style="border:0; width:100%; min-height:760px;" title="FYEC100 AI Academic Support Assistant"></iframe></div>`
    },
    launchContext: {
      acceptedFields: [
        "courseId",
        "courseShortName",
        "role",
        "launchSource"
      ],
      sample: {
        ...sampleMoodleContext,
        launchSource: "iframe"
      },
      sampleEmbedUrl: sampleMoodleEmbedUrl
    },
    provider,
    providerConfigured,
    providerLabel,
    providerStatus,
    knowledgeBase: {
      path: "data/fyec100-knowledge-base.md",
      lastUpdated: knowledgeBaseStats.mtime.toISOString(),
      sizeBytes: knowledgeBaseStats.size
    },
    feedback,
    deploymentReadiness,
    pilotReport,
    health,
    checklist
  };
}
