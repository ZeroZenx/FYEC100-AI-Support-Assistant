import { PageShell } from "@/components/PageShell";
import {
  ReadinessLink,
  ReadinessMetric,
  ReadinessRecord
} from "@/components/ReadinessCards";
import { buildDeploymentAcceptanceChecklist } from "@/lib/readinessLayers";

export default async function DeploymentAcceptancePage() {
  const checklist = await buildDeploymentAcceptanceChecklist();

  return (
    <PageShell
      eyebrow="Windows VM Production"
      title="Deployment acceptance checklist"
      description="A single sign-off checklist for COSTAATT IT and LMS before opening the controlled FYEC100 Moodle pilot."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-4">
          <ReadinessMetric label="Ready" value={checklist.summary.ready} />
          <ReadinessMetric label="Review" value={checklist.summary.review} />
          <ReadinessMetric label="Watch" value={checklist.summary.watch} />
          <ReadinessMetric label="Blocked" value={checklist.summary.blocked} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ReadinessLink href="/api/admin/deployment-acceptance.html" label="Open HTML Export" />
          <ReadinessLink href="/windows-vm-readiness" label="Windows Readiness" />
        </div>
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {checklist.items.map((item) => (
          <ReadinessRecord key={item.label} {...item} />
        ))}
      </section>
    </PageShell>
  );
}
