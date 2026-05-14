import { stat } from "fs/promises";
import path from "path";
import { getAdminAuthStatus } from "@/lib/adminAuth";
import { getAdminActionRegister } from "@/lib/adminActions";
import { getDeploymentReadiness } from "@/lib/deploymentReadiness";
import { getProviderStatus } from "@/lib/aiProvider";
import { getHealthStatus } from "@/lib/health";
import { getKnowledgeBaseMetadata } from "@/lib/knowledgeBase";
import { getKnowledgeBaseReviewStatus } from "@/lib/knowledgeBaseReview";
import { readLaunchAuditSummary } from "@/lib/launchAudit";
import { getLtiReadiness } from "@/lib/ltiReadiness";
import { getMoodleIntegrationDecision } from "@/lib/moodleIntegrationDecision";
import { getMoodleBlockPluginStatus } from "@/lib/moodleBlockPlugin";
import {
  getDefaultMoodleContext,
  getMoodleContextQueryString
} from "@/lib/moodleContext";
import { buildPilotReport } from "@/lib/pilotReport";
import { readPilotFeedbackSummary } from "@/lib/pilotFeedback";
import { readPilotSessionSummary } from "@/lib/pilotSessions";
import { getSupportPlaybook } from "@/lib/supportPlaybook";
import { buildPilotEvidenceDashboard } from "@/lib/pilotEvidence";
import { buildPilotMeetingPack } from "@/lib/pilotMeetingPack";
import { getPilotSignoffStatus } from "@/lib/pilotSignoff";
import { buildMoodlePilotConfigPack } from "@/lib/moodlePilotConfig";

const KNOWLEDGE_BASE_PATH = path.join(process.cwd(), "data", "fyec100-knowledge-base.md");

export type DeploymentChecklistItem = {
  label: string;
  status: "complete" | "in-progress" | "pending";
  note: string;
};

