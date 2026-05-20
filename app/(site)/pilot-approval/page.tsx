import { PageShell } from "@/components/PageShell";
import { ReadinessLink, ReadinessRecord } from "@/components/ReadinessCards";
import { buildPilotGovernanceLayer } from "@/lib/readinessLayers";

export default async function PilotApprovalPage() {
  const governance = await buildPilotGovernanceLayer();

  return (
    <PageShell
      eyebrow="Pilot Governance"
      title="Pilot approval workflow"
      description="Approval status by project owner before the controlled FYEC100 Moodle pilot expands to students."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <ReadinessLink href="/api/admin/governance-pack.html" label="Open Governance HTML Pack" />
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {governance.approvals.map((item) => (
          <ReadinessRecord key={item.label} {...item} />
        ))}
      </section>
    </PageShell>
  );
}
