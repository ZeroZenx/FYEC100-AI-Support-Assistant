import {
  type EscalationCategory,
  type PilotFeedbackRecord,
  readPilotFeedbackRecords,
  readPilotFeedbackSummary
} from "@/lib/pilotFeedback";
import {
  callout,
  metric,
  recordCard,
  renderHtmlReport,
  table
} from "@/lib/htmlReport";
import { getSupportPlaybook } from "@/lib/supportPlaybook";

type TriageStatus = "clear" | "monitor" | "review";

type TriageQueueItem = {
  ageLabel: string;
  category: EscalationCategory;
  mode: PilotFeedbackRecord["mode"];
  owner: string;
  priority: "low" | "medium" | "high";
  question: string;
  reason: string;
  recommendedAction: string;
  timestamp: string;
};

type TriageOwnerSummary = {
  count: number;
  owner: string;
  priority: "low" | "medium" | "high";
};

type TriageSignal = {
  label: string;
  owner: string;
  status: TriageStatus;
  text: string;
};

const priorityByCategory: Record<EscalationCategory, "low" | "medium" | "high"> = {
  "academic-integrity": "high",
  "knowledge-base-update": "medium",
  "lecturer-follow-up": "high",
  "lms-administrator": "high",
  "technical-provider-issue": "high",
  none: "low"
};

const actionByCategory: Record<EscalationCategory, string> = {
  "academic-integrity":
    "Lecturer should review the student-facing guidance and reinforce responsible AI use before wider pilot expansion.",
  "knowledge-base-update":
    "Developer and lecturer reviewer should confirm whether the FYEC100 knowledge base needs an approved update.",
  "lecturer-follow-up":
    "Lecturer should review the question and provide official guidance where course expectations or assignments are unclear.",
  "lms-administrator":
    "LMS administrator should check Moodle course shell visibility, navigation, access, and embed behavior.",
  "technical-provider-issue":
    "Technical lead or system administrator should run provider, hosting, and Moodle readiness checks.",
  none: "No immediate escalation is required. Keep the item visible for pilot review."
};

export async function buildSupportTriage() {
  const [feedbackSummary, records] = await Promise.all([
    readPilotFeedbackSummary(),
    readPilotFeedbackRecords()
  ]);
  const playbook = getSupportPlaybook();
  const queue = records
    .filter((record) => (record.escalationCategory ?? "none") !== "none")
    .slice(-12)
    .reverse()
    .map(toQueueItem);
  const ownerSummary = buildOwnerSummary(queue);
  const highPriority = queue.filter((item) => item.priority === "high").length;
  const mediumPriority = queue.filter((item) => item.priority === "medium").length;
  const status: TriageStatus =
    highPriority > 0 ? "review" : mediumPriority > 0 ? "monitor" : "clear";

  return {
    exportPath: "/api/admin/support-triage.md",
    generatedAt: new Date().toISOString(),
    ownerSummary,
    playbook: playbook.items,
    privacyNotice:
      "Support triage uses short pilot feedback excerpts only. Do not enter student IDs, grades, medical details, or other sensitive student records into the pilot feedback notes.",
    queue,
    signals: buildSignals({
      escalationCounts: feedbackSummary.escalationCounts,
      highPriority,
      queueLength: queue.length,
      totalFeedback: feedbackSummary.total
    }),
    status,
    statusMessage:
      queue.length > 0
        ? "Support triage has feedback items for staff review before wider pilot expansion."
        : "Support triage is ready, with no active feedback escalation queue.",
    summary: {
      activeQueue: queue.length,
      highPriority,
      mediumPriority,
      owners: ownerSummary.length,
      totalFeedback: feedbackSummary.total
    }
  };
}

