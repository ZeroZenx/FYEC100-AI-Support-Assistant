import { PageShell } from "@/components/PageShell";
import {
  ReadinessLink,
  ReadinessMetric,
  ReadinessRecord
} from "@/components/ReadinessCards";
import { buildEnterpriseHardeningLayer } from "@/lib/outcomesOperationsLayers";

export default async function ProductionAuthPlanPage() {
  const layer = await buildEnterpriseHardeningLayer();

  return (
    <PageShell
      eyebrow="Enterprise Hardening"
      title="Production authentication plan"
      description="A production-grade authentication plan covering Moodle/LTI trusted launches, admin authentication, role authorization, service accounts, sessions, and key rotation."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {Object.entries(layer.metrics).map(([label, value]) => (
            <ReadinessMetric key={label} label={label} value={value} />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ReadinessLink href="/api/admin/enterprise-hardening-pack.html" label="Open Hardening HTML Pack" />
          <ReadinessLink href="/production-readiness-gate" label="Readiness Gate" />
        </div>
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {layer.productionAuth.map((item) => (
          <ReadinessRecord key={item.label} {...item} />
        ))}
      </section>
    </PageShell>
  );
}
