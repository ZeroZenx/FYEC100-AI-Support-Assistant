import { stat } from "fs/promises";
import path from "path";
import { getAccessibilityUsabilityReview } from "@/lib/accessibilityUsabilityReview";
import { getAdminAuthStatus } from "@/lib/adminAuth";
import { getAdminActionRegister } from "@/lib/adminActions";
import { getDeploymentReadiness } from "@/lib/deploymentReadiness";
import { getProviderStatus } from "@/lib/aiProvider";
import { getHealthStatus } from "@/lib/health";
import { getKnowledgeBaseMetadata } from "@/lib/knowledgeBase";
import { getKnowledgeBaseApplyChecklist } from "@/lib/knowledgeBaseApplyChecklist";
import { getKnowledgeBaseChangeRequests } from "@/lib/knowledgeBaseChangeRequests";
import { getKnowledgeBaseDraftUpdates } from "@/lib/knowledgeBaseDraftUpdates";
import { getKnowledgeBaseReleases } from "@/lib/knowledgeBaseReleases";
import { getKnowledgeBaseReviewStatus } from "@/lib/knowledgeBaseReview";
import { readLaunchAuditSummary } from "@/lib/launchAudit";
import { getLtiReadiness } from "@/lib/ltiReadiness";
import { getMoodleIntegrationDecision } from "@/lib/moodleIntegrationDecision";
import { getMoodleBlockPluginStatus } from "@/lib/moodleBlockPlugin";
import { buildMoodleLaunchSimulator } from "@/lib/moodleLaunchSimulator";
import {
  getDefaultMoodleContext,
  getMoodleContextQueryString
} from "@/lib/moodleContext";
import { buildPilotReport } from "@/lib/pilotReport";
import { buildPilotAnalytics } from "@/lib/pilotAnalytics";
import { readPilotFeedbackSummary } from "@/lib/pilotFeedback";
import { readPilotSessionSummary } from "@/lib/pilotSessions";
import { getSupportPlaybook } from "@/lib/supportPlaybook";
import { buildPilotEvidenceDashboard } from "@/lib/pilotEvidence";
import { buildPilotMeetingPack } from "@/lib/pilotMeetingPack";
import { getPilotOperationsRunbook } from "@/lib/pilotOperationsRunbook";
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
  const knowledgeBaseApplyChecklist = await getKnowledgeBaseApplyChecklist();
  const knowledgeBaseChangeRequests = await getKnowledgeBaseChangeRequests();
  const knowledgeBaseDraftUpdates = await getKnowledgeBaseDraftUpdates();
  const knowledgeBaseReleases = await getKnowledgeBaseReleases();
  const knowledgeBaseReview = await getKnowledgeBaseReviewStatus();
  const feedback = await readPilotFeedbackSummary();
  const launchAudit = await readLaunchAuditSummary();
  const integrationDecision = getMoodleIntegrationDecision();
  const ltiReadiness = getLtiReadiness();
  const moodleBlockPlugin = await getMoodleBlockPluginStatus();
  const moodleLaunchSimulator = await buildMoodleLaunchSimulator();
  const pilotSessions = await readPilotSessionSummary();
  const pilotAnalytics = await buildPilotAnalytics();
  const pilotReport = await buildPilotReport();
  const pilotEvidence = await buildPilotEvidenceDashboard();
  const pilotSignoff = await getPilotSignoffStatus();
  const pilotMeetingPack = await buildPilotMeetingPack();
  const pilotOperationsRunbook = await getPilotOperationsRunbook();
  const moodlePilotConfig = await buildMoodlePilotConfigPack();
  const adminActions = await getAdminActionRegister();
  const accessibilityUsabilityReview = await getAccessibilityUsabilityReview();
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
      status:
        moodleLaunchSimulator.summary.watchChecks > 0 ? "in-progress" : "complete",
      note: "The embed route accepts course, role, and launch-source context as pilot query parameters. The admin launch simulator now generates safe preview URLs for Moodle rehearsal."
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
      label: "Pilot analytics summary",
      status: "complete",
      note: "Admin view now summarizes launch audit, feedback, sessions, escalation candidates, and privacy-light risk signals without a database."
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
      label: "Pilot operations runbook",
      status: pilotOperationsRunbook.readyForPilot ? "complete" : "in-progress",
      note: "Admin view now provides before, during, after, escalation, and stop-pilot procedures for controlled Moodle pilot operations."
    },
    {
      label: "Moodle pilot configuration pack",
      status: "complete",
      note: "Admin view now provides LMS-ready Moodle embed snippets, setup steps, and trust-boundary guidance."
    },
    {
      label: "Moodle pilot launch simulator",
      status:
        moodleLaunchSimulator.summary.readyScenarios > 0
          ? "complete"
          : "in-progress",
      note: "Admin view now provides role, course, launch-source, and placement preview URLs for rehearsing Moodle launches before live LMS testing."
    },
    {
      label: "Role-aware assistant behavior",
      status: "complete",
      note: "Embedded chat now adapts its intro, starter prompts, role guidance, and system prompt behavior for student, lecturer, LMS administrator, and general pilot launch contexts."
    },
    {
      label: "Admin action register",
      status: adminActions.summary.blocked > 0 ? "in-progress" : "complete",
      note: "Admin view now tracks pilot follow-up actions by owner, priority, status, source, and due date."
    },
    {
      label: "Accessibility and Moodle usability review",
      status: accessibilityUsabilityReview.readyForPilot
        ? "complete"
        : "in-progress",
      note: "Admin view now tracks keyboard, screen-reader, Moodle iframe, and student usability review checks before pilot go-live."
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
      label: "Knowledge base change requests",
      status:
        knowledgeBaseChangeRequests.summary.highPriorityPending > 0
          ? "in-progress"
          : "complete",
      note: "Admin view now tracks proposed FYEC100 knowledge base changes before approved content updates are made."
    },
    {
      label: "Knowledge base apply checklist",
      status: knowledgeBaseApplyChecklist.readyToApply
        ? "complete"
        : "in-progress",
      note: "Admin view now tracks the manual review, edit, guardrail, smoke test, and release-note steps for applying approved draft wording to the live knowledge base."
    },
    {
      label: "Knowledge base draft updates",
      status:
        knowledgeBaseDraftUpdates.summary.highPriorityOpen > 0
          ? "in-progress"
          : "complete",
      note: "Admin view now stages proposed FYEC100 knowledge base wording before approved manual edits are applied to the live Markdown file."
    },
    {
      label: "Knowledge base release notes",
      status: knowledgeBaseReleases.summary.released > 0 ? "complete" : "in-progress",
      note: "Admin view now records knowledge base release snapshots, change request references, approval details, and known limitations."
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
      applyChecklist: knowledgeBaseApplyChecklist,
      changeRequests: knowledgeBaseChangeRequests,
      draftUpdates: knowledgeBaseDraftUpdates,
      releases: knowledgeBaseReleases,
      review: knowledgeBaseReview,
      path: "data/fyec100-knowledge-base.md",
      lastUpdated: knowledgeBaseStats.mtime.toISOString(),
      sizeBytes: knowledgeBaseStats.size
    },
    feedback,
    adminActions,
    accessibilityUsabilityReview,
    integrationDecision,
    ltiReadiness,
    moodleBlockPlugin,
    moodleLaunchSimulator,
    launchAudit,
    pilotSessions,
    pilotAnalytics,
    deploymentReadiness,
    pilotEvidence,
    pilotMeetingPack,
    pilotOperationsRunbook,
    pilotSignoff,
    moodlePilotConfig,
    pilotReport,
    supportPlaybook,
    health,
    checklist
  };
}
