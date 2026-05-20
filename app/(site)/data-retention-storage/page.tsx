import { PageShell } from "@/components/PageShell";
import { ReadinessLink, ReadinessRecord } from "@/components/ReadinessCards";
import { buildEnterpriseHardeningLayer } from "@/lib/outcomesOperationsLayers";

export default async function DataRetentionStoragePage() {
  const layer = await buildEnterpriseHardeningLayer();

  return (
    <PageShell
      eyebrow="Enterprise Hardening"
      title="Data retention and storage decision pack"
      description="A decision pack for what remains file-based, what moves to approved storage, retention periods, export, deletion, and access controls."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <ReadinessLink href="/api/admin/enterprise-hardening-pack.html" label="Open Hardening HTML Pack" />
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {layer.dataRetention.map((item) => (
          <ReadinessRecord key={item.label} {...item} />
        ))}
      </section>
    </PageShell>
  );
}