export async function renderSupportTriageMarkdown() {
  const triage = await buildSupportTriage();

  return [
    "# FYEC100 Student Support Triage Pack",
    "",
    `Generated: ${new Date(triage.generatedAt).toLocaleString()}`,
    "",
    "## Summary",
    "",
    `- Status: ${triage.status}`,
    `- Total feedback records: ${triage.summary.totalFeedback}`,
    `- Active queue items: ${triage.summary.activeQueue}`,
    `- High priority items: ${triage.summary.highPriority}`,
    `- Medium priority items: ${triage.summary.mediumPriority}`,
    `- Owners with queued items: ${triage.summary.owners}`,
    "",
    "## Triage Signals",
    "",
    ...triage.signals.map(
      (signal) =>
        `- [${signal.status}] ${signal.label} (${signal.owner}): ${signal.text}`
    ),
    "",
    "## Owner Queue",
    "",
    ...formatOwnerSummary(triage.ownerSummary),
    "",
    "## Active Queue",
    "",
    ...formatQueue(triage.queue),
    "",
    "## Support Playbook",
    "",
    ...triage.playbook.map(
      (item) =>
        `- [${item.priority}] ${item.category} (${item.owner}): ${item.firstResponse}`
    ),
    "",
    "## Privacy Notice",
    "",
    triage.privacyNotice,
    ""
  ].join("\n");
}

export async function renderSupportTriageHtml() {
  const triage = await buildSupportTriage();

  return renderHtmlReport({
    generatedAt: triage.generatedAt,
    lede:
      "A readable support queue for routing FYEC100 pilot feedback to lecturer, LMS, IT, knowledge base, and academic integrity owners.",
    title: "FYEC100 Student Support Triage Pack",
    sections: [
      {
        id: "summary",
        title: "Summary",
        body: [
          callout("Current triage status", triage.statusMessage, triage.status),
          `<div class="metric-grid">
            ${metric("Feedback", triage.summary.totalFeedback, "total records")}
            ${metric("Active Queue", triage.summary.activeQueue, "items")}
            ${metric("High Priority", triage.summary.highPriority, "items")}
            ${metric("Medium Priority", triage.summary.mediumPriority, "items")}
            ${metric("Owners", triage.summary.owners, "with queued work")}
          </div>`
        ].join("")
      },
      {
        id: "signals",
        title: "Triage Signals",
        body: `<div class="record-grid">${triage.signals
          .map((signal) =>
            recordCard({
              label: signal.label,
              meta: signal.owner,
              status: signal.status,
              text: signal.text
            })
          )
          .join("")}</div>`
      },
      {
        id: "owners",
        title: "Owner Queue",
        body:
          triage.ownerSummary.length > 0
            ? table(
                ["Owner", "Priority", "Queued Items"],
                triage.ownerSummary.map((item) => [
                  item.owner,
                  item.priority,
                  item.count
                ])
              )
            : `<p class="muted">No owners currently have queued support items.</p>`
      },
      {
        id: "queue",
        title: "Active Queue",
        body:
          triage.queue.length > 0
            ? `<div class="record-grid">${triage.queue
                .map((item) =>
                  recordCard({
                    label: `${item.category} - ${item.ageLabel}`,
                    meta: `${item.owner} / ${item.mode}`,
                    status: item.priority,
                    text: `${item.question} Recommended action: ${item.recommendedAction}`
                  })
                )
                .join("")}</div>`
            : `<p class="muted">No active queue items.</p>`
      },
      {
        id: "playbook",
        title: "Support Playbook",
        body: `<div class="record-grid">${triage.playbook
          .map((item) =>
            recordCard({
              label: item.category,
              meta: item.owner,
              status: item.priority,
              text: item.firstResponse
            })
          )
          .join("")}</div>`
      },
      {
        id: "privacy",
        title: "Privacy Notice",
        body: callout("Privacy-light support records", triage.privacyNotice, "watch")
      }
    ]
  });
}

