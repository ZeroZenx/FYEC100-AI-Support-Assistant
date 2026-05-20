import { PageShell } from "@/components/PageShell";
import { ReadinessRecord } from "@/components/ReadinessCards";
import { buildPilotGovernanceLayer } from "@/lib/readinessLayers";

export default async function RiskRegisterPage() {
  const governance = await buildPilotGovernanceLayer();

  return (
    <PageShell
      eyebrow="Pilot Governance"
      title="Pilot risk register"
      description="A structured risk register for pilot categories, owners, mitigation notes, current status, and escalation triggers."
    >
      <section className="grid gap-4 lg:grid-cols-2">
        {governance.risks.map((item) => (
          <ReadinessRecord key={item.label} {...item} />
        ))}
      </section>
    </PageShell>
  );
}
