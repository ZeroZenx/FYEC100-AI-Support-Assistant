import { PageShell } from "@/components/PageShell";
import { ReadinessList } from "@/components/ReadinessCards";
import { buildPilotGovernanceLayer } from "@/lib/readinessLayers";

export default async function ChangeControlPage() {
  const governance = await buildPilotGovernanceLayer();

  return (
    <PageShell
      eyebrow="Pilot Governance"
      title="Pilot change control log"
      description="Change-control guidance for knowledge base updates, app changes, Moodle placement, environment changes, approvals, and release-note links."
    >
      <ReadinessList title="Change Control Rules" items={governance.changeLog} />
    </PageShell>
  );
}
