import { getDeploymentReadiness } from "@/lib/deploymentReadiness";
import { getLtiReadiness } from "@/lib/ltiReadiness";
import { getMoodleBlockPluginStatus } from "@/lib/moodleBlockPlugin";
import {
  getDefaultMoodleContext,
  getMoodleContextQueryString
} from "@/lib/moodleContext";
import { getMoodleIntegrationDecision } from "@/lib/moodleIntegrationDecision";

type MoodleConfigStep = {
  label: string;
  owner: string;
  status: "ready" | "watch";
  text: string;
};

export async function buildMoodlePilotConfigPack() {
  const [deploymentReadiness, moodleBlockPlugin] = await Promise.all([
    getDeploymentReadiness(),
    getMoodleBlockPluginStatus()
  ]);
  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:4100";
  const moodleOrigin = process.env.MOODLE_ORIGIN ?? "";
  const sampleContext = {
    ...getDefaultMoodleContext(),
    launchSource: "iframe" as const
  };
  const sampleEmbedUrl = `${appBaseUrl}/embed?${getMoodleContextQueryString(
    sampleContext
  )}`;
  const integrationDecision = getMoodleIntegrationDecision();
  const ltiReadiness = getLtiReadiness();
  const steps: MoodleConfigStep[] = [
    {
      label: "Pilot course shell",
      owner: "LMS Administrator",
      status: "watch",
      text: "Create or select a controlled FYEC100 Moodle pilot course shell before adding the assistant."
    },
    {
      label: "Iframe embed",
      owner: "LMS Administrator",
      status: "ready",
      text: "Add the assistant using a Moodle page, label, HTML block, modal, drawer, or the provided block scaffold."
    },
    {
      label: "Frame security",
      owner: "Technical Lead / LMS Administrator",
      status: moodleOrigin ? "ready" : "watch",
      text: moodleOrigin
        ? `MOODLE_ORIGIN is configured as ${moodleOrigin}.`
        : "Set MOODLE_ORIGIN to the approved Moodle HTTPS origin before hosted iframe testing."
    },
    {
      label: "Moodle block review",
      owner: "LMS Administrator / Developer",
      status: moodleBlockPlugin.readyForLmsReview ? "ready" : "watch",
      text: moodleBlockPlugin.readyForLmsReview
        ? "Moodle block scaffold is ready for LMS administrator review."
        : "Review missing Moodle block scaffold files before block testing."
    },
    {
      label: "LTI planning",
      owner: "Technical Lead / System Administrator",
      status: ltiReadiness.summary.warnings === 0 ? "ready" : "watch",
      text: "Keep LTI 1.3 as the enterprise trust-boundary path if validated roles and course context are required."
    }
  ];

  return {
    appBaseUrl,
    embedUrl: `${appBaseUrl}/embed`,
    generatedAt: new Date().toISOString(),
    integrationDecision,
    ltiReadiness,
    moodleBlockPlugin,
    moodleOrigin: moodleOrigin || null,
    preflight: {
      deploymentWarnings: deploymentReadiness.summary.warn,
      deploymentFailures: deploymentReadiness.summary.fail,
      okForControlledPilot: deploymentReadiness.okForControlledPilot
    },
    sampleContext,
    sampleEmbedUrl,
    snippets: {
      fallbackLink: `<p><a href="${appBaseUrl}/embed" target="_blank" rel="noopener">Open the FYEC100 AI Academic Support Assistant</a></p>`,
      iframe: `<iframe src="${appBaseUrl}/embed" width="100%" height="760" style="border:0; width:100%; min-height:760px;" title="FYEC100 AI Academic Support Assistant"></iframe>`,
      iframeWithContext: `<iframe src="${sampleEmbedUrl}" width="100%" height="760" style="border:0; width:100%; min-height:760px;" title="FYEC100 AI Academic Support Assistant"></iframe>`,
      moodleHtmlBlock: `<div style="width:100%; min-height:760px;"><iframe src="${appBaseUrl}/embed" width="100%" height="760" style="border:0; width:100%; min-height:760px;" title="FYEC100 AI Academic Support Assistant"></iframe></div>`
    },
    steps,
    trustBoundary:
      "Iframe and Moodle block pilot context is not authenticated identity. Production should use approved Moodle-side validation or LTI 1.3 launch validation before trusting role, course, or user context."
  };
}

export async function renderMoodlePilotConfigMarkdown() {
  const pack = await buildMoodlePilotConfigPack();

  return [
    "# FYEC100 Moodle Pilot Configuration Pack",
    "",
    `Generated: ${new Date(pack.generatedAt).toLocaleString()}`,
    "",
    "## Pilot URLs",
    "",
    `- Embed URL: ${pack.embedUrl}`,
    `- Sample context URL: ${pack.sampleEmbedUrl}`,
    `- Moodle origin: ${pack.moodleOrigin ?? "Not configured"}`,
    "",
    "## Moodle Snippets",
    "",
    "### Iframe",
    "",
    "```html",
    pack.snippets.iframe,
    "```",
    "",
    "### Iframe With Pilot Context",
    "",
    "```html",
    pack.snippets.iframeWithContext,
    "```",
    "",
    "### Fallback Link",
    "",
    "```html",
    pack.snippets.fallbackLink,
    "```",
    "",
    "## Setup Steps",
    "",
    ...pack.steps.map(
      (step) => `- [${step.status}] ${step.owner} - ${step.label}: ${step.text}`
    ),
    "",
    "## Preflight",
    "",
    `- OK for controlled pilot: ${
      pack.preflight.okForControlledPilot ? "Yes" : "No"
    }`,
    `- Deployment failures: ${pack.preflight.deploymentFailures}`,
    `- Deployment warnings: ${pack.preflight.deploymentWarnings}`,
    "",
    "## Integration Path",
    "",
    `- Recommended option: ${pack.integrationDecision.recommendedOption.label}`,
    `- Summary: ${pack.integrationDecision.summary}`,
    "",
    "## Trust Boundary",
    "",
    pack.trustBoundary,
    ""
  ].join("\n");
}
