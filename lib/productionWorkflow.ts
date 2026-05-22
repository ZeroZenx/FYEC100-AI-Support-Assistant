import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { renderHtmlReport, table } from "@/lib/htmlReport";

const WORKFLOW_DIR = path.join(process.cwd(), "data", "production-workflows");

export type ProductionWorkflowId =
  | "enterprise-rollout-blueprint"
  | "governed-production-backlog"
  | "implementation-sprint-planner"
  | "maintenance-scheduler"
  | "production-deployment-run"
  | "readiness-review-board"
  | "release-candidate-builder"
  | "scale-decision-approval";

export type ProductionWorkflowItem = {
  acceptanceCriteria: string[];
  category: string;
  decision: "approved" | "blocked" | "deferred" | "draft" | "in-progress" | "ready" | "rejected";
  dependencies: string[];
  evidenceLink: string;
  id: string;
  owner: string;
  priority: "high" | "low" | "medium";
  risk: string;
  title: string;
  updatedAt: string;
};

export type ProductionWorkflow = {
  description: string;
  generatedAt: string;
  id: ProductionWorkflowId;
  items: ProductionWorkflowItem[];
  nextAction: string;
  owner: string;
  phase: string;
  title: string;
};

export const productionWorkflowIds: ProductionWorkflowId[] = [
  "scale-decision-approval",
  "enterprise-rollout-blueprint",
  "governed-production-backlog",
  "readiness-review-board",
  "implementation-sprint-planner",
  "release-candidate-builder",
  "production-deployment-run",
  "maintenance-scheduler"
];

export async function readProductionWorkflow(id: ProductionWorkflowId) {
  const defaults = defaultWorkflow(id);
  try {
    const content = await readFile(workflowPath(id), "utf8");
    const parsed = JSON.parse(content) as Partial<ProductionWorkflow>;
    return normalizeWorkflow({ ...defaults, ...parsed, id });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return defaults;
  }
}

