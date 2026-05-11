import { stat } from "fs/promises";
import path from "path";

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
  const embedBaseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:4100";

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
      label: "AI provider configuration",
      status: providerConfigured ? "complete" : "in-progress",
      note: providerConfigured
        ? `${providerLabel} is selected through environment configuration.`
        : "Set OpenAI or Ollama environment variables before pilot testing."
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
    provider,
    providerConfigured,
    providerLabel,
    knowledgeBase: {
      path: "data/fyec100-knowledge-base.md",
      lastUpdated: knowledgeBaseStats.mtime.toISOString(),
      sizeBytes: knowledgeBaseStats.size
    },
    checklist
  };
}
