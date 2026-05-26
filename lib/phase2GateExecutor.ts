import { getAdminAuthStatus } from "@/lib/adminAuth";
import { runEvaluationDataset } from "@/lib/evaluationAutomation";
import { runKnowledgeBaseRegression } from "@/lib/kbReleasePipeline";
import { updateLaunchChecklist, type LaunchChecklistStatus } from "@/lib/launchChecklist";
import { buildPhase2CompletionGate } from "@/lib/phase2Completion";
import { markAdminProtectionLocalOnly } from "@/lib/phase2GateOverrides";

export type Phase2GateExecutionAction =
  | "mark-admin-local-only"
  | "record-launch-step"
  | "refresh-gate"
  | "run-evaluation"
  | "run-kb-regression";

export async function executePhase2GateAction(input: {
  acceptedBy?: string;
  action?: string;
  launchStepId?: string;
  note?: string;
  owner?: string;
  status?: string;
}) {
  const action = normalizeAction(input.action);

  if (action === "run-evaluation") {
    const result = await runEvaluationDataset();

    return {
      action,
      gate: await buildPhase2CompletionGate(),
      message: `Evaluation completed: ${result.passed}/${result.total} passed.`,
      result
    };
  }

  if (action === "run-kb-regression") {
    const result = await runKnowledgeBaseRegression();

    return {
      action,
      gate: await buildPhase2CompletionGate(),
      message: `Knowledge base regression completed: ${result.summary.passed}/${result.summary.total} passed.`,
      result
    };
  }

  if (action === "record-launch-step") {
    const result = await updateLaunchChecklist({
      id: input.launchStepId || "health",
      note: input.note,
      owner: input.owner || "Project Lead",
      status: normalizeLaunchStatus(input.status)
    });

    return {
      action,
      gate: await buildPhase2CompletionGate(),
      message: "Launch checklist step recorded.",
      result
    };
  }

  if (action === "mark-admin-local-only") {
    const admin = getAdminAuthStatus();

    if (admin.configured) {
      return {
        action,
        gate: await buildPhase2CompletionGate(),
        message: "ADMIN_ACCESS_TOKEN is already configured. Local-only acknowledgement was not needed.",
        result: admin
      };
    }

    const result = await markAdminProtectionLocalOnly({
      acceptedBy: input.acceptedBy,
      note: input.note
    });

    return {
      action,
      gate: await buildPhase2CompletionGate(),
      message: "Local-only Phase 2 admin mode acknowledged. Configure ADMIN_ACCESS_TOKEN before hosted pilot.",
      result
    };
  }

  return {
    action,
    gate: await buildPhase2CompletionGate(),
    message: "Phase 2 gate refreshed."
  };
}

function normalizeAction(action?: string): Phase2GateExecutionAction {
  const actions: Phase2GateExecutionAction[] = [
    "mark-admin-local-only",
    "record-launch-step",
    "refresh-gate",
    "run-evaluation",
    "run-kb-regression"
  ];

  return actions.includes(action as Phase2GateExecutionAction)
    ? (action as Phase2GateExecutionAction)
    : "refresh-gate";
}

function normalizeLaunchStatus(status?: string): LaunchChecklistStatus {
  const statuses: LaunchChecklistStatus[] = [
    "blocked",
    "in-progress",
    "not-started",
    "passed",
    "skipped"
  ];

  return statuses.includes(status as LaunchChecklistStatus)
    ? (status as LaunchChecklistStatus)
    : "passed";
}