export async function getEnterpriseStatus() {
  const provider = (process.env.AI_PROVIDER ?? "openai").toLowerCase();
  const knowledgeBaseStats = await stat(KNOWLEDGE_BASE_PATH);
  const knowledgeBaseMetadata = await getKnowledgeBaseMetadata();
  const knowledgeBaseReview = await getKnowledgeBaseReviewStatus();
  const feedback = await readPilotFeedbackSummary();
  const launchAudit = await readLaunchAuditSummary();
  const integrationDecision = getMoodleIntegrationDecision();
  const ltiReadiness = getLtiReadiness();
  const moodleBlockPlugin = await getMoodleBlockPluginStatus();
  const pilotSessions = await readPilotSessionSummary();
  const pilotReport = await buildPilotReport();
  const pilotEvidence = await buildPilotEvidenceDashboard();
  const pilotSignoff = await getPilotSignoffStatus();
  const pilotMeetingPack = await buildPilotMeetingPack();
  const moodlePilotConfig = await buildMoodlePilotConfigPack();
  const adminActions = await getAdminActionRegister();
  const supportPlaybook = getSupportPlaybook();
  const deploymentReadiness = await getDeploymentReadiness();
  const health = await getHealthStatus();
  const adminAuth = getAdminAuthStatus();
  const providerStatus = getProviderStatus();
  const embedBaseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:4100";
  const moodleOrigin = process.env.MOODLE_ORIGIN ?? "";
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
      label: "Moodle integration decision",
      status: "in-progress",
      note: "Admin view now compares iframe, Moodle block, and LTI 1.3 paths for the Phase 2 integration decision."
    },
    {
      label: "Moodle block plugin scaffold",
      status: moodleBlockPlugin.readyForLmsReview ? "complete" : "in-progress",
      note: "Starter Moodle block plugin files are available under moodle/block_fyec100assistant for LMS administrator review."
    },
    {
      label: "LTI 1.3 readiness scaffold",
      status: ltiReadiness.summary.warnings === 0 ? "complete" : "in-progress",
      note: "Admin view tracks required Moodle platform values, tool endpoint URLs, and remaining LTI launch validation work."
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
      label: "Pilot evidence dashboard",
      status: pilotEvidence.goNoGo.status === "go" ? "complete" : "in-progress",
      note: "Admin view now aggregates readiness, launch audit, feedback, knowledge base review, and integration signals for go/no-go discussion."
    },
    {
      label: "Pilot sign-off pack",
      status: pilotSignoff.approvedForControlledPilot
        ? "complete"
        : "in-progress",
      note: "Admin view now tracks project-team approval owners and exports a Markdown sign-off pack for controlled pilot review."
    },
    {
      label: "Pilot meeting pack",
      status: "complete",
      note: "Admin view now exports one consolidated sponsor/project-team meeting brief for pilot review."
    },
    {
      label: "Moodle pilot configuration pack",
      status: "complete",
      note: "Admin view now provides LMS-ready Moodle embed snippets, setup steps, and trust-boundary guidance."
    },
    {
      label: "Admin action register",
      status: adminActions.summary.blocked > 0 ? "in-progress" : "complete",
      note: "Admin view now tracks pilot follow-up actions by owner, priority, status, source, and due date."
    },
    {
      label: "Pilot session planner",
      status: pilotSessions.total > 0 ? "complete" : "in-progress",
      note: "Admin view reads planned pilot sessions from data/pilot-sessions.json for pre-checks, success criteria, and post-session review."
    },
    {
      label: "Moodle launch audit",
      status: "complete",
      note: "Embedded Moodle launches are captured as privacy-light JSONL diagnostics for pilot readiness review."
    },
    {
      label: "Support escalation playbook",
      status: "complete",
      note: "Admin view maps common pilot issues to lecturer, LMS, knowledge base, technical, and academic integrity owners."
    },
    {
      label: "Deployment readiness",
      status: deploymentReadiness.okForControlledPilot ? "complete" : "in-progress",
      note: "Deployment readiness checks validate hosted URL, HTTPS, provider config, storage, rate limits, and admin exposure warnings."
    },
    {
      label: "Admin protection scaffold",
      status: adminAuth.configured ? "complete" : "in-progress",
      note: adminAuth.configured
        ? "Pilot admin token gate is configured for /admin and admin API routes."
        : "Set ADMIN_ACCESS_TOKEN before hosted pilot use."
    },
    {
      label: "Knowledge base file",
      status: knowledgeBaseReview.readyForPilot ? "complete" : "in-progress",
      note: knowledgeBaseReview.readyForPilot
        ? "FYEC100 content review is approved for controlled pilot use."
        : "FYEC100 content is loaded from Markdown and needs lecturer/content-owner review before hosted pilot."
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
    adminAuth,
    embedUrl: `${embedBaseUrl}/embed`,
    embedSnippets: {
      iframe: `<iframe src="${embedBaseUrl}/embed" width="100%" height="760" style="border:0; width:100%; min-height:760px;" title="FYEC100 AI Academic Support Assistant"></iframe>`,
      iframeWithContext: `<iframe src="${sampleMoodleEmbedUrl}" width="100%" height="760" style="border:0; width:100%; min-height:760px;" title="FYEC100 AI Academic Support Assistant"></iframe>`,
      link: `<p><a href="${embedBaseUrl}/embed" target="_blank" rel="noopener">Open the FYEC100 AI Academic Support Assistant</a></p>`,
      moodleHtmlBlock: `<div style="width:100%; min-height:760px;"><iframe src="${embedBaseUrl}/embed" width="100%" height="760" style="border:0; width:100%; min-height:760px;" title="FYEC100 AI Academic Support Assistant"></iframe></div>`
    },
    moodleOrigin: moodleOrigin || null,
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
      ...knowledgeBaseMetadata,
      review: knowledgeBaseReview,
      path: "data/fyec100-knowledge-base.md",
      lastUpdated: knowledgeBaseStats.mtime.toISOString(),
      sizeBytes: knowledgeBaseStats.size
    },
    feedback,
    adminActions,
    integrationDecision,
    ltiReadiness,
    moodleBlockPlugin,
    launchAudit,
    pilotSessions,
    deploymentReadiness,
    pilotEvidence,
    pilotMeetingPack,
    pilotSignoff,
    moodlePilotConfig,
    pilotReport,
    supportPlaybook,
    health,
    checklist
  };
}
