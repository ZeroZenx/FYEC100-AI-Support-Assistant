import { readFile, writeFile } from "fs/promises";
import path from "path";

const LAUNCH_CHECKLIST_PATH = path.join(process.cwd(), "data", "launch-checklist.json");

export type LaunchChecklistStatus = "blocked" | "in-progress" | "not-started" | "passed" | "skipped";

export type LaunchChecklistItem = {
  evidenceLink: string;
  id: string;
  label: string;
  note: string;
  owner: string;
  status: LaunchChecklistStatus;
  updatedAt: string;
};

export async function readLaunchChecklist() {
  try {
    const content = await readFile(LAUNCH_CHECKLIST_PATH, "utf8");
    const parsed = JSON.parse(content) as { decision?: string; items?: LaunchChecklistItem[]; timeline?: string[] };
    return {
      decision: parsed.decision || "not-recorded",
      items: Array.isArray(parsed.items) ? parsed.items.map(normalizeItem) : defaultItems(),
      timeline: Array.isArray(parsed.timeline) ? parsed.timeline : []
    };
  } catch {
    return { decision: "not-recorded", items: defaultItems(), timeline: [] };
  }
}

export async function updateLaunchChecklist(input: {
  decision?: string;
  evidenceLink?: string;
  id?: string;
  note?: string;
  owner?: string;
  status?: LaunchChecklistStatus;
}) {
  const current = await readLaunchChecklist();
  const timestamp = new Date().toISOString();
  const items = current.items.map((item) =>
    item.id === input.id
      ? normalizeItem({
          ...item,
          evidenceLink: input.evidenceLink ?? item.evidenceLink,
          note: input.note ?? item.note,
          owner: input.owner ?? item.owner,
          status: input.status ?? item.status,
          updatedAt: timestamp
        })
      : item
  );
  const event = input.id
    ? `${timestamp}: ${input.id} set to ${input.status ?? "updated"} by ${input.owner || "staff"}`
    : `${timestamp}: launch decision set to ${input.decision}`;
  const next = {
    decision: input.decision ?? current.decision,
    items,
    timeline: [event, ...current.timeline].slice(0, 100)
  };
  await writeFile(LAUNCH_CHECKLIST_PATH, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
}

function normalizeItem(item: LaunchChecklistItem): LaunchChecklistItem {
  return {
    evidenceLink: item.evidenceLink || "",
    id: item.id,
    label: item.label,
    note: item.note || "",
    owner: item.owner || "Project Lead",
    status: normalizeStatus(item.status),
    updatedAt: item.updatedAt || ""
  };
}

function normalizeStatus(status: string): LaunchChecklistStatus {
  return status === "blocked" || status === "in-progress" || status === "passed" || status === "skipped"
    ? status
    : "not-started";
}

function defaultItems(): LaunchChecklistItem[] {
  return [
    ["health", "Confirm app health", "System Administrator"],
    ["moodle-placement", "Enable Moodle placement", "LMS Administrator"],
    ["embed-test", "Verify iframe or LTI launch", "LMS Administrator / Developer"],
    ["communications", "Send launch notices", "Project Lead"],
    ["support-monitoring", "Monitor support channels", "Project Lead"],
    ["smoke", "Run launch smoke test", "Developer"],
    ["decision", "Log launch decision", "Project Sponsor / Project Lead"]
  ].map(([id, label, owner]) => ({
    evidenceLink: "",
    id,
    label,
    note: "",
    owner,
    status: "not-started",
    updatedAt: ""
  }));
}