function toQueueItem(record: PilotFeedbackRecord): TriageQueueItem {
  const category = record.escalationCategory ?? "none";

  return {
    ageLabel: formatAge(record.timestamp),
    category,
    mode: record.mode,
    owner: record.escalationOwner ?? "Pilot review team",
    priority: priorityByCategory[category],
    question: record.studentQuestionExcerpt,
    reason: record.escalationReason ?? "No escalation reason recorded.",
    recommendedAction: actionByCategory[category],
    timestamp: record.timestamp
  };
}

function buildOwnerSummary(queue: TriageQueueItem[]): TriageOwnerSummary[] {
  const owners = new Map<string, TriageOwnerSummary>();

  for (const item of queue) {
    const current = owners.get(item.owner);

    if (!current) {
      owners.set(item.owner, {
        count: 1,
        owner: item.owner,
        priority: item.priority
      });
      continue;
    }

    current.count += 1;
    current.priority = highestPriority(current.priority, item.priority);
  }

  return Array.from(owners.values()).sort((a, b) => b.count - a.count);
}

function buildSignals({
  escalationCounts,
  highPriority,
  queueLength,
  totalFeedback
}: {
  escalationCounts: Record<EscalationCategory, number>;
  highPriority: number;
  queueLength: number;
  totalFeedback: number;
}): TriageSignal[] {
  return [
    {
      label: "Triage queue",
      owner: "Pilot review team",
      status: queueLength > 0 ? "review" : "clear",
      text:
        queueLength > 0
          ? `${queueLength} support item(s) are queued for staff review.`
          : "No active support queue items are present."
    },
    {
      label: "High-priority support",
      owner: "Project Lead",
      status: highPriority > 0 ? "review" : "clear",
      text:
        highPriority > 0
          ? `${highPriority} high-priority item(s) need owner follow-up.`
          : "No high-priority support items are currently queued."
    },
    {
      label: "Moodle or LMS issues",
      owner: "LMS Administrator",
      status: escalationCounts["lms-administrator"] > 0 ? "review" : "clear",
      text:
        escalationCounts["lms-administrator"] > 0
          ? "Moodle navigation, access, or embed feedback is present."
          : "No Moodle support feedback is currently queued."
    },
    {
      label: "Pilot feedback volume",
      owner: "Project Lead / LMS Administrator",
      status: totalFeedback > 0 ? "monitor" : "clear",
      text:
        totalFeedback > 0
          ? `${totalFeedback} feedback record(s) are available for triage review.`
          : "No pilot feedback has been captured yet."
    }
  ];
}

function highestPriority(
  current: "low" | "medium" | "high",
  next: "low" | "medium" | "high"
) {
  const weights = { high: 3, medium: 2, low: 1 };

  return weights[next] > weights[current] ? next : current;
}

function formatAge(timestamp: string) {
  const created = new Date(timestamp).getTime();

  if (Number.isNaN(created)) {
    return "Unknown age";
  }

  const minutes = Math.max(0, Math.round((Date.now() - created) / 60000));

  if (minutes < 60) {
    return `${minutes} minute(s) ago`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 48) {
    return `${hours} hour(s) ago`;
  }

  return `${Math.round(hours / 24)} day(s) ago`;
}

function formatOwnerSummary(items: TriageOwnerSummary[]) {
  if (items.length === 0) {
    return ["No owners currently have queued support items."];
  }

  return items.map(
    (item) => `- [${item.priority}] ${item.owner}: ${item.count} item(s)`
  );
}

function formatQueue(items: TriageQueueItem[]) {
  if (items.length === 0) {
    return ["No active queue items."];
  }

  return items.slice(0, 10).flatMap((item, index) => [
    `${index + 1}. [${item.priority}] ${item.category} - ${item.owner}`,
    `   - Age: ${item.ageLabel}`,
    `   - Mode: ${item.mode}`,
    `   - Question: ${item.question}`,
    `   - Reason: ${item.reason}`,
    `   - Recommended action: ${item.recommendedAction}`
  ]);
}
