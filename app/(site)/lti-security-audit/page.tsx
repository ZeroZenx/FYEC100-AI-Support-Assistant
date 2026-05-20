import { PageShell } from "@/components/PageShell";
import { ReadinessList } from "@/components/ReadinessCards";
import { buildLtiTechnicalLayer } from "@/lib/readinessLayers";

export default async function LtiSecurityAuditPage() {
  const layer = await buildLtiTechnicalLayer();

  return (
    <PageShell
      eyebrow="LTI Technical"
      title="LTI security and audit pack"
      description="Launch audit, validation failure, replay protection, trust-boundary, and key rotation planning for future enterprise Moodle LTI."
    >
      <ReadinessList title="Security and Audit Notes" items={layer.auditNotes} />
    </PageShell>
  );
}
