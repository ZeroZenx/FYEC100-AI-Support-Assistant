import { PageShell } from "@/components/PageShell";
import {
  ReadinessLink,
  ReadinessMetric,
  ReadinessRecord
} from "@/components/ReadinessCards";
import { buildPilotOutcomesLayer } from "@/lib/outcomesOperationsLayers";

export default async function PilotOutcomesPage() {
  const layer = await buildPilotOutcomesLayer();

  return (
    <PageShell
      eyebrow="Pilot Analytics"
      title="Pilot outcomes dashboard"
      description="A sponsor-friendly dashboard showing usefulness, support demand, Moodle launch activity, content gaps, academic integrity boundary events, and readiness to scale."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {Object.entries(layer.metrics).map(([label, value]) => (
            <ReadinessMetric key={label} label={label} value={value} />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ReadinessLink href="/api/admin/pilot-outcomes-pack.html" label="Open Outcomes HTML Pack" />
          <ReadinessLink href="/pilot-closeout" label="Pilot Closeout" />
        </div>
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {layer.dashboard.map((item) => (
          <ReadinessRecord key={item.label} {...item} />
        ))}
      </section>
    </PageShell>
  );
}
