import { PageShell } from "@/components/PageShell";
import {
  ReadinessLink,
  ReadinessMetric,
  ReadinessRecord
} from "@/components/ReadinessCards";
import { buildStudentSupportOperationsLayer } from "@/lib/outcomesOperationsLayers";

export default async function SupportCaseQueuePage() {
  const layer = await buildStudentSupportOperationsLayer();

  return (
    <PageShell
      eyebrow="Student Support Operations"
      title="Support case queue"
      description="A practical support queue grouped by LMS issue, lecturer follow-up, content gap, technical issue, and academic integrity concern."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-5">
          {Object.entries(layer.metrics).map(([label, value]) => (
            <ReadinessMetric key={label} label={label} value={value} />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ReadinessLink href="/api/admin/support-operations-pack.html" label="Open Support Ops HTML Pack" />
          <ReadinessLink href="/support-response-templates" label="Response Templates" />
        </div>
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {layer.caseQueue.length > 0 ? (
          layer.caseQueue.map((item) => (
            <ReadinessRecord key={item.label} {...item} />
          ))
        ) : (
          <ReadinessRecord
            detail="No active support cases are currently queued from pilot feedback."
            label="No active queue"
            owner="Pilot Review Team"
            status="ready"
          />
        )}
      </section>
    </PageShell>
  );
}
