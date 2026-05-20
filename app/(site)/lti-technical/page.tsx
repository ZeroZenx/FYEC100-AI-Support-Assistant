import { PageShell } from "@/components/PageShell";
import { ReadinessLink, ReadinessList } from "@/components/ReadinessCards";
import { buildLtiTechnicalLayer } from "@/lib/readinessLayers";

export default async function LtiTechnicalPage() {
  const layer = await buildLtiTechnicalLayer();

  return (
    <PageShell
      eyebrow="LTI Technical"
      title="LTI OIDC and launch validation"
      description="Technical implementation plan for OIDC login, launch validation, trusted Moodle context mapping, admin configuration, and LTI audit planning."
    >
      <section className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-xl font-bold text-costaatt-navy">Current boundary</h2>
        <p className="mt-2 leading-7 text-slate-700">{layer.readiness.trustBoundary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <ReadinessLink href="/api/admin/lti-technical-pack.html" label="Open LTI Technical HTML Pack" />
          <ReadinessLink href="/lti-admin-config" label="LTI Admin Config" />
        </div>
      </section>
      <section className="grid gap-5 lg:grid-cols-2">
        <ReadinessList title="OIDC and Launch Flow" items={layer.implementation} />
        <ReadinessList title="Launch Validation" items={layer.validation} />
      </section>
    </PageShell>
  );
}
