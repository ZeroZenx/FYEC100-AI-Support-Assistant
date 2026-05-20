import { PageShell } from "@/components/PageShell";
import { ReadinessLink, ReadinessList } from "@/components/ReadinessCards";
import { buildPilotGovernanceLayer } from "@/lib/readinessLayers";

export default async function PrivacyDataHandlingPage() {
  const governance = await buildPilotGovernanceLayer();

  return (
    <PageShell
      eyebrow="Pilot Governance"
      title="Privacy and data handling"
      description="Plain-language staff guidance for what the FYEC100 pilot captures, does not capture, where records live, access expectations, retention, export, and cleanup."
    >
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <ReadinessLink href="/api/admin/governance-pack.html" label="Open Governance HTML Pack" />
      </section>
      <ReadinessList title="Privacy and Data Handling Notes" items={governance.privacyNotes} />
    </PageShell>
  );
}
