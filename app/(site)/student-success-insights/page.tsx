import { PageShell } from "@/components/PageShell";
import { ReadinessLink, ReadinessRecord } from "@/components/ReadinessCards";
import { buildPilotOutcomesLayer } from "@/lib/outcomesOperationsLayers";

export default async function StudentSuccessInsightsPage() {
  const layer = await buildPilotOutcomesLayer();

  return (
    <PageShell
      eyebrow="Pilot Analytics"
      title="Student success insights pack"
      description="A focused view of common student needs, study support themes, LMS navigation pain points, responsible AI needs, and recommended interventions."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <ReadinessLink href="/api/admin/pilot-outcomes-pack.html" label="Open Outcomes HTML Pack" />
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {layer.successInsights.map((item) => (
          <ReadinessRecord key={item.label} {...item} />
        ))}
      </section>
    </PageShell>
  );
}