export async function updateProductionWorkflowItem(
  id: ProductionWorkflowId,
  input: {
    decision?: ProductionWorkflowItem["decision"];
    evidenceLink?: string;
    itemId: string;
    owner?: string;
  }
) {
  const workflow = await readProductionWorkflow(id);
  const items = workflow.items.map((item) =>
    item.id === input.itemId
      ? {
          ...item,
          decision: input.decision ?? item.decision,
          evidenceLink: input.evidenceLink ?? item.evidenceLink,
          owner: input.owner ?? item.owner,
          updatedAt: new Date().toISOString()
        }
      : item
  );
  const next = normalizeWorkflow({ ...workflow, generatedAt: new Date().toISOString(), items });
  await mkdir(WORKFLOW_DIR, { recursive: true });
  await writeFile(workflowPath(id), `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
}

export async function readAllProductionWorkflows() {
  const workflows = await Promise.all(productionWorkflowIds.map(readProductionWorkflow));

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      approved: workflows.flatMap((workflow) => workflow.items).filter((item) => item.decision === "approved").length,
      blocked: workflows.flatMap((workflow) => workflow.items).filter((item) => item.decision === "blocked").length,
      workflows: workflows.length,
      workItems: workflows.reduce((sum, workflow) => sum + workflow.items.length, 0)
    },
    workflows
  };
}

export async function renderProductionWorkflowHtml(id: ProductionWorkflowId) {
  const workflow = await readProductionWorkflow(id);

  return renderHtmlReport({
    generatedAt: workflow.generatedAt,
    lede: workflow.description,
    sections: [
      {
        body: [
          `<p><strong>Phase:</strong> ${workflow.phase}</p>`,
          `<p><strong>Owner:</strong> ${workflow.owner}</p>`,
          `<p><strong>Next action:</strong> ${workflow.nextAction}</p>`
        ].join(""),
        id: "summary",
        title: "Summary"
      },
      {
        body: table(
          ["ID", "Item", "Owner", "Priority", "Decision", "Risk"],
          workflow.items.map((item) => [
            item.id,
            item.title,
            item.owner,
            item.priority,
            item.decision,
            item.risk
          ])
        ),
        id: "items",
        title: "Workflow Items"
      }
    ],
    title: workflow.title
  });
}

export function isProductionWorkflowId(value: string): value is ProductionWorkflowId {
  return productionWorkflowIds.includes(value as ProductionWorkflowId);
}

function workflowPath(id: ProductionWorkflowId) {
  return path.join(WORKFLOW_DIR, `${id}.json`);
}

function normalizeWorkflow(input: ProductionWorkflow): ProductionWorkflow {
  return {
    description: input.description,
    generatedAt: input.generatedAt || new Date().toISOString(),
    id: input.id,
    items: input.items.map(normalizeItem),
    nextAction: input.nextAction,
    owner: input.owner,
    phase: input.phase,
    title: input.title
  };
}

function normalizeItem(item: ProductionWorkflowItem): ProductionWorkflowItem {
  return {
    acceptanceCriteria: Array.isArray(item.acceptanceCriteria) ? item.acceptanceCriteria : [],
    category: item.category || "Production",
    decision: normalizeDecision(item.decision),
    dependencies: Array.isArray(item.dependencies) ? item.dependencies : [],
    evidenceLink: item.evidenceLink || "",
    id: item.id,
    owner: item.owner || "Project Lead",
    priority: item.priority || "medium",
    risk: item.risk || "Risk not recorded.",
    title: item.title,
    updatedAt: item.updatedAt || ""
  };
}

function normalizeDecision(value: string): ProductionWorkflowItem["decision"] {
  const decisions: ProductionWorkflowItem["decision"][] = [
    "approved",
    "blocked",
    "deferred",
    "draft",
    "in-progress",
    "ready",
    "rejected"
  ];
  return decisions.includes(value as ProductionWorkflowItem["decision"])
    ? (value as ProductionWorkflowItem["decision"])
    : "draft";
}

function item(
  id: string,
  title: string,
  category: string,
  owner: string,
  priority: ProductionWorkflowItem["priority"],
  risk: string,
  acceptanceCriteria: string[],
  dependencies: string[] = []
): ProductionWorkflowItem {
  return {
    acceptanceCriteria,
    category,
    decision: "draft",
    dependencies,
    evidenceLink: "",
    id,
    owner,
    priority,
    risk,
    title,
    updatedAt: ""
  };
}

function defaultWorkflow(id: ProductionWorkflowId): ProductionWorkflow {
  const generatedAt = new Date().toISOString();
  const workflows: Record<ProductionWorkflowId, ProductionWorkflow> = {
    "scale-decision-approval": {
      description:
        "Institutional decision workflow for continue, revise, expand, pause, or retire after reviewing pilot evidence.",
      generatedAt,
      id,
      items: [
        item("SCALE-01", "Evidence summary", "Evidence", "Project Lead", "high", "Decision may be made without full pilot evidence.", ["Usage, feedback, support, KB, evaluation, Moodle, privacy, and operations signals are summarized."]),
        item("SCALE-02", "Decision option comparison", "Decision", "Sponsor / Governance", "high", "Expansion risk is unclear.", ["Continue, revise, expand, pause, and retire options include benefits, risks, and remediation."]),
        item("SCALE-03", "Approval workflow", "Approval", "Project Sponsor", "high", "No formal authority captured.", ["Sponsor, project lead, lecturer, LMS admin, IT, and governance decision fields exist."]),
        item("SCALE-04", "Scale approval export", "Export", "Developer", "medium", "Decision evidence is hard to share.", ["HTML pack is available for meeting review."])
      ],
      nextAction: "Review latest pilot evidence and record a formal scale decision.",
      owner: "Project Sponsor / Project Lead",
      phase: "Scale Decision",
      title: "Scale Decision and Institutional Approval Workflow"
    },
    "enterprise-rollout-blueprint": {
      description:
        "Blueprint for turning the FYEC100 pilot into a managed COSTAATT academic AI support service.",
      generatedAt,
      id,
      items: [
        item("ROLL-01", "Service ownership model", "Service Model", "Project Sponsor", "high", "Long-term ownership remains unclear.", ["Platform, course content, Moodle, support, governance, and operations owners are named."]),
        item("ROLL-02", "Rollout waves", "Rollout", "Project Lead", "medium", "Expansion may happen too quickly.", ["FYEC100, second course, faculty pilots, and broader expansion waves are sequenced."]),
        item("ROLL-03", "Technical target architecture", "Architecture", "Technical Lead", "high", "Architecture decisions drift by course.", ["Moodle/LTI, auth, storage, monitoring, providers, and backup targets are documented."]),
        item("ROLL-04", "Training and communications plan", "Adoption", "LMS Administrator", "medium", "Students or staff may not understand responsible use.", ["Student, lecturer, LMS, IT, and sponsor communications are drafted."])
      ],
      nextAction: "Confirm the service model and rollout waves with leadership.",
      owner: "Project Sponsor / Technical Lead",
      phase: "Enterprise Rollout",
      title: "Enterprise Rollout Blueprint"
    },
    "governed-production-backlog": {
      description:
        "Structured production platform backlog with priorities, owners, risks, dependencies, acceptance criteria, and release grouping.",
      generatedAt,
      id,
      items: [
        item("BACKLOG-01", "Security and authorization backlog", "Security", "IT / Governance", "high", "Protected areas may remain too open for production.", ["Admin role policy, route protection, audit events, and session controls are listed."]),
        item("BACKLOG-02", "Moodle/LTI backlog", "Moodle", "LMS Administrator", "high", "Moodle test site may not validate enterprise launch behavior.", ["LTI launch, role mapping, course binding, and diagnostics are listed."]),
        item("BACKLOG-03", "Storage and retention backlog", "Storage", "System Administrator", "high", "Pilot records may remain local-only too long.", ["Production storage, migration, export, retention, and deletion items are listed."]),
        item("BACKLOG-04", "Accessibility and support backlog", "Student Support", "Project Lead", "medium", "Student experience issues may be missed.", ["Mobile, keyboard, support handoff, and accessibility items are listed."])
      ],
      nextAction: "Review backlog priority and dependencies before sprint planning.",
      owner: "Project Lead",
      phase: "Governed Backlog",
      title: "Governed Production Platform Backlog"
    },
    "readiness-review-board": {
      description:
        "Review board workspace for approving, deferring, rejecting, or requesting evidence for production backlog items.",
      generatedAt,
      id,
      items: [
        item("BOARD-01", "Review board agenda", "Meeting", "Project Lead", "medium", "Review meetings may lack structure.", ["Agenda includes risk, evidence, decisions, and action items."]),
        item("BOARD-02", "Backlog decision cards", "Decision", "Review Board", "high", "Items may be approved without rationale.", ["Each decision captures rationale, owner, evidence, and risk acceptance."]),
        item("BOARD-03", "Sign-off fields", "Approval", "Sponsor / Governance / IT", "high", "Production readiness lacks formal sign-off.", ["Sponsor, governance, and IT sign-off fields are available."]),
        item("BOARD-04", "Meeting export pack", "Export", "Developer", "medium", "Meeting evidence may not be retained.", ["HTML export summarizes decisions and actions."])
      ],
      nextAction: "Schedule first readiness review for must-have production backlog items.",
      owner: "Project Lead / Governance",
      phase: "Production Review",
      title: "Production Readiness Review Board Workspace"
    },
    "implementation-sprint-planner": {
      description:
        "Sprint planner for approved backlog items with phases, owners, acceptance criteria, dependencies, and verification.",
      generatedAt,
      id,
      items: [
        item("SPRINT-01", "Approved item intake", "Sprint", "Project Lead", "high", "Sprint may include unapproved work.", ["Only approved or ready backlog items enter sprint planning."]),
        item("SPRINT-02", "Owner and reviewer assignment", "Sprint", "Technical Lead", "medium", "Work may lack accountability.", ["Every sprint item has owner and reviewer fields."]),
        item("SPRINT-03", "Verification checklist", "Quality", "Developer", "high", "Built work may lack evidence.", ["Lint, build, smoke, evaluation, accessibility, and route checks are assigned as needed."]),
        item("SPRINT-04", "Sprint export pack", "Export", "Project Lead", "low", "Meeting updates may be manual.", ["Sprint status can be exported for project review."])
      ],
      nextAction: "Move approved review-board items into a release-focused sprint.",
      owner: "Project Lead / Developer",
      phase: "Sprint Planning",
      title: "Implementation Sprint Planner"
    },
    "release-candidate-builder": {
      description:
        "Release candidate builder that packages completed sprint work with evidence, approvals, rollback, and deployment target.",
      generatedAt,
      id,
      items: [
        item("RC-01", "Select completed sprint items", "Release", "Project Lead", "high", "Release scope may be unclear.", ["Completed sprint items are selected and frozen for release review."]),
        item("RC-02", "Attach test evidence", "Quality", "Developer", "high", "Release may deploy without verification evidence.", ["Lint, build, smoke, hardening, evaluation, and accessibility evidence are attached."]),
        item("RC-03", "Rollback and backup confirmation", "Operations", "System Administrator", "high", "Rollback may not be ready.", ["Rollback owner, backup path, and restore notes are confirmed."]),
        item("RC-04", "Ready-to-deploy gate", "Approval", "Sponsor / IT / LMS", "high", "Unapproved release may be deployed.", ["Project lead, IT, LMS, governance, and sponsor approvals are captured."])
      ],
      nextAction: "Create the next release candidate from completed verified work.",
      owner: "Project Lead / IT",
      phase: "Release Candidate",
      title: "Release Candidate Builder"
    },
    "production-deployment-run": {
      description:
        "Controlled deployment run workflow for taking an approved release candidate into a target environment with evidence capture.",
      generatedAt,
      id,
      items: [
        item("DEPLOY-01", "Pre-deploy checklist", "Deployment", "System Administrator", "high", "Deployment may start without backup or smoke readiness.", ["Backup, env vars, build, smoke, provider, Moodle/LTI, and rollback owner are confirmed."]),
        item("DEPLOY-02", "Deploy action checklist", "Deployment", "System Administrator", "high", "Manual deployment steps may be missed.", ["Pull/update, install, build, restart service, IIS/proxy, and Moodle verification steps are tracked."]),
        item("DEPLOY-03", "Post-deploy checks", "Verification", "Developer / LMS Admin", "high", "Release may appear deployed but fail key flows.", ["Health, chat, support handoff, admin, storage, LTI, and iframe checks pass."]),
        item("DEPLOY-04", "Deployment completion sign-off", "Approval", "Project Lead", "medium", "Deployment completion may not be recorded.", ["Evidence timeline, incidents, rollback decision, and completion sign-off are captured."])
      ],
      nextAction: "Use this runbook when deploying an approved release candidate.",
      owner: "System Administrator / Project Lead",
      phase: "Deployment Run",
      title: "Production Release Deployment Run"
    },
    "maintenance-scheduler": {
      description:
        "Operational maintenance scheduler for recurring KB, provider, Moodle, backup, support, accessibility, and governance reviews.",
      generatedAt,
      id,
      items: [
        item("MAINT-01", "Knowledge base review cadence", "Maintenance", "Lecturer", "high", "Course knowledge may become stale.", ["Review owner, frequency, next date, and evidence link are recorded."]),
        item("MAINT-02", "Provider and model review", "AI Governance", "Technical Lead / Governance", "medium", "Provider risk or cost may drift.", ["Provider approval, fallback, safety, and cost signals are reviewed."]),
        item("MAINT-03", "Moodle and backup check", "Operations", "System Administrator / LMS Admin", "high", "Moodle placement or backups may silently fail.", ["Moodle iframe/LTI and backup/restore checks are scheduled."]),
        item("MAINT-04", "Support and accessibility review", "Student Support", "Project Lead", "medium", "Support load or accessibility issues may persist.", ["Support queue, mobile, keyboard, contrast, and student help visibility are reviewed."])
      ],
      nextAction: "Set the first monthly maintenance review dates and owners.",
      owner: "Project Lead / Operations",
      phase: "Operational Maintenance",
      title: "Operational Maintenance Scheduler"
    }
  };

  return workflows[id];
}
