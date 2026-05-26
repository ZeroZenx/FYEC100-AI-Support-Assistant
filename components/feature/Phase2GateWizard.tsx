"use client";

import { useMemo, useState } from "react";
import {
  ActionPanel,
  FormField,
  MetricTile,
  PrimaryAction,
  SecondaryAction,
  StatusBadge
} from "@/components/ui/System";
import type { Phase2GateItem } from "@/lib/phase2Completion";

type Gate = {
  generatedAt: string;
  gateItems: Phase2GateItem[];
  metrics: {
    blocked: number;
    completion: string;
    needsReview: number;
    ready: number;
    total: number;
  };
  phase3Entry: string;
  summary: {
    blocked: number;
    complete: boolean;
    needsReview: number;
    ready: number;
    total: number;
  };
};

type WizardStepKey = "evaluation" | "launch" | "kb" | "admin";

type ExecuteResponse = {
  gate: Gate;
  message: string;
};

const steps: Array<{
  description: string;
  gateLabel: string;
  key: WizardStepKey;
  owner: string;
  title: string;
}> = [
  {
    description: "Run the approved FYEC100 evaluation dataset and store local evidence.",
    gateLabel: "Evaluation runner",
    key: "evaluation",
    owner: "Lecturer / Governance",
    title: "Run evaluation"
  },
  {
    description: "Record launch evidence without pretending approval is complete.",
    gateLabel: "Controlled launch execution",
    key: "launch",
    owner: "Project Lead",
    title: "Complete launch checklist"
  },
  {
    description: "Run KB regression evidence before any publish decision.",
    gateLabel: "KB review, test, publish, rollback",
    key: "kb",
    owner: "Lecturer / Developer",
    title: "Confirm KB readiness"
  },
  {
    description: "Confirm hosted admin protection or explicitly acknowledge local-only pilot mode.",
    gateLabel: "Admin access control",
    key: "admin",
    owner: "Technical Lead / Governance",
    title: "Admin protection"
  }
];

const launchSteps = [
  ["health", "Confirm app health"],
  ["moodle-placement", "Enable Moodle placement"],
  ["embed-test", "Verify iframe or LTI launch"],
  ["communications", "Send launch notices"],
  ["support-monitoring", "Monitor support channels"],
  ["smoke", "Run launch smoke test"],
  ["decision", "Log launch decision"]
];

const launchStatuses = ["in-progress", "passed", "blocked", "skipped", "not-started"];

