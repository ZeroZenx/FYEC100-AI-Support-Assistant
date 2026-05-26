import { PageShell } from "@/components/PageShell";
import {
  ActionPanel,
  DataTable,
  MetricTile,
  PrimaryAction,
  SecondaryAction,
  StatusBadge
} from "@/components/ui/System";
import { buildPhase2CompletionGate, type Phase2GateItem } from "@/lib/phase2Completion";

export default async function Phase2CommandCenterPage() {
  const gate = await buildPhase2CompletionGate();

  return (
    <PageShell
      eyebrow="Phase 2 Completion"
      title="Phase 2 command center"
      description="A task-first workspace for completing the enterprise pilot layer and deciding when the system is ready to move into Phase 3."
      actions={
        <>
          <PrimaryAction href="/phase-2-gate-wizard">Open Gate Wizard</PrimaryAction>
          <SecondaryAction href="/reports">Report library</SecondaryAction>
        </>
      }
    >
      <section className="grid gap-3 md:grid-cols-5">
        <MetricTile label="Ready" value={gate.metrics.ready} />
        <MetricTile label="Needs review" value={gate.metrics.needsReview} />
        <MetricTile label="Blocked" value={gate.metrics.blocked} />
        <MetricTile label="Gate items" value={gate.metrics.total} />
        <MetricTile label="Completion" value={gate.metrics.completion} />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <ActionPanel
          actionHref="/phase-2-gate-wizard"
          actionLabel="Open Gate Wizard"
          description={gate.phase3Entry}
          eyebrow="Go / No-Go"
          status={gate.summary.complete ? "ready" : "needs-review"}
          title={gate.summary.complete ? "Phase 2 pilot gate is close" : "Phase 2 still needs review"}
        >
          <p className="text-sm leading-6 text-slate-700">
            The gate favors real pilot readiness over more reports: Moodle access,
            course-aware chat, support handoff, KB release control, provider
            testing, archive export, admin access, and smoke verification.
          </p>
        </ActionPanel>

        <ActionPanel
          actionHref="/student-prompt-starters"
          actionLabel="Open Phase 3 learning start"
          description="Phase 3 should focus on learning value: study planning, responsible reflection support, proactive nudges, multi-course routing, and quality evaluation."
          eyebrow="Next Phase"
          status={gate.summary.complete ? "ready" : "planned"}
          title="Phase 3 entry path"
        />
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-costaatt-navy">Acceptance gate</h2>
            <p className="mt-1 text-sm text-slate-600">
              These are the concrete items that make Phase 2 complete enough for a controlled Moodle pilot.
            </p>
          </div>
          <StatusBadge status={gate.summary.complete ? "ready" : "needs-review"} />
        </div>
        <DataTable<Phase2GateItem>
          columns={[
            { key: "area", label: "Area" },
            { key: "label", label: "Gate item" },
            {
              key: "status",
              label: "Status",
              render: (row) => <StatusBadge status={row.status} />
            },
            { key: "owner", label: "Owner" },
            { key: "detail", label: "Evidence" },
            {
              key: "actionHref",
              label: "Action",
              render: (row) => (
                <SecondaryAction href={row.actionHref}>{row.actionLabel}</SecondaryAction>
              )
            }
          ]}
          rows={gate.gateItems}
        />
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-bold text-costaatt-navy">Workspaces that do real work</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          These are the primary places staff should use. Reports remain available,
          but they are no longer the main way to operate the pilot.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {gate.actions.map((action) => (
            <ActionPanel
              actionHref={action.href}
              actionLabel="Open"
              description={action.description}
              eyebrow={action.owner}
              key={action.href}
              title={action.label}
            />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
