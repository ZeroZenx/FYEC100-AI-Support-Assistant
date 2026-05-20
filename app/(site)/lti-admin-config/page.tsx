import { PageShell } from "@/components/PageShell";
import { buildLtiTechnicalLayer } from "@/lib/readinessLayers";

export default async function LtiAdminConfigPage() {
  const layer = await buildLtiTechnicalLayer();

  return (
    <PageShell
      eyebrow="LTI Technical"
      title="LTI admin configuration"
      description="Tool URLs, redirect URLs, JWKS URL, and required Moodle platform values for future LTI 1.3 configuration."
    >
      <section className="grid gap-4 lg:grid-cols-2">
        {layer.adminConfiguration.map(([label, value]) => (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft" key={label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 break-words font-mono text-sm text-costaatt-navy">{value}</p>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
