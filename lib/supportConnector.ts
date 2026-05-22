import { appendFile } from "fs/promises";
import path from "path";
import { buildSupportCaseSummary } from "@/lib/serviceDeskCases";

const CONNECTOR_LOG_PATH = path.join(process.cwd(), "data", "support-connector-events.jsonl");

export type SupportConnectorType = "email" | "forms" | "local-only" | "sharepoint-list" | "teams";

export function getSupportConnectorStatus() {
  const connector = normalizeConnector(process.env.SUPPORT_CONNECTOR || "local-only");
  const configured = connector === "local-only" || Boolean(process.env.SUPPORT_CONNECTOR_TARGET);

  return {
    configured,
    connector,
    dataBoundary:
      "Send only course, category, urgency, owner, and a short safe summary. Never send passwords, student IDs, grades, medical/personal details, or private notes.",
    targetConfigured: Boolean(process.env.SUPPORT_CONNECTOR_TARGET),
    targetLabel: process.env.SUPPORT_CONNECTOR_TARGET ? "Configured in environment" : "Not configured"
  };
}

export async function testSupportConnector() {
  const status = getSupportConnectorStatus();
  const cases = await buildSupportCaseSummary();
  const event = {
    connector: status.connector,
    id: `CONN-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    ok: status.configured,
    queuedCases: cases.summary.open,
    timestamp: new Date().toISOString()
  };

  await appendFile(CONNECTOR_LOG_PATH, `${JSON.stringify(event)}\n`, "utf8");

  return {
    ...event,
    message: status.configured
      ? "Connector test completed in scaffold mode. No external message was sent."
      : "Connector target is missing."
  };
}

function normalizeConnector(value: string): SupportConnectorType {
  const connectors: SupportConnectorType[] = [
    "email",
    "forms",
    "local-only",
    "sharepoint-list",
    "teams"
  ];

  return connectors.includes(value as SupportConnectorType)
    ? (value as SupportConnectorType)
    : "local-only";
}
