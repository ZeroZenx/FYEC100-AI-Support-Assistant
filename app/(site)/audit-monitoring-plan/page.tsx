import { PageShell } from "@/components/PageShell";
import { ReadinessLink, ReadinessRecord } from "@/components/ReadinessCards";
import { buildEnterpriseHardeningLayer } from "@/lib/outcomesOperationsLayers";

export default async function AuditMonitoringPlanPage() {
  const layer = await buildEnterpriseHardeningLayer();

  return (
    <PageShell
      eyebrow="Enterprise Hardening"
      title="Audit logging and monitoring plan"
      description="A production planning view for admin actions, launch events, support routing, provider errors, security events, and operational alerts."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <ReadinessLink href="/api/admin/enterprise-hardening-pack.html" label="Open Hardening HTML Pack" />
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {layer.auditMonitoring.map((item) => (
          <ReadinessRecord key={item.label} {...item} />
        ))}
      </section>
    </PageShell>
  );
}