export function Phase2GateWizard({ initialGate }: { initialGate: Gate }) {
  const [gate, setGate] = useState(initialGate);
  const [selected, setSelected] = useState<WizardStepKey>("evaluation");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Open a step and run the next safe action.");
  const [launchStepId, setLaunchStepId] = useState("health");
  const [launchStatus, setLaunchStatus] = useState("in-progress");
  const [launchOwner, setLaunchOwner] = useState("Project Lead");
  const [launchNote, setLaunchNote] = useState("");
  const [acceptedBy, setAcceptedBy] = useState("Project Lead");
  const [adminNote, setAdminNote] = useState(
    "Local Phase 2 verification only; hosted pilot still requires protected admin access."
  );

  const selectedStep = steps.find((step) => step.key === selected) ?? steps[0];
  const selectedGateItem = useMemo(
    () => gate.gateItems.find((item) => item.label === selectedStep.gateLabel),
    [gate.gateItems, selectedStep.gateLabel]
  );

  async function execute(payload: Record<string, string>) {
    setBusy(true);
    setMessage("Running selected gate action...");

    try {
      const response = await fetch("/api/admin/phase-2-gate/execute", {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const data = (await response.json()) as ExecuteResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Gate action failed.");
      }

      setGate(data.gate);
      setMessage(data.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gate action failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)_310px]">
      <aside className="rounded-lg border border-slate-200 bg-white p-3 shadow-soft">
        <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wide text-costaatt-teal">
          Gate steps
        </p>
        <div className="grid gap-2">
          {steps.map((step, index) => {
            const item = gate.gateItems.find((gateItem) => gateItem.label === step.gateLabel);
            const active = selected === step.key;

            return (
              <button
                className={`rounded-md border px-3 py-3 text-left transition ${
                  active
                    ? "border-costaatt-blue bg-blue-50"
                    : "border-slate-200 bg-white hover:border-costaatt-blue"
                }`}
                key={step.key}
                onClick={() => setSelected(step.key)}
                type="button"
              >
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Step {index + 1}
                </span>
                <span className="mt-1 block text-sm font-bold text-costaatt-navy">
                  {step.title}
                </span>
                <span className="mt-2 block">
                  <StatusBadge status={item?.status ?? "needs-review"} />
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <ActionPanel
        description={selectedStep.description}
        eyebrow={selectedStep.owner}
        status={selectedGateItem?.status ?? "needs-review"}
        title={selectedStep.title}
      >
        {selected === "evaluation" ? (
          <div className="grid gap-4">
            <p className="text-sm leading-6 text-slate-700">
              This runs the local evaluation dataset through the configured provider and stores
              pass/fail evidence. It does not use real student data.
            </p>
            <button
              className="w-fit rounded-md bg-costaatt-navy px-4 py-2 text-sm font-bold text-white hover:bg-costaatt-blue disabled:cursor-not-allowed disabled:opacity-60"
              disabled={busy}
              onClick={() => execute({ action: "run-evaluation" })}
              type="button"
            >
              Run evaluation now
            </button>
            <div className="flex flex-wrap gap-2">
              <SecondaryAction href="/evaluation-results">Review results</SecondaryAction>
              <SecondaryAction href="/evaluation-evidence-pack">Open evidence pack</SecondaryAction>
            </div>
          </div>
        ) : null}

        {selected === "launch" ? (
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Launch step">
                <select
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  onChange={(event) => setLaunchStepId(event.target.value)}
                  value={launchStepId}
                >
                  {launchSteps.map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Status">
                <select
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  onChange={(event) => setLaunchStatus(event.target.value)}
                  value={launchStatus}
                >
                  {launchStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <FormField label="Owner">
              <input
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                onChange={(event) => setLaunchOwner(event.target.value)}
                value={launchOwner}
              />
            </FormField>
            <FormField
              help="Use factual notes only. Do not record sponsor approval unless it was actually given."
              label="Evidence note"
            >
              <textarea
                className="min-h-24 rounded-md border border-slate-300 px-3 py-2 text-sm"
                onChange={(event) => setLaunchNote(event.target.value)}
                value={launchNote}
              />
            </FormField>
            <button
              className="w-fit rounded-md bg-costaatt-navy px-4 py-2 text-sm font-bold text-white hover:bg-costaatt-blue disabled:cursor-not-allowed disabled:opacity-60"
              disabled={busy}
              onClick={() =>
                execute({
                  action: "record-launch-step",
                  launchStepId,
                  note: launchNote,
                  owner: launchOwner,
                  status: launchStatus
                })
              }
              type="button"
            >
              Record launch step
            </button>
          </div>
        ) : null}

        {selected === "kb" ? (
          <div className="grid gap-4">
            <p className="text-sm leading-6 text-slate-700">
              This runs regression checks against the current KB release workflow and stores
              evidence for review. It will not publish course content automatically.
            </p>
            <button
              className="w-fit rounded-md bg-costaatt-navy px-4 py-2 text-sm font-bold text-white hover:bg-costaatt-blue disabled:cursor-not-allowed disabled:opacity-60"
              disabled={busy}
              onClick={() => execute({ action: "run-kb-regression" })}
              type="button"
            >
              Run KB regression
            </button>
            <SecondaryAction href="/kb-regression-publish">Review KB workflow</SecondaryAction>
          </div>
        ) : null}

        {selected === "admin" ? (
          <div className="grid gap-4">
            <p className="text-sm leading-6 text-slate-700">
              Hosted pilot access must be protected before students or staff use the
              system outside local development. The wizard never writes env files or
              displays secret values.
            </p>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Required hosted pilot variables
              </p>
              <pre className="mt-2 overflow-x-auto rounded-md bg-white p-3 text-xs text-slate-700">
{`ADMIN_ACCESS_TOKEN=change_me_for_hosted_pilot
ADMIN_SESSION_SECRET=change_me_for_signed_sessions`}
              </pre>
            </div>
            <FormField label="Acknowledged by">
              <input
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                onChange={(event) => setAcceptedBy(event.target.value)}
                value={acceptedBy}
              />
            </FormField>
            <FormField
              help="This is only for local Phase 2 evidence. Hosted pilot still needs real admin protection."
              label="Local-only note"
            >
              <textarea
                className="min-h-24 rounded-md border border-slate-300 px-3 py-2 text-sm"
                onChange={(event) => setAdminNote(event.target.value)}
                value={adminNote}
              />
            </FormField>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-md bg-costaatt-navy px-4 py-2 text-sm font-bold text-white hover:bg-costaatt-blue disabled:cursor-not-allowed disabled:opacity-60"
                disabled={busy}
                onClick={() =>
                  execute({
                    acceptedBy,
                    action: "mark-admin-local-only",
                    note: adminNote
                  })
                }
                type="button"
              >
                Acknowledge local-only mode
              </button>
              <SecondaryAction href="/admin-login">Open admin login</SecondaryAction>
            </div>
          </div>
        ) : null}
      </ActionPanel>

      <aside className="grid gap-4 content-start">
        <MetricTile
          detail={`${gate.summary.ready}/${gate.summary.total} gate items ready`}
          label="Phase 2 completion"
          value={gate.metrics.completion}
        />
        <div className="grid grid-cols-3 gap-2">
          <MetricTile label="Ready" value={gate.metrics.ready} />
          <MetricTile label="Review" value={gate.metrics.needsReview} />
          <MetricTile label="Blocked" value={gate.metrics.blocked} />
        </div>
        <ActionPanel
          description={selectedGateItem?.detail ?? "No evidence has been recorded for this step yet."}
          eyebrow="Selected evidence"
          status={selectedGateItem?.status ?? "needs-review"}
          title={selectedGateItem?.label ?? selectedStep.title}
        >
          <p className="text-sm leading-6 text-slate-700">Owner: {selectedGateItem?.owner ?? selectedStep.owner}</p>
          <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">{message}</p>
        </ActionPanel>
        <ActionPanel
          description={gate.phase3Entry}
          eyebrow="Phase 3 gate"
          status={gate.summary.complete ? "ready" : "locked"}
          title={gate.summary.complete ? "Ready for Phase 3 planning" : "Phase 3 remains locked"}
        >
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-costaatt-navy hover:border-costaatt-blue hover:text-costaatt-blue disabled:cursor-not-allowed disabled:opacity-60"
              disabled={busy}
              onClick={() => execute({ action: "refresh-gate" })}
              type="button"
            >
              Refresh gate
            </button>
            <PrimaryAction href="/phase-2-command-center">Command center</PrimaryAction>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Last generated {new Date(gate.generatedAt).toLocaleString()}.
          </p>
        </ActionPanel>
      </aside>
    </section>
  );
}
