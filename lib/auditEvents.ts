import { appendFile, readFile } from "fs/promises";
import path from "path";
import {
  callout,
  metric,
  recordCard,
  renderHtmlReport,
  table
} from "@/lib/htmlReport";

const AUDIT_PATH = path.join(process.cwd(), "data", "audit-events.jsonl");

export type AuditEventSeverity = "info" | "warning" | "critical";
export type AuditEventType =
  | "admin-action"
  | "configuration-check"
  | "kb-release"
  | "lti-launch"
  | "lti-validation-failure"
  | "provider-test"
  | "retention"
  | "support-routing";

export type AuditEvent = {
  actor: string;
  area: string;
  detail: string;
  eventType: AuditEventType;
  id: string;
  relatedId?: string;
  severity: AuditEventSeverity;
  source: string;
  timestamp: string;
};

export async function recordAuditEvent(input: Omit<AuditEvent, "id" | "timestamp">) {
  const event: AuditEvent = {
    ...input,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString()
  };

  await appendFile(AUDIT_PATH, `${JSON.stringify(event)}\n`, "utf8");
  return event;
}

export async function readAuditEvents() {
  try {
    const content = await readFile(AUDIT_PATH, "utf8");

    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => normalizeAuditEvent(JSON.parse(line) as AuditEvent))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }

    return seedAuditEvents();
  }
}

export async function buildAuditLayer() {
  const events = await readAuditEvents();
  const byType = countBy(events, "eventType");
  const bySeverity = countBy(events, "severity");

  return {
    auditViewer: events.slice(0, 20).map(toLayerRecord),
    generatedAt: new Date().toISOString(),
    governanceExport: [
      "Audit events should be reviewed with retention status, support cases, knowledge base releases, and pilot decision records.",
      "Production deployment should replace local JSONL audit storage with an approved institutional store.",
      "Security and privacy events should be escalated to governance and the project sponsor.",
      "Export packs should be attached to pilot governance meetings and closeout evidence."
    ],
    metrics: {
      critical: bySeverity.critical ?? 0,
      events: events.length,
      ltiFailures: byType["lti-validation-failure"] ?? 0,
      ltiLaunches: byType["lti-launch"] ?? 0,
      supportRouting: byType["support-routing"] ?? 0,
      warnings: bySeverity.warning ?? 0
    },
    retentionControls: [
      {
        detail: "Local JSONL pilot files can be exported before cleanup.",
        label: "Export before delete",
        owner: "Project Lead / Technical Lead",
        status: "ready"
      },
      {
        detail: "Cleanup should preview records by source and category before deletion.",
        label: "Cleanup preview",
        owner: "Governance Reviewer",
        status: "review"
      },
      {
        detail: "Production retention period and deletion approval must be set by COSTAATT governance.",
        label: "Retention period",
        owner: "Project Sponsor / Governance",
        status: "review"
      },
      {
        detail: "Local file storage should not become the long-term production record store.",
        label: "Storage risk",
        owner: "Technical Lead",
        status: "warning"
      }
    ],
    storageAdapter: [
      {
        detail: "Current adapter uses local JSONL files for local development and pilot testing.",
        label: "Local file adapter",
        owner: "Developer",
        status: "ready"
      },
      {
        detail: "Production can later swap to PostgreSQL, SQL Server, SharePoint, or another approved COSTAATT store.",
        label: "Production adapter interface",
        owner: "Technical Lead / System Administrator",
        status: "review"
      },
      {
        detail: "Storage adapters should expose append, list, export, retention preview, and delete-by-policy operations.",
        label: "Adapter contract",
        owner: "Developer",
        status: "ready"
      }
    ]
  };
}

export async function renderGovernanceAuditExportHtml() {
  const layer = await buildAuditLayer();

  return renderHtmlReport({
    generatedAt: layer.generatedAt,
    lede:
      "A governance export pack combining audit event visibility, production storage decisions, retention controls, and review evidence for institutional oversight.",
    title: "FYEC100 Production Data and Audit Governance Pack",
    sections: [
      {
        id: "summary",
        title: "Audit Summary",
        body: `<div class="metric-grid">
          ${metric("Events", layer.metrics.events, "total")}
          ${metric("Warnings", layer.metrics.warnings, "review")}
          ${metric("Critical", layer.metrics.critical, "urgent")}
          ${metric("LTI Launches", layer.metrics.ltiLaunches, "trusted flow")}
          ${metric("LTI Failures", layer.metrics.ltiFailures, "validation")}
        </div>`
      },
      {
        id: "events",
        title: "Audit Viewer",
        body: cards(layer.auditViewer)
      },
      {
        id: "storage",
        title: "Production Storage Adapter",
        body: cards(layer.storageAdapter)
      },
      {
        id: "retention",
        title: "Data Retention Controls",
        body: cards(layer.retentionControls)
      },
      {
        id: "governance",
        title: "Governance Export Notes",
        body: table(
          ["Item", "Note"],
          layer.governanceExport.map((item, index) => [index + 1, item])
        )
      }
    ]
  });
}

function normalizeAuditEvent(event: AuditEvent): AuditEvent {
  return {
    actor: event.actor || "system",
    area: event.area || "general",
    detail: event.detail || "",
    eventType: event.eventType || "configuration-check",
    id: event.id || crypto.randomUUID(),
    relatedId: event.relatedId,
    severity: event.severity || "info",
    source: event.source || "local",
    timestamp: event.timestamp || new Date().toISOString()
  };
}

function seedAuditEvents(): AuditEvent[] {
  return [
    {
      actor: "system",
      area: "audit",
      detail: "Audit store is ready. Runtime events will be appended to data/audit-events.jsonl.",
      eventType: "configuration-check",
      id: "audit-seed-001",
      severity: "info",
      source: "local-seed",
      timestamp: new Date().toISOString()
    }
  ];
}

function countBy<T extends Record<string, string>>(items: T[], key: keyof T) {
  return items.reduce<Record<string, number>>((counts, item) => {
    counts[item[key]] = (counts[item[key]] ?? 0) + 1;
    return counts;
  }, {});
}

function toLayerRecord(event: AuditEvent) {
  return {
    detail: event.detail,
    label: `${event.eventType} / ${event.area}`,
    owner: `${event.actor} / ${event.source}`,
    status: event.severity
  };
}

function cards(
  items: Array<{ detail: string; label: string; owner: string; status: string }>
) {
  return `<div class="record-grid">${items
    .map((item) =>
      recordCard({
        label: item.label,
        meta: item.owner,
        status: item.status,
        text: item.detail
      })
    )
    .join("")}</div>`;
}
