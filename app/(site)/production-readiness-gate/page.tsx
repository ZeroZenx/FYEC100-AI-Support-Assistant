import { PageShell } from "@/components/PageShell";
import { ReadinessLink, ReadinessRecord } from "@/components/ReadinessCards";
import { buildEnterpriseHardeningLayer } from "@/lib/outcomesOperationsLayers";

export default async function ProductionReadinessGatePage() {
  const layer = await buildEnterpriseHardeningLayer();

  return (
    <PageShell
      eyebrow="Enterprise Hardening"
      title="Production readiness gate"
      description="A single enterprise gate for authentication, storage, privacy, monitoring, support model, rollback, and Moodle/LTI validation approval."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <ReadinessLink href="/api/admin/enterprise-hardening-pack.html" label="Open Hardening HTML Pack" />
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {layer.readinessGate.map((item) => (
          <ReadinessRecord key={item.label} {...item} />
        ))}
      </section>
    </PageShell>
  );
}
